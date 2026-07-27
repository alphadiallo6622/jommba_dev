-- Tarification des boosts, réglable depuis la console admin (Paramètres).
-- Chaque durée a son propre montant, modifiable indépendamment des autres.
alter table public.platform_settings
  add column if not exists boost_pricing jsonb not null
  default '{"24h": 2.5, "3j": 5, "7j": 8}'::jsonb;

comment on column public.platform_settings.boost_pricing is
  'Prix des boosts en USD par durée (24h / 3j / 7j). Lu par lib/admin/queries.ts et la route /api/payments/boost.';

-- Le défaut de `pricing` référençait encore des champs supprimés depuis
-- (launchPrice, normalPrice, refundWindow) : on l'aligne sur les seuls
-- réglages réellement utilisés.
alter table public.platform_settings
  alter column pricing set default '{"monthlyPrice": 10, "autoValidate": false}'::jsonb;
