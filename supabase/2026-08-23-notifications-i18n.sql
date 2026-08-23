-- 2026-08-23 — Notifications traduisibles
--
-- Les notifications étaient insérées avec un titre et un corps figés en
-- français, donc illisibles pour un membre en anglais. On ajoute désormais une
-- clé de traduction et ses paramètres dans `data` :
--
--   data = { "target_id": "...", "i18n": "newMessage", "params": { "name": "Barry" } }
--
-- `title` / `body` restent renseignés en français : ils servent de repli pour
-- les lignes déjà en base et pour tout ce qui lit la table hors de l'app
-- (emails, console admin, exports).

-- ─── Nouveau message ─────────────────────────────────────────────────────────
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
           jsonb_build_object(
             'target_id', new.sender_id,
             'i18n', 'newMessage',
             'params', jsonb_build_object('name', coalesce(p.first_name, ''))
           )
      from public.profiles p
     where p.user_id = new.sender_id;
  end if;

  return new;
end;
$$;

-- ─── Nouvelle demande de contact ─────────────────────────────────────────────
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
           jsonb_build_object(
             'target_id', new.sender_id,
             'i18n', 'newRequest',
             'params', jsonb_build_object('name', coalesce(p.first_name, ''))
           )
      from public.profiles p
     where p.user_id = new.sender_id;
  end if;
  return new;
end;
$$;

-- ─── Réponse à une demande ───────────────────────────────────────────────────
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
             jsonb_build_object(
               'target_id', new.receiver_id,
               'i18n', 'requestAccepted',
               'params', jsonb_build_object('name', coalesce(p.first_name, ''))
             )
        from public.profiles p
       where p.user_id = new.receiver_id;
    elsif new.status = 'rejected' then
      insert into public.notifications (user_id, type, title, body, data)
      values (new.sender_id,
              'decline',
              'Demande déclinée',
              'Ta demande n''a pas été acceptée cette fois-ci. Continue d''explorer !',
              jsonb_build_object('i18n', 'requestDeclined'));
    end if;
  end if;
  return new;
end;
$$;

-- ─── Nouvelle visite de profil ───────────────────────────────────────────────
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
          jsonb_build_object(
            'target_id', new.visitor_id,
            'i18n', 'newVisit'
          ));
  return new;
end;
$$;

-- ─── Rattrapage des lignes existantes ────────────────────────────────────────
-- On reconnaît les notifications déjà en base à leur titre français figé et on
-- leur ajoute la clé de traduction correspondante. Le prénom est extrait du
-- corps du message (tout ce qui précède le premier espace).

update public.notifications
   set data = coalesce(data, '{}'::jsonb) || jsonb_build_object(
         'i18n', 'newMessage',
         'params', jsonb_build_object('name', split_part(body, ' ', 1))
       )
 where title = 'Nouveau message' and data->>'i18n' is null;

update public.notifications
   set data = coalesce(data, '{}'::jsonb) || jsonb_build_object(
         'i18n', 'newRequest',
         'params', jsonb_build_object('name', split_part(body, ' ', 1))
       )
 where title = 'Nouvelle demande de contact' and data->>'i18n' is null;

update public.notifications
   set data = coalesce(data, '{}'::jsonb) || jsonb_build_object(
         'i18n', 'requestAccepted',
         'params', jsonb_build_object('name', split_part(body, ' ', 1))
       )
 where title = 'Demande acceptée 🎉' and data->>'i18n' is null;

update public.notifications
   set data = coalesce(data, '{}'::jsonb) || jsonb_build_object('i18n', 'requestDeclined')
 where title = 'Demande déclinée' and data->>'i18n' is null;

update public.notifications
   set data = coalesce(data, '{}'::jsonb) || jsonb_build_object('i18n', 'newVisit')
 where title = 'Nouvelle visite' and data->>'i18n' is null;

update public.notifications
   set data = coalesce(data, '{}'::jsonb) || jsonb_build_object('i18n', 'profileValidated')
 where title = 'Profil validé 🎉' and data->>'i18n' is null;

update public.notifications
   set data = coalesce(data, '{}'::jsonb) || jsonb_build_object('i18n', 'premiumGifted')
 where title = 'Premium offert 🎁' and data->>'i18n' is null;

update public.notifications
   set data = coalesce(data, '{}'::jsonb) || jsonb_build_object('i18n', 'subscriptionCancelled')
 where title = 'Abonnement résilié' and data->>'i18n' is null;

update public.notifications
   set data = coalesce(data, '{}'::jsonb) || jsonb_build_object('i18n', 'warning')
 where title = 'Avertissement' and data->>'i18n' is null;

update public.notifications
   set data = coalesce(data, '{}'::jsonb) || jsonb_build_object('i18n', 'photoRejected')
 where title = 'Photo de profil non conforme' and data->>'i18n' is null;
