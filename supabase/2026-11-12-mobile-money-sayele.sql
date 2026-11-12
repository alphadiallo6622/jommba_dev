-- Paiement Mobile Money (Sayele Gate) — additif, ne touche à rien d'existant.
--
-- Deux objets :
--   1. platform_settings.mobile_money (jsonb) : config éditable depuis la console
--      admin (clés chiffrées, URL webhook, taux USD→GNF, opérateurs). Sert de
--      surcharge ; à défaut on retombe sur les variables .env.local
--      (SECRET_KEY / WEBHOOK_SECRET_KEY / WH_URL_NOTIFICATION).
--   2. mobile_money_payments : suivi des transactions ASYNCHRONES. Contrairement
--      à Square (débit synchrone dans la requête), le Mobile Money se règle en
--      plusieurs temps (initiation → l'utilisateur valide sur son téléphone →
--      webhook `transaction.settled`). Cette table fait le lien entre la
--      transaction Sayele et le membre/plan, pour activer Premium à la
--      confirmation et suivre l'état côté client.
--
-- Rien de ceci ne modifie Square, les abonnements existants, ni la tarification.

-- 1) Colonne de configuration -------------------------------------------------
alter table public.platform_settings
  add column if not exists mobile_money jsonb not null default '{}'::jsonb;

comment on column public.platform_settings.mobile_money is
  'Config Mobile Money (Sayele). Valeurs sensibles chiffrées (AES-256-GCM, préfixe v1:). Surcharge le .env.local. Lu par lib/sayele/config.ts.';

-- 2) Suivi des transactions Mobile Money --------------------------------------
create table if not exists public.mobile_money_payments (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  provider         text not null default 'sayele',
  -- Identifiant de la transaction chez le prestataire (nul tant que la création
  -- n'a pas abouti). Unique pour le rapprochement webhook.
  provider_tx_id   text unique,
  -- Référence interne envoyée au prestataire (customerReference) = id de la ligne.
  reference        text,
  kind             text not null default 'premium' check (kind in ('premium')),
  plan_id          text not null check (plan_id in ('15j', '1m', '3m', '6m')),
  operator         text not null check (operator in ('orange', 'mtn')),
  phone            text not null,
  amount_usd       numeric not null,
  -- Montant réellement débité, en GNF (devise sans sous-unité : minor == major).
  amount_minor     bigint not null,
  currency         text not null default 'GNF',
  promo_id         uuid,
  promo_code       text,
  status           text not null default 'pending'
                     check (status in ('pending', 'processing', 'settled', 'failed', 'expired')),
  -- Abonnement créé à l'activation (idempotence : non nul ⇒ déjà activé).
  subscription_id  uuid,
  locale           text,
  raw              jsonb,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  settled_at       timestamptz
);

create index if not exists mobile_money_payments_user_idx    on public.mobile_money_payments (user_id, created_at desc);
create index if not exists mobile_money_payments_status_idx   on public.mobile_money_payments (status);
create index if not exists mobile_money_payments_provider_idx on public.mobile_money_payments (provider_tx_id);

comment on table public.mobile_money_payments is
  'Transactions Mobile Money (Sayele). Écrit/relu uniquement côté serveur (service_role) : initiation /api/payments/mobile-money, webhook /api/webhooks/sayele, polling /api/payments/mobile-money/status.';

-- RLS activé sans policy publique : seul le service_role (côté serveur) y accède,
-- comme pour les écritures d'abonnement. Aucun accès direct client.
alter table public.mobile_money_payments enable row level security;
