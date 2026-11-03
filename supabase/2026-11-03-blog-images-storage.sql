-- ─── Images du blog sur Supabase Storage ─────────────────────────────────────
-- Dernier usage de Cloudinary : les images deposees depuis la console admin.
-- Elles passent ici, ce qui permet de fermer le compte Cloudinary sans rien
-- perdre.
--
-- Le bucket recoit les couvertures d'articles de blog ET les visuels de
-- l'Academie : les deux ecrans partagent la meme route d'upload
-- (app/api/admin/upload). Le nom du bucket est anterieur a l'Academie.
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
