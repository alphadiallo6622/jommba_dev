-- Presence : touch_last_seen() n ecrit plus qu une fois par minute.
--
-- PresenceProvider bat toutes les 60 s et appelle aussi la fonction a chaque
-- retour sur l onglet : sans ce garde-fou, un va-et-vient entre onglets
-- reecrit la ligne en rafale. La fenetre de 50 s laisse passer le battement
-- regulier sans jamais le retarder.
--
-- C est cette colonne que la console admin compte pour afficher les membres
-- connectes (fenetre de 5 minutes, cf. getOverviewData).

create or replace function public.touch_last_seen()
returns void
language sql
security definer
set search_path to 'public'
as $function$
  update public.profiles
  set    last_seen_at = now()
  where  user_id = auth.uid()
    and  (last_seen_at is null or last_seen_at < now() - interval '50 seconds');
$function$;
