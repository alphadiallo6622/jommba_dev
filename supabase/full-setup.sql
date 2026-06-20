-- ============================================================
-- JOMMBA — Setup complet (Schema + RLS + Seed)
-- Coller et exécuter dans : Supabase Dashboard → SQL Editor
-- Ce script est idempotent : peut être relancé sans erreur.
-- ============================================================
--
-- UUIDs fixes utilisés :
--   Abou Diallo  (free)    → aaaaaa01-0000-0000-0000-000000000001
--   Alpha Diallo (premium) → aaaaaa02-0000-0000-0000-000000000002
--   Admin                  → aaaaaa03-0000-0000-0000-000000000003
--   Explorer 01..06        → eeeeee01..06-0000-0000-0000-000000000001..006
-- ============================================================


-- ╔══════════════════════════════════════════════════════════╗
-- ║  PARTIE 1 — SCHÉMA                                       ║
-- ╚══════════════════════════════════════════════════════════╝

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Fonction updated_at ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── TABLE : profiles ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name         TEXT NOT NULL,
  last_name          TEXT,
  gender             TEXT CHECK (gender IN ('homme', 'femme')),
  age                INTEGER CHECK (age >= 18 AND age <= 99),
  height             INTEGER CHECK (height >= 140 AND height <= 220),
  city               TEXT,
  country            TEXT DEFAULT 'SN',
  avatar_url         TEXT,
  bio                TEXT,
  seeking            TEXT,
  marriage_vision    TEXT,
  interests          TEXT,
  qualities          TEXT,
  dealbreakers       TEXT,
  languages          TEXT,
  madhhab            TEXT,
  mosque_frequency   TEXT,
  arabic_level       TEXT,
  marital_status     TEXT,
  education          TEXT,
  job                TEXT,
  has_children       TEXT,
  wants_children     TEXT,
  can_relocate       TEXT,
  polygamy           TEXT,
  status             TEXT NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending', 'validated', 'refused', 'suspended')),
  is_premium         BOOLEAN NOT NULL DEFAULT false,
  profile_completion INTEGER NOT NULL DEFAULT 0 CHECK (profile_completion >= 0 AND profile_completion <= 100),
  visibility         TEXT NOT NULL DEFAULT 'active'
                       CHECK (visibility IN ('active', 'pause', 'discussion')),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_status   ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_gender   ON public.profiles(gender);
CREATE INDEX IF NOT EXISTS idx_profiles_city     ON public.profiles(city);

-- ─── TABLE : user_preferences ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  photos_blurred BOOLEAN NOT NULL DEFAULT true,
  sound_enabled  BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

DROP TRIGGER IF EXISTS user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─── TABLE : profile_photos ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profile_photos (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  "order"    INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profile_photos_user_id ON public.profile_photos(user_id);

-- ─── TABLE : conversations ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.conversations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_2   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (participant_1, participant_2),
  CHECK (participant_1 <> participant_2)
);

CREATE INDEX IF NOT EXISTS idx_conversations_p1 ON public.conversations(participant_1);
CREATE INDEX IF NOT EXISTS idx_conversations_p2 ON public.conversations(participant_2);

-- ─── TABLE : messages ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,
  is_read         BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender       ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver     ON public.messages(receiver_id);

-- ─── TABLE : likes ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.likes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('request', 'favorite')),
  status      TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (sender_id, receiver_id, type),
  CHECK (sender_id <> receiver_id)
);

CREATE INDEX IF NOT EXISTS idx_likes_sender   ON public.likes(sender_id);
CREATE INDEX IF NOT EXISTS idx_likes_receiver ON public.likes(receiver_id);

-- ─── TABLE : profile_visitors ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profile_visitors (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  visited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (visitor_id <> profile_id)
);

CREATE INDEX IF NOT EXISTS idx_visitors_profile ON public.profile_visitors(profile_id);
CREATE INDEX IF NOT EXISTS idx_visitors_visitor ON public.profile_visitors(visitor_id);

-- ─── TABLE : boosts ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.boosts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_boosts_user_id ON public.boosts(user_id);

