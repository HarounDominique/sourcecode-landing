import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── Env vars (set in Supabase dashboard → Edge Functions → Secrets) ──────────
const LEMON_SQUEEZY_WEBHOOK_SECRET = Deno.env.get("LEMON_SQUEEZY_WEBHOOK_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const PRO_FEATURES = ["impact", "review-pr", "generate-tests", "mcp"];

// ── HMAC-SHA256 signature verification ──────────────────────────────────────
async function verifySignature(rawBody: string, signature: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(LEMON_SQUEEZY_WEBHOOK_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const sigBytes = hexToBytes(signature);
  return crypto.subtle.verify("HMAC", key, sigBytes, encoder.encode(rawBody));
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

// ── License key generator ────────────────────────────────────────────────────
function generateLicenseKey(): string {
  // Format: SC-XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX
  const seg = () =>
    Math.random().toString(36).slice(2, 10).toUpperCase().padEnd(8, "X");
  return `SC-${seg()}-${seg()}-${seg()}-${seg()}`;
}

// ── Main handler ─────────────────────────────────────────────────────────────
serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("X-Signature") ?? "";

  // Validate signature
  const valid = await verifySignature(rawBody, signature);
  if (!valid) {
    console.error("Invalid webhook signature");
    return new Response("Unauthorized", { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response("Bad request: invalid JSON", { status: 400 });
  }

  const meta = payload.meta as Record<string, unknown>;
  const data = payload.data as Record<string, unknown>;
  const eventName = meta?.event_name as string;
  const eventId = meta?.event_id as string | undefined;

  // Only process relevant events
  const HANDLED_EVENTS = [
    "order_created",
    "subscription_created",
    "subscription_updated",
    "subscription_resumed",
  ];
  if (!HANDLED_EVENTS.includes(eventName)) {
    return new Response(JSON.stringify({ received: true, skipped: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const attributes = data?.attributes as Record<string, unknown>;
  const email = (attributes?.user_email ?? attributes?.user_name) as string;

  if (!email || !email.includes("@")) {
    console.error("No valid email in payload", { eventName, attributes });
    return new Response("Bad request: no email", { status: 400 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // ── Idempotency: skip if event already processed ─────────────────────────
  if (eventId) {
    const { data: existingEvent } = await supabase
      .from("license_events")
      .select("id")
      .eq("event_id", eventId)
      .maybeSingle();

    if (existingEvent) {
      return new Response(JSON.stringify({ received: true, duplicate: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // ── Upsert user ──────────────────────────────────────────────────────────
  // Fetch existing user first to preserve license_key if already set
  const { data: existingUser } = await supabase
    .from("users")
    .select("id, license_key")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  const licenseKey = existingUser?.license_key ?? generateLicenseKey();

  const userPayload = {
    email: email.toLowerCase(),
    plan: "pro",
    status: "active",
    features: PRO_FEATURES,
    license_key: licenseKey,
    updated_at: new Date().toISOString(),
  };

  const { data: upsertedUser, error: upsertError } = await supabase
    .from("users")
    .upsert(userPayload, { onConflict: "email", ignoreDuplicates: false })
    .select("id")
    .single();

  if (upsertError) {
    console.error("Failed to upsert user", upsertError);
    return new Response(JSON.stringify({ error: "DB error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const userId = upsertedUser?.id ?? existingUser?.id;

  // ── Insert license event ─────────────────────────────────────────────────
  const { error: eventError } = await supabase.from("license_events").insert({
    user_id: userId,
    event_type: eventName,
    event_id: eventId ?? null,
    payload,
  });

  if (eventError) {
    // Non-fatal — log but don't fail the webhook
    console.error("Failed to insert license_event", eventError);
  }

  console.log(`Processed ${eventName} for ${email}`);

  return new Response(JSON.stringify({ received: true, email }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
