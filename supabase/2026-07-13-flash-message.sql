-- Message Flash : texte optionnel joint à une demande de contact (type='request').
-- Réservé aux membres Premium côté application. Visible par le destinataire dans
-- le popup "Demandes en attente" du dashboard.
--
-- Appliqué en prod le 2026-07-13 (migration Supabase add_flash_message_to_likes).

alter table public.likes
  add column if not exists flash_message text;

comment on column public.likes.flash_message is
  'Message personnalisé (Message Flash) joint à une demande de contact par un membre Premium.';
