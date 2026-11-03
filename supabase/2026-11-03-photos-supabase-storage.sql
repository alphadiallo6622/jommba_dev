-- ─── Photos de profil sur Supabase Storage ───────────────────────────────────
-- Les photos partaient sur Cloudinary, dont le quota gratuit est epuise. Les
-- nouvelles photos vont desormais dans ce bucket, inclus dans l'abonnement Pro.
--
-- Le bucket est PUBLIC, comme l'etaient les URLs Cloudinary : une photo doit
-- s'afficher dans un `<img>` chez les autres membres sans signature. Le niveau
-- d'exposition est donc le meme qu'avant, pas moindre. (Les vocaux, eux, sont
-- prives et servis par URL signee : ils n'ont pas le meme usage.)
--
-- Les photos deja en base gardent leur URL Cloudinary et continuent d'etre
-- servies par Cloudinary : seule l'ecriture change. Les deux hebergements
-- cohabitent, le code route la suppression selon l'URL (lib/photo-storage.ts).
--
-- Formats limites a ceux que les navigateurs savent afficher : sans Cloudinary,
-- plus personne ne convertit un HEIC d'iPhone en JPEG. Mieux vaut refuser a
-- l'upload qu'enregistrer une image qui ne s'affichera pas.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-photos',
  'profile-photos',
  true,
  10485760, -- 10 Mo, aligne sur la verification cote client et cote route
  ARRAY['image/jpeg','image/png','image/webp','image/gif','image/avif']
)
ON CONFLICT (id) DO UPDATE
  SET public             = EXCLUDED.public,
      file_size_limit    = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Aucune policy Storage n'est necessaire :
--  - lecture : le bucket est public ;
--  - ecriture/suppression : uniquement cote serveur, via la service_role
--    (app/api/upload/avatar/route.ts), qui verifie la session avant d'ecrire
--    et prefixe le chemin par l'id du membre.
