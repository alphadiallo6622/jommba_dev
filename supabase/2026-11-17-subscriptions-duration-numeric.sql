-- `duration_months` : entier → numeric, pour les plans d'une demi-durée.
--
-- Le plan « 15 jours » vaut 0,5 mois. La colonne était `integer NOT NULL` :
-- insérer 0,5 échouait, donc AUCUN abonnement 15 jours ne pouvait être créé
-- (le paiement restait bloqué `settled` sans abonnement — compte non activé,
-- revenu invisible). Les plans 1/3/6 mois (entiers) n'étaient pas touchés.
--
-- On élargit la colonne en `numeric` pour stocker la durée réelle (0,5 pour
-- 15 jours). Élargissement non destructif : les valeurs entières existantes
-- sont conservées telles quelles. La durée d'accès reste portée par
-- `current_period_end` ; `duration_months` ne sert qu'à l'affichage et aux
-- métriques.

alter table public.subscriptions
  alter column duration_months type numeric using duration_months::numeric;

comment on column public.subscriptions.duration_months is
  'Durée de l''abonnement en mois (0,5 = plan 15 jours). La durée d''accès réelle est portée par current_period_end.';
