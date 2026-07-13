-- Blocage par pays : l'admin peut rendre le site indisponible dans certains
-- pays (ou, à l'inverse, ne l'autoriser que dans une liste blanche).
--
-- Le drapeau vit dans platform_settings.geo_block (JSONB) et est exposé
-- publiquement via une vue restreinte public_geo_block, afin que le middleware
-- Edge (proxy.ts) le lise sans clé service_role — exactement comme
-- public_maintenance pour le mode maintenance.
--
-- Forme : { "enabled": bool, "mode": "block"|"allow", "countries": ["SN", ...] }
--   mode "block" : les pays listés (code ISO 3166-1 alpha-2) sont bloqués.
--   mode "allow" : SEULS les pays listés sont autorisés.
--
-- Appliqué en prod le 2026-07-13 (migration geo_block_settings).

-- 1. Champ de configuration.
alter table public.platform_settings
  add column if not exists geo_block jsonb not null
  default '{"enabled": false, "mode": "block", "countries": []}'::jsonb;

comment on column public.platform_settings.geo_block is
  'Blocage par pays : { enabled, mode ("block"|"allow"), countries (codes ISO alpha-2) }.';

-- 2. Vue publique en lecture seule pour le middleware Edge (anon).
create or replace view public.public_geo_block
with (security_invoker = false) as
select
  coalesce((geo_block ->> 'enabled')::boolean, false) as enabled,
  coalesce(geo_block ->> 'mode', 'block')             as mode,
  coalesce(geo_block -> 'countries', '[]'::jsonb)     as countries
from public.platform_settings
where id = 1;

grant select on public.public_geo_block to anon, authenticated;
