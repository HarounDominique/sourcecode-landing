-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: 001_add_pro_schema.sql
-- Adds Pro plan columns to existing users table
-- Creates license_events table
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Extend existing users table ──────────────────────────────────────────────
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS plan        TEXT        NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS status      TEXT        NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS features    TEXT[]      NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS license_key TEXT        UNIQUE,
  ADD COLUMN IF NOT EXISTS created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at  TIMESTAMPTZ NOT NULL DEFAULT now();

-- Ensure email is unique (required for upsert ON CONFLICT email)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'users_email_key' AND conrelid = 'users'::regclass
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);
  END IF;
END$$;

-- ── license_events table ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS license_events (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT        NOT NULL,
  event_id   TEXT        UNIQUE,       -- Lemon Squeezy event ID for idempotency
  payload    JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS license_events_user_id_idx ON license_events(user_id);
CREATE INDEX IF NOT EXISTS license_events_event_id_idx ON license_events(event_id);

-- ── Row-Level Security ───────────────────────────────────────────────────────
-- users: only service_role can write; anon cannot read license_key
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies before recreating
DROP POLICY IF EXISTS "service_role_full_access_users" ON users;
CREATE POLICY "service_role_full_access_users"
  ON users FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- license_events: service_role only
ALTER TABLE license_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_full_access_license_events" ON license_events;
CREATE POLICY "service_role_full_access_license_events"
  ON license_events FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- ── Auto-update updated_at ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS users_updated_at ON users;
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
