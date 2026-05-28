-- Migration: 002_complete_monetization_schema.sql
-- Adds missing columns, subscriptions table, indexes, RLS

-- ── subscriptions table ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID        NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  provider           TEXT        NOT NULL DEFAULT 'lemonsqueezy',
  status             TEXT        NOT NULL DEFAULT 'active',
  current_period_end TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON subscriptions(status);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_full_access_subscriptions" ON subscriptions;
CREATE POLICY "service_role_full_access_subscriptions"
  ON subscriptions FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS subscriptions_updated_at ON subscriptions;
CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Add missing columns to users ─────────────────────────────────────────────
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS upgraded_at TIMESTAMPTZ;

-- ── Add index on license_key for fast CLI validation lookups ─────────────────
CREATE INDEX IF NOT EXISTS users_license_key_idx ON users(license_key);
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);

-- ── Add updated_at column to subscriptions if missing from trigger above ─────
-- (update_updated_at function created in migration 001)

-- ── Ensure license_events has correct nullable event_id for non-LS events ────
-- event_id UNIQUE allows NULL (multiple NULL values are allowed in PG)
-- No change needed — already correct in migration 001
