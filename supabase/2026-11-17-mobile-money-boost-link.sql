-- Lien transaction → boost, symétrique à `subscription_id` (Premium).
--
-- Garde-fou d'activation : l'activation Mobile Money crée l'objet (abonnement
-- ou boost) puis « verrouille » la transaction en y inscrivant l'id de façon
-- atomique (update ... where <lien> is null). Ce lien sert à la fois de
-- marqueur « activé » et de clé d'idempotence (le perdant d'une course
-- supprime son doublon). Premium disposait déjà de `subscription_id` ; on
-- ajoute l'équivalent pour les Boosts.
--
-- Il permet aussi la réconciliation : un paiement `settled` sans lien = une
-- activation à reprendre (cf. /api/cron/mobile-money-reconcile).

alter table public.mobile_money_payments
  add column if not exists boost_id uuid references public.boosts(id);

comment on column public.mobile_money_payments.boost_id is
  'Boost créé par ce paiement (kind = boost). NULL tant que non activé. Équivalent de subscription_id côté Premium.';