-- ─── TABLE : subscriptions ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan                   TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
  status                 TEXT NOT NULL DEFAULT 'active'
                           CHECK (status IN ('active', 'cancelled', 'expired')),
  stripe_subscription_id TEXT,
  current_period_end     TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

DROP TRIGGER IF EXISTS subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─── TABLE : reports ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reports (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason      TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (reporter_id <> reported_id)
);

CREATE INDEX IF NOT EXISTS idx_reports_reporter ON public.reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_status   ON public.reports(status);

-- ─── TABLE : notifications ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  is_read    BOOLEAN NOT NULL DEFAULT false,
  data       JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- ─── TABLE : support_tickets ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject    TEXT NOT NULL,
  body       TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'open'
               CHECK (status IN ('open', 'in_progress', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS support_tickets_updated_at ON public.support_tickets;
CREATE TRIGGER support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─── Trigger : création automatique du profil à l'inscription ─────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'last_name'
  )
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ╔══════════════════════════════════════════════════════════╗
-- ║  PARTIE 2 — ROW LEVEL SECURITY                           ║
-- ╚══════════════════════════════════════════════════════════╝

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

-- PROFILES
DROP POLICY IF EXISTS "read_validated_profiles"    ON public.profiles;
DROP POLICY IF EXISTS "owner_read_own_profile"     ON public.profiles;
DROP POLICY IF EXISTS "owner_update_own_profile"   ON public.profiles;
DROP POLICY IF EXISTS "admin_full_access_profiles" ON public.profiles;

CREATE POLICY "read_validated_profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (status = 'validated');

CREATE POLICY "owner_read_own_profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "owner_update_own_profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admin_full_access_profiles"
  ON public.profiles FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- USER_PREFERENCES
DROP POLICY IF EXISTS "owner_read_own_preferences"  ON public.user_preferences;
DROP POLICY IF EXISTS "owner_write_own_preferences" ON public.user_preferences;

CREATE POLICY "owner_read_own_preferences"
  ON public.user_preferences FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "owner_write_own_preferences"
  ON public.user_preferences FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- PROFILE_PHOTOS
DROP POLICY IF EXISTS "read_photos_of_validated_profiles" ON public.profile_photos;
DROP POLICY IF EXISTS "owner_manage_own_photos"           ON public.profile_photos;

CREATE POLICY "read_photos_of_validated_profiles"
  ON public.profile_photos FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = profile_photos.user_id
        AND profiles.status = 'validated'
    )
  );

CREATE POLICY "owner_manage_own_photos"
  ON public.profile_photos FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- CONVERSATIONS
DROP POLICY IF EXISTS "participants_can_read_conversation"    ON public.conversations;
DROP POLICY IF EXISTS "authenticated_can_create_conversation" ON public.conversations;

CREATE POLICY "participants_can_read_conversation"
  ON public.conversations FOR SELECT TO authenticated
  USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

CREATE POLICY "authenticated_can_create_conversation"
  ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- MESSAGES
DROP POLICY IF EXISTS "participants_read_messages"    ON public.messages;
DROP POLICY IF EXISTS "sender_can_insert_message"     ON public.messages;
DROP POLICY IF EXISTS "admin_full_access_messages"    ON public.messages;

CREATE POLICY "participants_read_messages"
  ON public.messages FOR SELECT TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "sender_can_insert_message"
  ON public.messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "admin_full_access_messages"
  ON public.messages FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- LIKES
DROP POLICY IF EXISTS "owner_manage_own_likes"      ON public.likes;
DROP POLICY IF EXISTS "receiver_can_read_own_likes" ON public.likes;
DROP POLICY IF EXISTS "admin_full_access_likes"     ON public.likes;

CREATE POLICY "owner_manage_own_likes"
  ON public.likes FOR ALL TO authenticated
  USING (auth.uid() = sender_id)
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "receiver_can_read_own_likes"
  ON public.likes FOR SELECT TO authenticated
  USING (auth.uid() = receiver_id);

CREATE POLICY "admin_full_access_likes"
  ON public.likes FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- PROFILE_VISITORS
