-- ─── Blocage de membres ───────────────────────────────────────────────────────
-- Un membre peut bloquer un autre depuis la discussion. Le blocage ferme la
-- messagerie des deux côtés mais laisse la demande de contact intacte : le
-- déblocage rouvre la discussion sans refaire de demande.

CREATE TABLE IF NOT EXISTS public.blocked_users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (blocker_id, blocked_id),
  CHECK (blocker_id <> blocked_id)
);

CREATE INDEX IF NOT EXISTS blocked_users_blocker_idx ON public.blocked_users (blocker_id);
CREATE INDEX IF NOT EXISTS blocked_users_blocked_idx ON public.blocked_users (blocked_id);

ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- Les deux côtés de la paire lisent la ligne : le membre bloqué doit pouvoir
-- constater que la discussion est fermée, sans pouvoir supprimer le blocage.
DROP POLICY IF EXISTS "pair_reads_blocks" ON public.blocked_users;
CREATE POLICY "pair_reads_blocks"
  ON public.blocked_users FOR SELECT
  TO authenticated
  USING (auth.uid() = blocker_id OR auth.uid() = blocked_id);

DROP POLICY IF EXISTS "owner_inserts_own_blocks" ON public.blocked_users;
CREATE POLICY "owner_inserts_own_blocks"
  ON public.blocked_users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = blocker_id);

DROP POLICY IF EXISTS "owner_deletes_own_blocks" ON public.blocked_users;
CREATE POLICY "owner_deletes_own_blocks"
  ON public.blocked_users FOR DELETE
  TO authenticated
  USING (auth.uid() = blocker_id);

DROP POLICY IF EXISTS "admin_full_access_blocks" ON public.blocked_users;
CREATE POLICY "admin_full_access_blocks"
  ON public.blocked_users FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- are_contacts() garde les policies d'insertion de messages et de conversations :
-- y ajouter le blocage suffit à fermer la messagerie côté base, dans les deux
-- sens, sans toucher aux policies elles-mêmes.
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
  and not exists (
    select 1 from public.blocked_users
    where (blocker_id = a and blocked_id = b)
       or (blocker_id = b and blocked_id = a)
  )
$function$;
