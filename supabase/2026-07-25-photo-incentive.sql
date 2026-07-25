-- 2026-07-25-photo-incentive.sql
-- Incitation à ajouter une photo de profil.
--   • profiles.last_photo_reminder_at : date du dernier email de rappel « 3 jours »
--     (le cron /api/cron/photo-reminders s'en sert pour ne relancer que tous les 3 j).
--   • profile_photos.public_id : identifiant Cloudinary, pour supprimer proprement
--     le fichier lors d'un rejet (les anciennes lignes sans public_id sont gérées
--     par dérivation depuis l'URL côté application).

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_photo_reminder_at TIMESTAMPTZ;

ALTER TABLE public.profile_photos
  ADD COLUMN IF NOT EXISTS public_id TEXT;