DROP POLICY IF EXISTS "authenticated_can_log_visit"   ON public.profile_visitors;
DROP POLICY IF EXISTS "profile_owner_reads_visitors"  ON public.profile_visitors;
DROP POLICY IF EXISTS "visitor_reads_own_visits"      ON public.profile_visitors;

CREATE POLICY "authenticated_can_log_visit"
  ON public.profile_visitors FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = visitor_id);

CREATE POLICY "profile_owner_reads_visitors"
  ON public.profile_visitors FOR SELECT TO authenticated
  USING (auth.uid() = profile_id);

CREATE POLICY "visitor_reads_own_visits"
  ON public.profile_visitors FOR SELECT TO authenticated
  USING (auth.uid() = visitor_id);

-- BOOSTS
DROP POLICY IF EXISTS "owner_reads_own_boosts"    ON public.boosts;
DROP POLICY IF EXISTS "admin_full_access_boosts"  ON public.boosts;

CREATE POLICY "owner_reads_own_boosts"
  ON public.boosts FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "admin_full_access_boosts"
  ON public.boosts FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- SUBSCRIPTIONS
DROP POLICY IF EXISTS "owner_reads_own_subscription"     ON public.subscriptions;
DROP POLICY IF EXISTS "admin_full_access_subscriptions"  ON public.subscriptions;

CREATE POLICY "owner_reads_own_subscription"
  ON public.subscriptions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "admin_full_access_subscriptions"
  ON public.subscriptions FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- REPORTS
DROP POLICY IF EXISTS "authenticated_can_create_report" ON public.reports;
DROP POLICY IF EXISTS "reporter_reads_own_reports"      ON public.reports;
DROP POLICY IF EXISTS "admin_full_access_reports"       ON public.reports;

CREATE POLICY "authenticated_can_create_report"
  ON public.reports FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "reporter_reads_own_reports"
  ON public.reports FOR SELECT TO authenticated
  USING (auth.uid() = reporter_id);

CREATE POLICY "admin_full_access_reports"
  ON public.reports FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- NOTIFICATIONS
DROP POLICY IF EXISTS "owner_reads_own_notifications"   ON public.notifications;
DROP POLICY IF EXISTS "owner_updates_own_notifications" ON public.notifications;
DROP POLICY IF EXISTS "admin_full_access_notifications" ON public.notifications;

CREATE POLICY "owner_reads_own_notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "owner_updates_own_notifications"
  ON public.notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admin_full_access_notifications"
  ON public.notifications FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- SUPPORT_TICKETS
DROP POLICY IF EXISTS "owner_creates_own_ticket"  ON public.support_tickets;
DROP POLICY IF EXISTS "owner_reads_own_tickets"   ON public.support_tickets;
DROP POLICY IF EXISTS "admin_full_access_tickets" ON public.support_tickets;

CREATE POLICY "owner_creates_own_ticket"
  ON public.support_tickets FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "owner_reads_own_tickets"
  ON public.support_tickets FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "admin_full_access_tickets"
  ON public.support_tickets FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');


-- ╔══════════════════════════════════════════════════════════╗
-- ║  PARTIE 3 — DONNÉES DE TEST (SEED)                       ║
-- ╚══════════════════════════════════════════════════════════╝
--
-- Les utilisateurs sont créés directement dans auth.users
-- avec des mots de passe hashés (bcrypt via pgcrypto).
-- Le trigger handle_new_user crée automatiquement leurs
-- profils, subscriptions et preferences.
-- ─────────────────────────────────────────────────────────────

DO $$
DECLARE
  -- UUIDs fixes pour les utilisateurs de test
  v_free_id    UUID := 'aaaaaa01-0000-0000-0000-000000000001';
  v_premium_id UUID := 'aaaaaa02-0000-0000-0000-000000000002';
  v_admin_id   UUID := 'aaaaaa03-0000-0000-0000-000000000003';

  -- UUIDs fixes pour les profils explorateurs (fictifs)
  v_p01 UUID := 'eeeeee01-0000-0000-0000-000000000001';
  v_p02 UUID := 'eeeeee02-0000-0000-0000-000000000002';
  v_p03 UUID := 'eeeeee03-0000-0000-0000-000000000003';
  v_p04 UUID := 'eeeeee04-0000-0000-0000-000000000004';
  v_p05 UUID := 'eeeeee05-0000-0000-0000-000000000005';
  v_p06 UUID := 'eeeeee06-0000-0000-0000-000000000006';

