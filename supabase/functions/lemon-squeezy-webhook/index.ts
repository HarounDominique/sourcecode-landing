import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const LEMON_SQUEEZY_WEBHOOK_SECRET = Deno.env.get("LEMON_SQUEEZY_WEBHOOK_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const PRO_FEATURES = ["impact", "review-pr", "generate-tests", "mcp"];

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

function generateLicenseKey(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
  return `SC-${hex.slice(0, 8)}-${hex.slice(8, 16)}-${hex.slice(16, 24)}-${hex.slice(24, 32)}`;
}

// Maps Lemon Squeezy subscription status → our DB status fields
function mapStatus(lsStatus: string): { userStatus: string; subStatus: string } {
  switch (lsStatus) {
    case "active":
    case "past_due":
    case "on_trial":
      return { userStatus: "active", subStatus: "active" };
    case "cancelled":
      // Grace period: user keeps access until period end
      return { userStatus: "active", subStatus: "cancelled" };
    case "expired":
    case "unpaid":
      return { userStatus: "inactive", subStatus: "expired" };
    default:
      return { userStatus: "active", subStatus: "active" };
  }
}

const HANDLED_EVENTS = new Set([
  "order_created",
  "subscription_created",
  "subscription_updated",
  "subscription_resumed",
  "subscription_cancelled",
  "subscription_expired",
  "subscription_payment_failed",
  "subscription_payment_success",
]);

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("X-Signature") ?? "";

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

  if (!HANDLED_EVENTS.has(eventName)) {
    return new Response(JSON.stringify({ received: true, skipped: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const attributes = data?.attributes as Record<string, unknown>;
  const email = (attributes?.user_email ?? attributes?.customer_email) as string;

  if (!email || !email.includes("@")) {
    console.error("No valid email in payload", { eventName });
    return new Response("Bad request: no email", { status: 400 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Idempotency: skip already-processed events
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

  // Parse subscription period end from LS payload
  const renewsAt = attributes?.renews_at as string | null ?? null;
  const endsAt = attributes?.ends_at as string | null ?? null;
  const currentPeriodEnd = renewsAt ?? endsAt ?? null;

  // Determine status from event type and LS subscription status field
  const lsSubStatus = attributes?.status as string | undefined;

  let userStatus = "active";
  let subStatus = "active";

  if (eventName === "subscription_cancelled") {
    userStatus = "active"; // grace period until expiry
    subStatus = "cancelled";
  } else if (eventName === "subscription_expired") {
    userStatus = "inactive";
    subStatus = "expired";
  } else if (eventName === "subscription_updated" && lsSubStatus) {
    const mapped = mapStatus(lsSubStatus);
    userStatus = mapped.userStatus;
    subStatus = mapped.subStatus;
  }
  // order_created, subscription_created, subscription_resumed, payment_success → active

  // Fetch existing user to preserve license_key
  const { data: existingUser } = await supabase
    .from("users")
    .select("id, license_key")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  const licenseKey = existingUser?.license_key ?? generateLicenseKey();
  const isNewUser = !existingUser;

  const userPayload: Record<string, unknown> = {
    email: email.toLowerCase(),
    plan: userStatus === "inactive" ? "free" : "pro",
    status: userStatus,
    features: userStatus === "inactive" ? [] : PRO_FEATURES,
    license_key: licenseKey,
    updated_at: new Date().toISOString(),
  };

  // Set upgraded_at only when activating for the first time
  if (isNewUser || (userStatus === "active" && !existingUser)) {
    userPayload.upgraded_at = new Date().toISOString();
  }

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

  await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      provider: "lemonsqueezy",
      status: subStatus,
      current_period_end: currentPeriodEnd,
    },
    { onConflict: "user_id" },
  );

  const { error: eventError } = await supabase.from("license_events").insert({
    user_id: userId,
    event_type: eventName,
    event_id: eventId ?? null,
    payload,
  });

  if (eventError) {
    console.error("Failed to insert license_event", eventError);
  }

  console.log(`Processed ${eventName} for ${email} → user:${userStatus} sub:${subStatus}`);

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
