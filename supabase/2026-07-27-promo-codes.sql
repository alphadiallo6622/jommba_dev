-- Codes promo Premium — gérés depuis la console admin, validés/consommés côté
-- serveur (service_role) uniquement à l'achat. Pas de policy publique : comme
-- platform_settings/api_connections, cette table n'est jamais lue directement
-- par le client, seulement via createAdminClient().
create table if not exists public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  discount_type text not null check (discount_type in ('percent', 'fixed_amount')),
  value numeric(10, 2) not null check (value > 0),
  applicable_plans text[],
  expires_at timestamptz,
  usage_limit integer check (usage_limit is null or usage_limit > 0),
  times_used integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Un seul code par valeur, insensible à la casse (les codes sont normalisés en
-- majuscules à l'écriture, mais l'index protège aussi contre une insertion directe).
create unique index if not exists promo_codes_code_upper_idx on public.promo_codes (upper(code));

alter table public.promo_codes enable row level security;
