-- 2026-11-04 — Compteur d'installations de la PWA
--
-- Une ligne par installation constatée. Il n'existe aucune API navigateur qui
-- dise « cette app est installée » à distance : la détection se fait côté
-- client (événement `appinstalled` sur Chromium, lancement en mode standalone
-- partout ailleurs, iOS compris) et chaque appareil ne s'enregistre qu'une
-- fois, grâce à un drapeau localStorage.
--
-- `user_id` est facultatif : une installation depuis une page publique, avant
-- toute connexion, est tout de même comptée.

create table if not exists public.pwa_installs (
  id           uuid primary key default gen_random_uuid(),
  -- `on delete set null` et non `cascade` : la suppression d'un compte ne doit
  -- pas réécrire l'histoire du compteur.
  user_id      uuid references auth.users(id) on delete set null,
  platform     text not null default 'unknown'
                 check (platform in ('android', 'ios', 'desktop', 'unknown')),
  user_agent   text,
  installed_at timestamptz not null default now()
);

create index if not exists idx_pwa_installs_installed_at
  on public.pwa_installs(installed_at desc);

alter table public.pwa_installs enable row level security;

drop policy if exists "anyone_records_own_pwa_install" on public.pwa_installs;

-- L'insertion est ouverte aux visiteurs anonymes comme aux membres : la
-- bannière d'installation s'affiche avant la connexion. Un visiteur ne peut
-- écrire que son propre `user_id` (ou aucun), et ne peut rien relire : la
-- lecture passe par la clé service_role de la console d'administration.
create policy "anyone_records_own_pwa_install"
  on public.pwa_installs for insert to anon, authenticated
  with check (user_id is null or auth.uid() = user_id);

comment on table public.pwa_installs is
  'Une ligne par installation de la PWA constatée côté client. Alimente le KPI « Apps installées » de la console.';
