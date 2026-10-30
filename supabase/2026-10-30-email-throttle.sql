-- 2026-10-30 — Espacement des e-mails de notification
--
-- Ce que fait cette migration :
--   1. user_preferences.last_message_email_at : date du dernier e-mail
--      « nouveau message » envoyé à ce membre.
--   2. user_preferences.last_demande_email_at : idem pour « nouvelle demande
--      de contact ».
--
-- Pourquoi : chaque message et chaque demande déclenchait un e-mail. Sur la
-- journée du 2026-10-30, cela représentait 757 envois (297 messages + 460
-- demandes) pour 426 membres — à comparer aux 100 e-mails/jour du plan Resend
-- gratuit, saturé en fin d'après-midi. Les membres reçoivent déjà une
-- notification in-app et un push pour ces mêmes événements (migration
-- 2026-09-20), l'e-mail faisait donc doublon.
--
-- app/api/notify-email/route.ts n'envoie désormais qu'un e-mail par type et
-- par fenêtre de 5 h, et saute l'envoi si le membre a été vu sur le site dans
-- les 15 dernières minutes (profiles.last_seen_at). Sur les mêmes données,
-- les 757 envois tombent à 191 avant même le filtre d'activité.
--
-- Le suivi doit être persistant : chaque instance serverless repartirait
-- sinon de zéro et l'espacement ne tiendrait pas.
--
-- NULL = aucun e-mail de ce type encore envoyé à ce membre.

alter table public.user_preferences
  add column if not exists last_message_email_at timestamptz,
  add column if not exists last_demande_email_at timestamptz;