BEGIN

  -- ─── Créer les comptes Auth des utilisateurs de test ──────────────────────
  -- (ON CONFLICT DO NOTHING = idempotent)

  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, is_sso_user
  ) VALUES
  (
    v_free_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'abou.diallo@jommba.com',
    crypt('abou2024', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"first_name":"Abou","last_name":"Diallo"}',
    NOW(), NOW(), false
  ),
  (
    v_premium_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'alphadiallo2308@gmail.com',
    crypt('alpha2308', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"first_name":"Alpha","last_name":"Diallo"}',
    NOW(), NOW(), false
  ),
  (
    v_admin_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'admin@jommba.com',
    crypt('JommbaAdmin2026!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"first_name":"Admin","last_name":"Jommba"}',
    NOW(), NOW(), false
  )
  ON CONFLICT (id) DO NOTHING;

  -- ─── Créer les comptes Auth des profils explorateurs (fictifs) ────────────

  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, is_sso_user
  ) VALUES
  (v_p01,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
    'fa.d@jommba-demo.internal', '', NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"first_name":"Fa","last_name":"D."}',
    NOW(), NOW(), false),
  (v_p02,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
    'fama.n@jommba-demo.internal', '', NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"first_name":"Fama","last_name":"N."}',
    NOW(), NOW(), false),
  (v_p03,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
    'ndeye.g@jommba-demo.internal', '', NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"first_name":"Ndeye","last_name":"G."}',
    NOW(), NOW(), false),
  (v_p04,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
    'aissatou.b@jommba-demo.internal', '', NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"first_name":"Aïssatou","last_name":"B."}',
    NOW(), NOW(), false),
  (v_p05,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
    'mariama.s@jommba-demo.internal', '', NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"first_name":"Mariama","last_name":"S."}',
    NOW(), NOW(), false),
  (v_p06,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
    'sokhna.m@jommba-demo.internal', '', NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"first_name":"Sokhna","last_name":"M."}',
    NOW(), NOW(), false)
  ON CONFLICT (id) DO NOTHING;

  -- ─── Mettre à jour le profil d'Abou Diallo (free) ────────────────────────
  UPDATE public.profiles SET
    first_name         = 'Abou',
    last_name          = 'Diallo',
    gender             = 'homme',
    age                = 32,
    height             = 180,
    city               = 'Dakar',
    country            = 'SN',
    avatar_url         = 'https://i.pravatar.cc/150?img=3',
    bio                = 'Un homme sérieux à la recherche d''une épouse pieuse.',
    marriage_vision    = 'Je vois le mariage comme un projet de vie sérieux, fondé sur la religion et la confiance mutuelle.',
    seeking            = 'Une femme pieuse, douce et sérieuse, avec qui construire une famille dans la bonne voie.',
    interests          = 'Football, lecture islamique, voyages, cuisine.',
    qualities          = 'Responsable, sincère, patient, attaché à mes valeurs.',
    dealbreakers       = 'La malhonnêteté et le manque de pudeur.',
    languages          = 'Français, Wolof, Arabe (notions)',
    madhhab            = 'Maliki',
    mosque_frequency   = 'Régulièrement',
    arabic_level       = 'Intermédiaire',
    marital_status     = 'Célibataire',
    education          = 'Bac+3',
    job                = 'Comptable',
    has_children       = 'Non',
    wants_children     = 'Oui',
    can_relocate       = 'À discuter',
    polygamy           = 'Ouvert',
    status             = 'pending',
    is_premium         = false,
    profile_completion = 86
  WHERE user_id = v_free_id;

  -- ─── Mettre à jour le profil d'Alpha Diallo (premium) ────────────────────
  UPDATE public.profiles SET
    first_name         = 'Alpha',
    last_name          = 'Diallo',
    gender             = 'homme',
    age                = 29,
    height             = 175,
    city               = 'Dakar',
    country            = 'SN',
    avatar_url         = 'https://i.pravatar.cc/150?img=8',
    bio                = 'Ingénieur passionné par la foi et la famille.',
    marriage_vision    = 'Le mariage est la moitié de la religion. Je cherche une compagne sincère.',
    seeking            = 'Une femme cultivée, pieuse et équilibrée.',
    interests          = 'Lecture, sport, voyages halal, bénévolat, technologie.',
    qualities          = 'Ambitieux, doux, respectueux, fiable.',
    dealbreakers       = 'Le mensonge et l''absence de pratique religieuse.',
    languages          = 'Français, Wolof, Anglais, Arabe',
    madhhab            = 'Maliki',
    mosque_frequency   = 'Régulièrement',
    arabic_level       = 'Avancé',
    marital_status     = 'Célibataire',
    education          = 'Bac+5',
    job                = 'Ingénieur',
    has_children       = 'Non',
    wants_children     = 'Oui',
    can_relocate       = 'Oui',
    polygamy           = 'Non',
    status             = 'validated',
    is_premium         = true,
    profile_completion = 100
  WHERE user_id = v_premium_id;

  -- Passer l'abonnement d'Alpha en Premium
  UPDATE public.subscriptions SET
    plan               = 'premium',
    status             = 'active',
    current_period_end = NOW() + INTERVAL '30 days'
  WHERE user_id = v_premium_id;

  -- ─── Mettre à jour les profils explorateurs ────────────────────────────────

  UPDATE public.profiles SET
    gender='femme', age=47, city='Paris', country='FR',
    avatar_url='https://i.pravatar.cc/400?img=47',
    marital_status='Divorcé(e)', job='Animatrice périscolaire',
    marriage_vision='Le mariage est une ancre solide, où foi et amour se rejoignent.',
    seeking='Je cherche quelqu''un qui craint Allah, sincère et bienveillant.',
    interests='Balades, restaurant, cinéma, sport en salle.',
    qualities='Bienveillante, à l''écoute, loyale et très gentille.',
    madhhab='Maliki', education='Baccalauréat',
    has_children='1 enfant', wants_children='J''en ai déjà',
    can_relocate='Oui', polygamy='N''accepte pas',
    status='validated', is_premium=true, profile_completion=90
  WHERE user_id = v_p01;

  UPDATE public.profiles SET
    gender='femme', age=29, city='Thiès', country='SN',
    avatar_url='https://i.pravatar.cc/400?img=29',
    marital_status='Célibataire', job='Agent de sécurité',
    marriage_vision='Je cherche un partenaire sincère et pieux pour construire un foyer solide.',
    seeking='Quelqu''un de sérieux et pratiquant, avec de bonnes valeurs familiales.',
    interests='Lecture, cuisine, sport.',
    qualities='Honnête et sérieuse.',
    madhhab='Maliki', education='Bac+3',
    has_children='0', wants_children='J''en veux',
    can_relocate='Non', polygamy='Non',
    status='validated', is_premium=true, profile_completion=85
  WHERE user_id = v_p02;

  UPDATE public.profiles SET
    gender='femme', age=46, city='Montréal', country='CA',
    avatar_url='https://i.pravatar.cc/400?img=46',
    marital_status='Divorcé(e)', job='Infirmière',
    marriage_vision='La foi avant tout. Je cherche une union bénie et durable.',
    seeking='Un homme mature et posé, craignant Allah.',
    interests='Voyages, cuisine, lecture islamique.',
    qualities='Discrète et fiable, très organisée.',
    madhhab='Maliki', education='Bac+5',
    has_children='2', wants_children='Indifférent',
    can_relocate='Oui', polygamy='À discuter',
    status='validated', is_premium=false, profile_completion=80
  WHERE user_id = v_p03;

  UPDATE public.profiles SET
    gender='femme', age=27, city='Dakar', country='SN',
    avatar_url='https://i.pravatar.cc/400?img=27',
    marital_status='Célibataire', job='Infirmière',
    marriage_vision='Le mariage est une sunnah que je souhaite honorer avec sérieux.',
    seeking='Un homme pieux, travailleur et respectueux de sa famille.',
    interests='Médecine, lecture, cuisine africaine.',
    qualities='Patiente, douce, sérieuse dans mes engagements.',
    madhhab='Maliki', education='Bac+3',
    has_children='0', wants_children='J''en veux',
    can_relocate='Selon les conditions', polygamy='Non',
    status='validated', is_premium=false, profile_completion=75
  WHERE user_id = v_p04;

  UPDATE public.profiles SET
    gender='femme', age=33, city='Paris', country='FR',
    avatar_url='https://i.pravatar.cc/400?img=33',
    marital_status='Célibataire', job='Comptable',
    marriage_vision='Trouver un compagnon de route pour ce monde et l''au-delà.',
    seeking='Un homme cultivé, pieux, stable financièrement.',
    interests='Cinéma, voyages, cuisine.',
    qualities='Autonome, souriante, très organisée.',
    madhhab='Maliki', education='Bac+5',
    has_children='0', wants_children='J''en veux',
    can_relocate='Non', polygamy='N''accepte pas',
    status='validated', is_premium=false, profile_completion=82
  WHERE user_id = v_p05;

  UPDATE public.profiles SET
    gender='femme', age=36, city='Montréal', country='CA',
    avatar_url='https://i.pravatar.cc/400?img=36',
    marital_status='Célibataire', job='Pharmacienne',
    marriage_vision='Un foyer de sérénité, de respect mutuel et de foi partagée.',
    seeking='Un homme sérieux, bien éduqué, pratiquant avec modération.',
    interests='Médecine, lecture, sport.',
    qualities='Professionnelle, douce, loyale.',
    madhhab='Maliki', education='Bac+5',
    has_children='0', wants_children='J''en veux',
    can_relocate='Selon les conditions', polygamy='Non',
    status='validated', is_premium=true, profile_completion=95
  WHERE user_id = v_p06;

  -- ─── Notifications de test ─────────────────────────────────────────────────
  INSERT INTO public.notifications (user_id, type, title, body) VALUES
    (v_free_id,    'like',    'Nouvelle demande', 'Fama N. vous a envoyé une demande de contact.'),
    (v_free_id,    'visitor', 'Visite de profil', 'Quelqu''un a visité votre profil.'),
    (v_premium_id, 'like',    'Nouveau favori',   'Ndeye G. vous a ajouté en favori.')
  ON CONFLICT DO NOTHING;

  -- ─── Visiteurs de profil ───────────────────────────────────────────────────
  INSERT INTO public.profile_visitors (visitor_id, profile_id) VALUES
    (v_p01, v_free_id),
    (v_p02, v_free_id),
    (v_p03, v_premium_id),
    (v_p04, v_premium_id),
    (v_p05, v_premium_id)
  ON CONFLICT DO NOTHING;

  -- ─── Demandes de contact ───────────────────────────────────────────────────
  INSERT INTO public.likes (sender_id, receiver_id, type, status) VALUES
    (v_p01, v_free_id,    'request',  'pending'),
    (v_p02, v_free_id,    'request',  'pending'),
    (v_p03, v_premium_id, 'favorite', 'pending'),
    (v_p04, v_premium_id, 'request',  'accepted')
  ON CONFLICT DO NOTHING;

  RAISE NOTICE '✅ Setup Jommba terminé avec succès.';
  RAISE NOTICE '   — 12 tables créées';
  RAISE NOTICE '   — RLS activé sur toutes les tables';
  RAISE NOTICE '   — 3 comptes de test créés (free / premium / admin)';
  RAISE NOTICE '   — 6 profils explorateurs créés';
  RAISE NOTICE '   — Notifications, visiteurs et demandes insérés';

END;
$$;


-- ╔══════════════════════════════════════════════════════════╗
-- ║  VÉRIFICATION FINALE                                     ║
-- ╚══════════════════════════════════════════════════════════╝

SELECT
  t.table_name,
  COUNT(p.policyname) AS nb_policies
FROM information_schema.tables t
LEFT JOIN pg_policies p
  ON p.tablename = t.table_name AND p.schemaname = 'public'
WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
GROUP BY t.table_name
ORDER BY t.table_name;
