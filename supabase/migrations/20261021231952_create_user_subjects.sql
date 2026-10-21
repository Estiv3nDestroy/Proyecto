/*
# Create user_subjects table — cloud sync for NotaMínima

## Purpose
NotaMínima is a grade calculator app where each authenticated student saves
their subjects (materias) with academic configuration and grades. The table
`user_subjects` stores these so they sync between devices (phone ↔ laptop).

## 1. New Tables

### `user_subjects`
- `id` (text, primary key) — UUID generated client-side via crypto.randomUUID()
- `user_id` (uuid, not null, defaults to auth.uid()) — owner; references auth.users with cascade delete
- `name` (text, not null) — subject name (e.g. "Cálculo Diferencial")
- `config` (jsonb, not null) — academic config: max grade, min passing grade, cut weights, assessments
- `grades` (jsonb, not null) — grades record: { corte1, corte2, corte3 } where each is number | null
- `created_at` (timestamptz, not null, defaults now()) — row creation timestamp

## 2. Security — Row Level Security

RLS is ENABLED on `user_subjects`. Four separate policies (one per CRUD verb),
all scoped `TO authenticated` with ownership checks via `auth.uid() = user_id`.

- SELECT: users can only read their own subjects
- INSERT: users can only insert rows they own (user_id must match their session)
- UPDATE: users can only update their own subjects
- DELETE: users can only delete their own subjects

The `user_id` column has `DEFAULT auth.uid()` so client inserts that omit
`user_id` still satisfy the INSERT WITH CHECK policy.

## 3. Indexes

- `idx_user_subjects_user_id` on `user_id` — speeds up per-user queries
  (the app always filters by user_id when downloading subjects)

## 4. Important Notes

1. The app generates `id` client-side (crypto.randomUUID) and passes it
   explicitly in inserts, so the PK is `text` not `uuid`.
2. The app's upload strategy is delete-all-then-insert for simplicity, so
   no upsert conflict handling is needed at the DB level.
3. Email confirmation is OFF (Supabase default) — signUp creates a session
   immediately, so auth.uid() is available right after registration.
*/

CREATE TABLE IF NOT EXISTS user_subjects (
  id          text PRIMARY KEY,
  user_id     uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL,
  config      jsonb NOT NULL,
  grades      jsonb NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_subjects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_subjects" ON user_subjects;
CREATE POLICY "select_own_subjects"
  ON user_subjects FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_subjects" ON user_subjects;
CREATE POLICY "insert_own_subjects"
  ON user_subjects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_subjects" ON user_subjects;
CREATE POLICY "update_own_subjects"
  ON user_subjects FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_subjects" ON user_subjects;
CREATE POLICY "delete_own_subjects"
  ON user_subjects FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_subjects_user_id ON user_subjects (user_id);
