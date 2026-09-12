-- ─── Blocage : fermeture des demandes de contact ──────────────────────────────
-- Complément de 2026-09-12-blocked-users.sql. Le blocage fermait la messagerie
-- (via are_contacts()) mais une nouvelle demande de contact partait encore : la
-- demande n'aurait jamais pu aboutir, puisque are_contacts() reste faux.
-- La règle de blocage est extraite dans is_blocked_pair() pour être partagée
-- entre are_contacts() et la policy d'insertion de likes.

CREATE OR REPLACE FUNCTION public.is_blocked_pair(a uuid, b uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  select exists (
    select 1 from public.blocked_users
    where (blocker_id = a and blocked_id = b)
       or (blocker_id = b and blocked_id = a)
  )
$function$;

CREATE OR REPLACE FUNCTION public.are_contacts(a uuid, b uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  select exists (
    select 1 from public.likes
    where type = 'request' and status = 'accepted'
      and (
        (sender_id = a and receiver_id = b) or
        (sender_id = b and receiver_id = a)
      )
  )
  and not public.is_blocked_pair(a, b)
$function$;

-- La policy garde ses deux règles d'origine (on n'insère que ses propres likes,
-- le message flash reste réservé aux Premium) et refuse en plus toute paire
-- bloquée. La table likes portant demandes et favoris, les deux sont couverts.
DROP POLICY IF EXISTS "sender_insert_own_likes" ON public.likes;
CREATE POLICY "sender_insert_own_likes"
  ON public.likes FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND (
      flash_message IS NULL
      OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.user_id = auth.uid() AND p.is_premium = true
      )
    )
    AND NOT public.is_blocked_pair(sender_id, receiver_id)
  );
