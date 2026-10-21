/*
# Add updated_at column for conflict-aware upsert sync

## Purpose
The cloud sync previously used delete-all-then-insert, which loses row identity
and can clobber changes made on another device. Adding `updated_at` lets the
client upsert per row and detect newer remote versions.

## Changes
- Adds `updated_at` column (timestamptz, defaults to now()) to `user_subjects`.
- Creates a trigger `set_user_subjects_updated_at` that bumps `updated_at` on
  every UPDATE.
- Grants the existing authenticated policies continued access (no policy changes).

## Security
- No new policies needed. Existing RLS policies remain in effect.
- The trigger function is SECURITY DEFINER (runs as owner) but only touches
  the row being updated, which the caller already owns under existing policies.
*/

ALTER TABLE user_subjects
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_user_subjects_updated_at
  ON user_subjects (user_id, updated_at DESC);

DROP TRIGGER IF EXISTS trg_set_user_subjects_updated_at ON user_subjects;
DROP FUNCTION IF EXISTS set_user_subjects_updated_at();

CREATE FUNCTION set_user_subjects_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_set_user_subjects_updated_at
  BEFORE UPDATE ON user_subjects
  FOR EACH ROW
  EXECUTE FUNCTION set_user_subjects_updated_at();
