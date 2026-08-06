-- ─────────────────────────────────────────────────────────────────────────────
-- 2026-08-06 — Correction du trigger d'inscription handle_new_user
--
-- 1) public.subscriptions n'a plus de contrainte UNIQUE(user_id) : la table est
--    devenue un historique (une ligne par achat, cf. /api/payments/subscribe et
--    /api/subscription/me qui trie par created_at desc). Le
--    « ON CONFLICT (user_id) » du trigger levait donc :
--      ERROR: there is no unique or exclusion constraint matching the
--             ON CONFLICT specification (SQLSTATE 42P10)
--    → POST /auth/v1/signup renvoyait 500 et TOUTE inscription échouait
--      (formulaire email comme OAuth Google, qui passent par le même trigger).
--    On remplace par un INSERT … WHERE NOT EXISTS, idempotent sans contrainte.
--
-- 2) Google (OIDC) ne renvoie pas first_name/last_name mais given_name /
--    family_name / name. Sans mapping, un compte Google atterrissait avec la
--    partie locale de l'email comme prénom et aucun nom.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  meta      JSONB := COALESCE(NEW.raw_user_meta_data, '{}'::JSONB);
  full_name TEXT;
  v_first   TEXT;
  v_last    TEXT;
BEGIN
  -- Les comptes créés par la console admin sont marqués is_admin :
  -- pas de profil membre, pas d'abonnement, pas de préférences.
  IF COALESCE(meta->>'is_admin', '') = 'true' THEN
    RETURN NEW;
  END IF;

  full_name := NULLIF(TRIM(COALESCE(meta->>'name', meta->>'full_name', '')), '');
  v_first   := NULLIF(TRIM(COALESCE(meta->>'first_name', meta->>'given_name',  '')), '');
  v_last    := NULLIF(TRIM(COALESCE(meta->>'last_name',  meta->>'family_name', '')), '');

  -- Fallback : « Prénom Nom » d'un seul tenant (claim `name` de Google).
  IF v_first IS NULL AND full_name IS NOT NULL THEN
    v_first := split_part(full_name, ' ', 1);
    v_last  := COALESCE(
      v_last,
      NULLIF(TRIM(SUBSTR(full_name, LENGTH(split_part(full_name, ' ', 1)) + 1)), '')
    );
  END IF;

  INSERT INTO public.profiles (user_id, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE(v_first, NULLIF(split_part(COALESCE(NEW.email, ''), '@', 1), ''), 'Membre'),
    v_last
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Pas de ON CONFLICT ici : subscriptions autorise plusieurs lignes par user.
  INSERT INTO public.subscriptions (user_id, plan, status)
  SELECT NEW.id, 'free', 'active'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.subscriptions s WHERE s.user_id = NEW.id
  );

  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
