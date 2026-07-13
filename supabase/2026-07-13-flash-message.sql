-- Message Flash : texte optionnel joint à une demande de contact (type='request').
-- RÉSERVÉ AUX MEMBRES PREMIUM. Visible par le destinataire dans le popup
-- "Demandes en attente" du dashboard.
--
-- Appliqué en prod le 2026-07-13 (migrations Supabase add_flash_message_to_likes
-- puis restrict_flash_message_to_premium).

-- 1. Colonne du message flash.
alter table public.likes
  add column if not exists flash_message text;

comment on column public.likes.flash_message is
  'Message personnalisé (Message Flash) joint à une demande de contact par un membre Premium.';

-- 2. Garantie côté base : seul un membre Premium peut joindre un flash_message.
--    Un non-Premium peut toujours envoyer une demande, mais sans message flash.
drop policy if exists sender_insert_own_likes on public.likes;

create policy sender_insert_own_likes
  on public.likes
  for insert
  to authenticated
  with check (
    auth.uid() = sender_id
    and (
      flash_message is null
      or exists (
        select 1 from public.profiles p
        where p.user_id = auth.uid() and p.is_premium = true
      )
    )
  );
