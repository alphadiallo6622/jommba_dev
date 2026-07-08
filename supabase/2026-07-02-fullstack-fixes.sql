-- ============================================================================
-- Migration 2026-07-02 — Passage FullStack complet
-- Appliquée en production via MCP Supabase (migrations :
--   fix_rls_policies_and_missing_columns, notification_triggers_and_realtime)
-- Ce fichier documente l'état pour re-création d'un environnement.
-- ============================================================================

-- ─── 1. Policies RLS manquantes ──────────────────────────────────────────────

-- Le destinataire d'une demande doit pouvoir accepter/refuser (UPDATE status)
create policy "receiver_can_respond_to_likes" on public.likes
  for update
  using (auth.uid() = receiver_id)
  with check (auth.uid() = receiver_id);

-- Le destinataire d'un message doit pouvoir le marquer comme lu
create policy "receiver_marks_messages_read" on public.messages
  for update
  using (auth.uid() = receiver_id)
  with check (auth.uid() = receiver_id);

-- Le visiteur peut mettre à jour sa propre visite (upsert visited_at)
create policy "visitor_updates_own_visit" on public.profile_visitors
  for update
  using (auth.uid() = visitor_id)
  with check (auth.uid() = visitor_id);

-- ─── 2. Visites : une seule ligne par paire (visitor, profile) ───────────────

delete from public.profile_visitors a
using public.profile_visitors b
where a.visitor_id = b.visitor_id
  and a.profile_id = b.profile_id
  and (a.visited_at < b.visited_at or (a.visited_at = b.visited_at and a.id < b.id));

alter table public.profile_visitors
  add constraint profile_visitors_visitor_profile_key unique (visitor_id, profile_id);

-- ─── 3. Colonnes manquantes ──────────────────────────────────────────────────

alter table public.profiles add column if not exists flaws text;

alter table public.user_preferences
  add column if not exists push_enabled  boolean not null default true,
  add column if not exists email_demande boolean not null default true,
  add column if not exists email_message boolean not null default true,
  add column if not exists email_promo   boolean not null default true;

-- ─── 4. Triggers de notifications (SECURITY DEFINER) ─────────────────────────

-- Nouveau message : met à jour last_message_at + notifie le destinataire
create or replace function public.handle_new_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations
     set last_message_at = new.created_at
   where id = new.conversation_id;

  if not exists (
    select 1 from public.notifications
     where user_id = new.receiver_id
       and type = 'message'
       and is_read = false
       and data->>'target_id' = new.sender_id::text
  ) then
    insert into public.notifications (user_id, type, title, body, data)
    select new.receiver_id,
           'message',
           'Nouveau message',
           coalesce(p.first_name, 'Un membre') || ' t''a envoyé un message',
           jsonb_build_object('target_id', new.sender_id)
      from public.profiles p
     where p.user_id = new.sender_id;
  end if;

  return new;
end;
$$;

drop trigger if exists on_message_created on public.messages;
create trigger on_message_created
  after insert on public.messages
  for each row execute function public.handle_new_message();

-- Nouvelle demande de contact : notifie le destinataire
create or replace function public.handle_new_like()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.type = 'request' then
    insert into public.notifications (user_id, type, title, body, data)
    select new.receiver_id,
           'demande',
           'Nouvelle demande de contact',
           coalesce(p.first_name, 'Un membre') || ' souhaite entrer en contact avec toi',
           jsonb_build_object('target_id', new.sender_id)
      from public.profiles p
     where p.user_id = new.sender_id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_like_created on public.likes;
create trigger on_like_created
  after insert on public.likes
  for each row execute function public.handle_new_like();

-- Réponse à une demande : notifie l'expéditeur (acceptée / refusée)
create or replace function public.handle_like_response()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.type = 'request' and old.status = 'pending' and new.status <> old.status then
    if new.status = 'accepted' then
      insert into public.notifications (user_id, type, title, body, data)
      select new.sender_id,
             'demande',
             'Demande acceptée 🎉',
             coalesce(p.first_name, 'Un membre') || ' a accepté ta demande. Vous pouvez discuter !',
             jsonb_build_object('target_id', new.receiver_id)
        from public.profiles p
       where p.user_id = new.receiver_id;
    elsif new.status = 'rejected' then
      insert into public.notifications (user_id, type, title, body, data)
      values (new.sender_id,
              'decline',
              'Demande déclinée',
              'Ta demande n''a pas été acceptée cette fois-ci. Continue d''explorer !',
              null);
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists on_like_responded on public.likes;
create trigger on_like_responded
  after update on public.likes
  for each row execute function public.handle_like_response();

-- Nouvelle visite de profil : notifie le propriétaire
create or replace function public.handle_new_visit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, type, title, body, data)
  values (new.profile_id,
          'visite',
          'Nouvelle visite',
          'Quelqu''un a consulté ton profil',
          jsonb_build_object('target_id', new.visitor_id));
  return new;
end;
$$;

drop trigger if exists on_visit_created on public.profile_visitors;
create trigger on_visit_created
  after insert on public.profile_visitors
  for each row execute function public.handle_new_visit();

-- ─── 5. Realtime : diffusion des nouveaux messages ───────────────────────────
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;

-- ─── 6. Faille corrigée : auto-acceptation par l'expéditeur ──────────────────
-- (migration fix_likes_sender_self_accept_hole)
-- owner_manage_own_likes (FOR ALL) permettait à l'expéditeur de passer sa
-- propre demande en 'accepted'. Remplacé par INSERT/SELECT/DELETE uniquement.

drop policy if exists "owner_manage_own_likes" on public.likes;

create policy "sender_insert_own_likes" on public.likes
  for insert with check (auth.uid() = sender_id);

create policy "sender_read_own_likes" on public.likes
  for select using (auth.uid() = sender_id);

create policy "sender_delete_own_likes" on public.likes
  for delete using (auth.uid() = sender_id);

-- Défense en profondeur : transitions de statut verrouillées par trigger
create or replace function public.enforce_like_transitions()
returns trigger
language plpgsql
as $$
begin
  if new.sender_id   <> old.sender_id
     or new.receiver_id <> old.receiver_id
     or new.type        <> old.type then
    raise exception 'Modification de l''identité d''un like interdite';
  end if;

  if auth.uid() is not null
     and coalesce(auth.jwt() ->> 'role', '') <> 'admin'
     and old.status <> 'pending'
     and new.status is distinct from old.status then
    raise exception 'Cette demande a déjà été traitée';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_like_transitions on public.likes;
create trigger enforce_like_transitions
  before update on public.likes
  for each row execute function public.enforce_like_transitions();
