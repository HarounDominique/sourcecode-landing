import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: CORS_HEADERS },
    );
  }

  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      { status: 400, headers: CORS_HEADERS },
    );
  }

  const email = (body.email ?? "").trim().toLowerCase();

  if (!email || !email.includes("@")) {
    return new Response(
      JSON.stringify({ error: "Valid email required" }),
      { status: 400, headers: CORS_HEADERS },
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data: user, error } = await supabase
    .from("users")
    .select("id, license_key, status")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    console.error("DB error", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: CORS_HEADERS },
    );
  }

  // Always return generic error — don't reveal whether email exists
  if (!user || user.status !== "active") {
    return new Response(
      JSON.stringify({ error: "No active license found for this email" }),
      { status: 404, headers: CORS_HEADERS },
    );
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status, current_period_end")
    .eq("user_id", user.id)
    .in("status", ["active", "cancelled"])
    .maybeSingle();

  if (!subscription) {
    return new Response(
      JSON.stringify({ error: "No active license found for this email" }),
      { status: 404, headers: CORS_HEADERS },
    );
  }

  // Cancelled with expired grace period
  if (subscription.status === "cancelled" && subscription.current_period_end) {
    const periodEnd = new Date(subscription.current_period_end);
    if (periodEnd < new Date()) {
      return new Response(
        JSON.stringify({ error: "No active license found for this email" }),
        { status: 404, headers: CORS_HEADERS },
      );
    }
  }

  return new Response(
    JSON.stringify({ license_key: user.license_key }),
    { status: 200, headers: CORS_HEADERS },
  );
});
