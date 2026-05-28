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

  let body: { license_key?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      { status: 400, headers: CORS_HEADERS },
    );
  }

  const licenseKey = (body.license_key ?? "").trim().toUpperCase();

  if (!licenseKey || !licenseKey.startsWith("SC-")) {
    return new Response(
      JSON.stringify({ error: "Valid license_key required" }),
      { status: 400, headers: CORS_HEADERS },
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data: user, error } = await supabase
    .from("users")
    .select("id, email, plan, status, features")
    .eq("license_key", licenseKey)
    .maybeSingle();

  if (error) {
    console.error("DB error", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: CORS_HEADERS },
    );
  }

  if (!user) {
    return new Response(
      JSON.stringify({ valid: false, error: "License not found" }),
      { status: 404, headers: CORS_HEADERS },
    );
  }

  if (user.status !== "active") {
    return new Response(
      JSON.stringify({ valid: false, error: "License inactive" }),
      { status: 403, headers: CORS_HEADERS },
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
      JSON.stringify({ valid: false, error: "No active subscription" }),
      { status: 403, headers: CORS_HEADERS },
    );
  }

  // Cancelled subscriptions: block if period ended or period_end unknown
  if (subscription.status === "cancelled") {
    if (!subscription.current_period_end || new Date(subscription.current_period_end) < new Date()) {
      return new Response(
        JSON.stringify({ valid: false, error: "Subscription expired" }),
        { status: 403, headers: CORS_HEADERS },
      );
    }
  }

  return new Response(
    JSON.stringify({
      valid: true,
      plan: user.plan,
      features: user.features ?? [],
      email: user.email,
    }),
    { status: 200, headers: CORS_HEADERS },
  );
});
