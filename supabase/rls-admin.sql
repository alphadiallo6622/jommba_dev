-- supabase/rls-admin.sql
-- Row Level Security policies for Jommba
-- Run this in the Supabase SQL editor after creating your tables.

-- ─────────────────────────────────────────────────────────────────────────────
-- Helper: admin check via Supabase service role (bypasses RLS by default).
-- For custom RLS policies we use a JWT claim "role" = 'admin'.
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable RLS on all user-facing tables
ALTER TABLE IF EXISTS public.profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages   ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.likes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reports    ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.boosts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subscriptions ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────────────
-- PROFILES
-- ─────────────────────────────────────────────────────────────────────────────

-- Users can read validated profiles (status = 'validated')
CREATE POLICY "public_can_read_validated_profiles"
  ON public.profiles FOR SELECT
  USING (status = 'validated');

-- Users can read and update their own profile
CREATE POLICY "owner_can_select_own_profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "owner_can_update_own_profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Admin can do everything (service role bypasses RLS; this covers anon admin JWT)
CREATE POLICY "admin_full_access_profiles"
  ON public.profiles FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- ─────────────────────────────────────────────────────────────────────────────
-- MESSAGES
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "users_can_read_own_messages"
  ON public.messages FOR SELECT
  USING (
    auth.uid() = sender_id OR
    auth.uid() = receiver_id
  );

CREATE POLICY "users_can_insert_messages"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "admin_full_access_messages"
  ON public.messages FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- ─────────────────────────────────────────────────────────────────────────────
-- LIKES
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "users_can_manage_own_likes"
  ON public.likes FOR ALL
  USING (auth.uid() = sender_id)
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "users_can_see_likes_received"
  ON public.likes FOR SELECT
  USING (auth.uid() = receiver_id);

CREATE POLICY "admin_full_access_likes"
  ON public.likes FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- ─────────────────────────────────────────────────────────────────────────────
-- REPORTS (signalements)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "users_can_create_reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "users_can_read_own_reports"
  ON public.reports FOR SELECT
  USING (auth.uid() = reporter_id);

CREATE POLICY "admin_full_access_reports"
  ON public.reports FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- ─────────────────────────────────────────────────────────────────────────────
-- BOOSTS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "users_can_read_own_boosts"
  ON public.boosts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "admin_full_access_boosts"
  ON public.boosts FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- ─────────────────────────────────────────────────────────────────────────────
-- SUBSCRIPTIONS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "users_can_read_own_subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "admin_full_access_subscriptions"
  ON public.subscriptions FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');