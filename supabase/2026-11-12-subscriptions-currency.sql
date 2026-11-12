-- Séparation des devises sur les abonnements.
--
-- Jusqu'ici `subscriptions` ne stockait que `price_usd` : un paiement Mobile
-- Money (réglé en GNF) apparaissait donc en USD. On ajoute la devise de
-- règlement et le montant réellement payé dans cette devise, pour afficher et
-- agréger séparément les $ (Square) et les GNF (Mobile Money).
--
-- Additif et non destructif : Square n'est pas modifié (currency NULL = USD,
-- montant = price_usd). Seuls les abonnements Mobile Money portent GNF.

alter table public.subscriptions
  add column if not exists currency text,
  add column if not exists amount_native numeric;

comment on column public.subscriptions.currency is
  'Devise de règlement du paiement : USD (Square, défaut) ou GNF (Mobile Money).';
comment on column public.subscriptions.amount_native is
  'Montant réellement payé dans la devise de règlement (ex. 3000 pour 3000 GNF). Pour USD, price_usd fait foi.';

-- Backfill des abonnements Mobile Money déjà activés, depuis la transaction liée.
update public.subscriptions s
set currency = coalesce(s.currency, mmp.currency),
    amount_native = coalesce(s.amount_native, mmp.amount_minor)
from public.mobile_money_payments mmp
where mmp.subscription_id = s.id
  and s.payment_method = 'mobile_money';
