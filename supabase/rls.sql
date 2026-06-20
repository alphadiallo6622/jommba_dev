-- ============================================================
-- JOMMBA — Row Level Security (RLS)
-- À exécuter APRÈS schema.sql dans le SQL Editor de Supabase
-- ============================================================

-- ─── Activation du RLS sur toutes les tables ─────────────────────────────────
ALTER TABLE public.profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_photos     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_visitors   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boosts             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets    ENABLE ROW LEVEL SECURITY;

-- ─── PROFILES ────────────────────────────────────────────────────────────────

-- Tout utilisateur authentifié peut lire les profils validés
CREATE POLICY "read_validated_profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (status = 'validated');

-- Un utilisateur peut lire son propre profil (même non validé)
CREATE POLICY "owner_read_own_profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Un utilisateur peut modifier son propre profil
CREATE POLICY "owner_update_own_profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin : accès total (via service_role qui bypass RLS, ou via JWT claim)
CREATE POLICY "admin_full_access_profiles"
  ON public.profiles FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- ─── USER_PREFERENCES ────────────────────────────────────────────────────────

CREATE POLICY "owner_read_own_preferences"
  ON public.user_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "owner_write_own_preferences"
  ON public.user_preferences FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── PROFILE_PHOTOS ──────────────────────────────────────────────────────────

-- Photos publiques des profils validés uniquement
CREATE POLICY "read_photos_of_validated_profiles"
  ON public.profile_photos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = profile_photos.user_id
        AND profiles.status = 'validated'
    )
  );

CREATE POLICY "owner_manage_own_photos"
  ON public.profile_photos FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── CONVERSATIONS ────────────────────────────────────────────────────────────

CREATE POLICY "participants_can_read_conversation"
  ON public.conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

CREATE POLICY "authenticated_can_create_conversation"
  ON public.conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- ─── MESSAGES ────────────────────────────────────────────────────────────────

CREATE POLICY "participants_read_messages"
  ON public.messages FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "sender_can_insert_message"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "admin_full_access_messages"
  ON public.messages FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- ─── LIKES ────────────────────────────────────────────────────────────────────

CREATE POLICY "owner_manage_own_likes"
  ON public.likes FOR ALL
  TO authenticated
  USING (auth.uid() = sender_id)
  WITH CHECK (auth.uid() = sender_id);

-- Un utilisateur peut voir les likes qu'il a reçus (si premium)
CREATE POLICY "receiver_can_read_own_likes"
  ON public.likes FOR SELECT
  TO authenticated
  USING (auth.uid() = receiver_id);

CREATE POLICY "admin_full_access_likes"
  ON public.likes FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- ─── PROFILE_VISITORS ────────────────────────────────────────────────────────

-- Tout utilisateur authentifié peut enregistrer une visite
CREATE POLICY "authenticated_can_log_visit"
  ON public.profile_visitors FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = visitor_id);

-- Un utilisateur peut voir qui a visité son profil
CREATE POLICY "profile_owner_reads_visitors"
  ON public.profile_visitors FOR SELECT
  TO authenticated
  USING (auth.uid() = profile_id);

-- Un visiteur peut voir ses propres visites
CREATE POLICY "visitor_reads_own_visits"
  ON public.profile_visitors FOR SELECT
  TO authenticated
  USING (auth.uid() = visitor_id);

-- ─── BOOSTS ──────────────────────────────────────────────────────────────────

CREATE POLICY "owner_reads_own_boosts"
  ON public.boosts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "admin_full_access_boosts"
  ON public.boosts FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- ─── SUBSCRIPTIONS ────────────────────────────────────────────────────────────

CREATE POLICY "owner_reads_own_subscription"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "admin_full_access_subscriptions"
  ON public.subscriptions FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- ─── REPORTS ─────────────────────────────────────────────────────────────────

CREATE POLICY "authenticated_can_create_report"
  ON public.reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "reporter_reads_own_reports"
  ON public.reports FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_id);

CREATE POLICY "admin_full_access_reports"
  ON public.reports FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- ─── NOTIFICATIONS ───────────────────────────────────────────────────────────

CREATE POLICY "owner_reads_own_notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "owner_updates_own_notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admin_full_access_notifications"
  ON public.notifications FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- ─── SUPPORT_TICKETS ─────────────────────────────────────────────────────────

CREATE POLICY "owner_creates_own_ticket"
  ON public.support_tickets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "owner_reads_own_tickets"
  ON public.support_tickets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "admin_full_access_tickets"
  ON public.support_tickets FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');
