-- 2026-09-20 — Notifications push + badge de l'icône PWA
--
-- Ce que fait cette migration :
--   1. push_subscriptions : un abonnement Web Push par navigateur/appareil.
--   2. profiles.last_seen_at + touch_last_seen() : dernière activité (rappel
--      d'inactivité à 7 jours).
--   3. unread_badge_count() : compteur du badge = messages non lus + notifications
--      non lues (hors « message », déjà comptées via la table messages).
--   4. notifications ajoutée à la publication Realtime (badge en direct).
--   5. Trigger AFTER INSERT sur notifications : appelle /api/push/send via pg_net.
--      TOUTE ligne insérée dans notifications (triggers existants, actions admin,
--      paiements, crons) déclenche donc le push, sans modifier ces émetteurs.
--
-- Le trigger ne peut jamais faire échouer l'insertion d'une notification : toute
-- erreur (secret absent, réseau…) est avalée.
--
-- ─── À FAIRE UNE FOIS, APRÈS AVOIR APPLIQUÉ CE FICHIER ──────────────────────
-- Renseigner deux secrets dans Supabase Vault (SQL Editor). La valeur de
-- push_webhook_secret doit être IDENTIQUE à la variable PUSH_WEBHOOK_SECRET de
-- Vercel :
--
--   select vault.create_secret('https://jommba.com', 'push_site_url');
--   select vault.create_secret('<PUSH_WEBHOOK_SECRET>', 'push_webhook_secret');
--
-- Tant que ces secrets sont absents, aucun push n'est envoyé (rien ne casse).

create extension if not exists pg_net;

-- ─── 1. Abonnements push ─────────────────────────────────────────────────────
create table if not exists public.push_subscriptions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  endpoint     text not null unique,
  p256dh       text not null,
  auth         text not null,
  locale       text not null default 'fr',
  user_agent   text,
  created_at   timestamptz not null default now(),
  last_used_at timestamptz
);

create index if not exists idx_push_subscriptions_user_id
  on public.push_subscriptions(user_id);

alter table public.push_subscriptions enable row level security;

drop policy if exists "owner_reads_own_push_subscriptions"   on public.push_subscriptions;
drop policy if exists "owner_deletes_own_push_subscriptions" on public.push_subscriptions;

-- Le membre peut lister et supprimer ses abonnements. L'écriture (upsert) passe
-- par /api/push/subscribe avec la clé service_role : un même navigateur peut
-- changer de compte, et l'endpoint (unique) doit alors changer de propriétaire.
create policy "owner_reads_own_push_subscriptions"
  on public.push_subscriptions for select to authenticated
  using (auth.uid() = user_id);

create policy "owner_deletes_own_push_subscriptions"
  on public.push_subscriptions for delete to authenticated
  using (auth.uid() = user_id);

-- ─── 2. Dernière activité ────────────────────────────────────────────────────
alter table public.profiles
  add column if not exists last_seen_at timestamptz;

-- Les membres existants démarrent le compteur d'inactivité à la mise en ligne :
-- sans cela, tout le monde recevrait « tu nous manques » dès le premier cron.
update public.profiles set last_seen_at = now() where last_seen_at is null;

create or replace function public.touch_last_seen()
returns void
language sql
security definer
set search_path = public
as $$
  update public.profiles set last_seen_at = now() where user_id = auth.uid();
$$;

revoke all on function public.touch_last_seen() from public, anon;
grant execute on function public.touch_last_seen() to authenticated;

-- ─── 3. Compteur du badge ────────────────────────────────────────────────────
create or replace function public.unread_badge_count(uid uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select
    (select count(*) from public.messages
      where receiver_id = uid and is_read = false)
  + (select count(*) from public.notifications
      where user_id = uid and is_read = false and type <> 'message');
$$;

-- Version interne (serveur uniquement) : ne doit pas permettre de lire le
-- compteur d'un autre membre.
revoke all on function public.unread_badge_count(uuid) from public, anon, authenticated;
grant execute on function public.unread_badge_count(uuid) to service_role;

-- Version client : toujours le compteur de l'utilisateur connecté.
create or replace function public.my_unread_badge_count()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select public.unread_badge_count(auth.uid());
$$;

revoke all on function public.my_unread_badge_count() from public, anon;
grant execute on function public.my_unread_badge_count() to authenticated;

-- ─── 4. Realtime sur notifications ───────────────────────────────────────────
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
     where pubname = 'supabase_realtime'
       and schemaname = 'public'
       and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end $$;

-- ─── 5. Trigger d'envoi du push ──────────────────────────────────────────────
create or replace function public.notify_push_on_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  site_url text;
  webhook_secret text;
begin
  select decrypted_secret into site_url
    from vault.decrypted_secrets where name = 'push_site_url' limit 1;
  select decrypted_secret into webhook_secret
    from vault.decrypted_secrets where name = 'push_webhook_secret' limit 1;

  -- Secrets non configurés : on ne fait rien.
  if site_url is null or webhook_secret is null then
    return new;
  end if;

  perform net.http_post(
    url     := site_url || '/api/push/send',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-push-secret', webhook_secret
    ),
    body    := jsonb_build_object('notification_id', new.id)
  );

  return new;
exception when others then
  -- Un souci de push ne doit jamais bloquer l'enregistrement de la notification.
  return new;
end;
$$;

drop trigger if exists on_notification_push on public.notifications;
create trigger on_notification_push
  after insert on public.notifications
  for each row execute function public.notify_push_on_notification();
