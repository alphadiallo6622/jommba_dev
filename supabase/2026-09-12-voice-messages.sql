-- ─── Messages vocaux ──────────────────────────────────────────────────────────
-- Enregistrement par MediaRecorder (API navigateur), stockage dans Supabase
-- Storage, lecture par URL signée. Aucun service tiers.
-- Le Premium est verrouillé par la policy d'insertion, pas seulement par l'UI :
-- même motif que flash_message sur likes.

ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS audio_path        TEXT,
  ADD COLUMN IF NOT EXISTS audio_mime        TEXT,
  ADD COLUMN IF NOT EXISTS audio_duration_ms INTEGER;

-- content reste NOT NULL (le code existant le lit comme une string) : un vocal
-- porte une chaîne vide. Un message doit avoir du texte ou un vocal.
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_text_or_audio;
ALTER TABLE public.messages ADD CONSTRAINT messages_text_or_audio
  CHECK (content <> '' OR audio_path IS NOT NULL);

-- 60 s max, avec une marge pour l'arrondi du navigateur.
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_audio_duration;
ALTER TABLE public.messages ADD CONSTRAINT messages_audio_duration
  CHECK (audio_duration_ms IS NULL OR (audio_duration_ms > 0 AND audio_duration_ms <= 65000));

-- La policy garde ses règles d'origine (on n'envoie que ses propres messages,
-- et seulement entre contacts non bloqués) et réserve le vocal aux Premium.
DROP POLICY IF EXISTS "sender_can_insert_message" ON public.messages;
CREATE POLICY "sender_can_insert_message"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND public.are_contacts(sender_id, receiver_id)
    AND (
      audio_path IS NULL
      OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.user_id = auth.uid() AND p.is_premium = true
      )
    )
  );

-- Bucket privé : 2 Mo par fichier, types audio uniquement.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('voice-messages', 'voice-messages', false, 2097152,
        ARRAY['audio/webm','audio/ogg','audio/mp4','audio/mpeg','audio/wav','audio/aac'])
ON CONFLICT (id) DO UPDATE SET
  public             = false,
  file_size_limit    = 2097152,
  allowed_mime_types = ARRAY['audio/webm','audio/ogg','audio/mp4','audio/mpeg','audio/wav','audio/aac'];

-- Chemin des fichiers : {conversation_id}/{uuid}.{ext} — le premier dossier
-- porte la conversation, ce qui suffit à vérifier l'appartenance.
DROP POLICY IF EXISTS "voice_participants_read" ON storage.objects;
CREATE POLICY "voice_participants_read"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'voice-messages'
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id::text = (storage.foldername(name))[1]
        AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
    )
  );

DROP POLICY IF EXISTS "voice_premium_sender_writes" ON storage.objects;
CREATE POLICY "voice_premium_sender_writes"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'voice-messages'
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id::text = (storage.foldername(name))[1]
        AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
        AND public.are_contacts(c.participant_1, c.participant_2)
    )
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.is_premium = true
    )
  );

-- Permet au client de nettoyer un fichier orphelin si l'insertion du message
-- échoue après l'upload.
DROP POLICY IF EXISTS "voice_sender_deletes_own" ON storage.objects;
CREATE POLICY "voice_sender_deletes_own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'voice-messages' AND owner = auth.uid());
