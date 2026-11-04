-- 2026-11-04 — Lieu d'installation de la PWA
--
-- La table ne disait que « combien », pas « où ». Deux colonnes s'ajoutent,
-- renseignées par /api/pwa/install à partir des en-têtes de géolocalisation du
-- réseau Edge de Vercel (`x-vercel-ip-country`, `x-vercel-ip-city`). Elles
-- restent nulles en développement local et derrière certains VPN : la console
-- retombe alors sur la ville déclarée dans le profil du membre.
--
-- L'insertion quitte le navigateur pour cette route serveur : seule elle voit
-- ces en-têtes. La politique d'insertion ouverte aux visiteurs n'a donc plus
-- lieu d'être, l'écriture passant par la clé service_role.

alter table public.pwa_installs
  add column if not exists country text,  -- ISO 3166-1 alpha-2
  add column if not exists city    text;

create index if not exists idx_pwa_installs_country
  on public.pwa_installs(country);

comment on column public.pwa_installs.country is
  'Code pays ISO alpha-2 releve a l''installation (en-tete Vercel). Nul si indisponible.';
comment on column public.pwa_installs.city is
  'Ville relevee a l''installation (en-tete Vercel). Nulle si indisponible.';

-- Plus aucune écriture ne vient du navigateur.
drop policy if exists "anyone_records_own_pwa_install" on public.pwa_installs;
