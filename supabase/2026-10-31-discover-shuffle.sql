-- Exploration : tirage aleatoire stable + pagination.
--
-- Avant, le client chargeait au plus 50 profils ordonnes par date de creation,
-- si bien que la majorite des membres n etait jamais vue. On remplace cela par
-- un tirage cote serveur ordonne par md5(graine || user_id) : la graine est
-- tiree a chaque chargement de page, donc l ordre change a chaque
-- actualisation, mais il reste stable d une page a l autre -- condition pour
-- que la pagination ne saute ni ne repete aucun profil.
--
-- Les profils bloques (dans les deux sens) sont ecartes ici plutot que cote
-- client : sinon une page de 24 pouvait en afficher moins sans raison visible.

create or replace function public.discover_profiles(
  p_viewer     uuid,
  p_gender     text,
  p_seed       text,
  p_completion int,
  p_limit      int,
  p_offset     int
)
returns setof public.profiles
language sql
stable
security invoker
set search_path = public
as $$
  select p.*
  from   public.profiles p
  where  p.user_id <> p_viewer
    and  p.status     = 'validated'
    and  p.visibility = 'active'
    and  p.gender     = p_gender
    and  p.avatar_url is not null
    and  p.profile_completion >= p_completion
    and  not exists (
           select 1 from public.blocked_users b
           where (b.blocker_id = p_viewer and b.blocked_id = p.user_id)
              or (b.blocker_id = p.user_id and b.blocked_id = p_viewer)
         )
  order by md5(p_seed || p.user_id::text)
  limit  p_limit
  offset p_offset;
$$;

-- Total affichable, pour le compteur « N profils » de l en-tete.
create or replace function public.discover_profiles_count(
  p_viewer     uuid,
  p_gender     text,
  p_completion int
)
returns int
language sql
stable
security invoker
set search_path = public
as $$
  select count(*)::int
  from   public.profiles p
  where  p.user_id <> p_viewer
    and  p.status     = 'validated'
    and  p.visibility = 'active'
    and  p.gender     = p_gender
    and  p.avatar_url is not null
    and  p.profile_completion >= p_completion
    and  not exists (
           select 1 from public.blocked_users b
           where (b.blocker_id = p_viewer and b.blocked_id = p.user_id)
              or (b.blocker_id = p.user_id and b.blocked_id = p_viewer)
         );
$$;

grant execute on function public.discover_profiles(uuid, text, text, int, int, int) to authenticated;
grant execute on function public.discover_profiles_count(uuid, text, int) to authenticated;

-- Soutient le filtre commun a toutes les pages d exploration.
create index if not exists profiles_discover_idx
  on public.profiles (gender, status, visibility, profile_completion);
