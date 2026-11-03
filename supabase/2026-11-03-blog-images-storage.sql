-- ─── Images du blog sur Supabase Storage ─────────────────────────────────────
-- Dernier usage de Cloudinary : les couvertures d'articles deposees depuis la
-- console admin. Elles passent ici, ce qui permet de fermer le compte
-- Cloudinary sans rien perdre.
--
-- Bucket separe de `profile-photos` : ce sont des contenus editoriaux, pas des
-- donnees de membres, et ils n'ont ni le meme cycle de vie ni les memes
-- volumes.
--
-- Public, comme l'etaient les URLs Cloudinary : une couverture d'article doit
-- s'afficher sur le blog public sans signature.
--
-- Ecriture reservee au serveur (app/api/admin/upload/route.ts, protegee par le
-- cookie admin et utilisant la service_role) : aucune policy n'est necessaire.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog-images',
  'blog-images',
  true,
  10485760, -- 10 Mo
  ARRAY['image/jpeg','image/png','image/webp','image/gif','image/avif']
)
ON CONFLICT (id) DO UPDATE
  SET public             = EXCLUDED.public,
      file_size_limit    = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;
