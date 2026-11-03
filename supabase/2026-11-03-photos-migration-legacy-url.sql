-- ─── Rapatriement des photos Cloudinary vers Supabase Storage ────────────────
-- Les nouvelles photos vont deja sur Supabase (cf. 2026-11-03-photos-supabase-
-- storage.sql), mais 734 anciennes vivaient encore chez Cloudinary, dont le
-- quota gratuit est epuise : si ce compte etait desactive, elles auraient
-- disparu du site.
--
-- `legacy_url` garde l'URL Cloudinary d'origine de chaque photo migree. Elle
-- sert deux fois :
--  - filet de securite : le retour arriere consiste a la recopier dans `url`
--    (scripts/migrate-photos-to-supabase.mjs --rollback) ;
--  - temoin : NULL = photo jamais migree, donc le script est relancable sans
--    risque de retraiter deux fois la meme ligne.
--
-- La migration elle-meme est faite par le script, pas ici : elle doit
-- telecharger chaque fichier chez Cloudinary et le deposer sur Supabase, ce
-- que SQL ne sait pas faire.
--
-- La colonne est conservee apres la migration : elle ne coute rien et reste la
-- seule trace de l'emplacement d'origine si un doute survient.

ALTER TABLE public.profile_photos
  ADD COLUMN IF NOT EXISTS legacy_url TEXT;

COMMENT ON COLUMN public.profile_photos.legacy_url IS
  'URL Cloudinary d''origine, conservee lors de la migration vers Supabase Storage. Permet de revenir en arriere. NULL = photo jamais migree.';
