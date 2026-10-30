-- 2026-10-30 — Interrupteurs d'e-mails de notification (console admin)
--
-- Ce que fait cette migration :
--   1. platform_settings.notifications : un booléen par type d'e-mail de
--      notification, réglable depuis Paramètres > Notifications par e-mail.
--
-- Clés actuelles :
--   - demande : « Nouvelle demande de contact » et « Ta demande a été acceptée »
--   - message : « Nouveau message sur Jommba »
--
-- Ces interrupteurs s'ajoutent aux préférences individuelles
-- (user_preferences.email_demande / email_message) : l'e-mail ne part que si le
-- membre ET l'administrateur l'autorisent. Couper un interrupteur n'affecte ni
-- les notifications in-app ni les push (migration 2026-09-20), et ne touche pas
-- aux e-mails essentiels (mot de passe oublié, confirmation de paiement).
--
-- app/api/notify-email/route.ts ne bloque que sur un `false` explicite :
-- réglage absent ou lecture impossible laisse passer l'envoi, pour qu'un
-- incident de configuration ne prive jamais les membres de leurs notifications.
--
-- Valeur par défaut = tout activé, afin que le comportement reste identique
-- tant que l'administrateur ne touche à rien.

alter table public.platform_settings
  add column if not exists notifications jsonb
  not null default '{"demande": true, "message": true}'::jsonb;
