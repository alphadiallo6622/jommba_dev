-- Temoin d'onboarding termine, distinct du genre.
--
-- Jusqu'ici, `gender is not null` servait de temoin : le formulaire n'ecrivait
-- qu'une fois, a la derniere etape, donc avoir un genre impliquait avoir tout
-- fini. Revers de la medaille : quelqu'un qui abandonnait a l'etape 6 etait
-- enregistre comme n'ayant rien fait, et repartait de zero a chaque visite.
--
-- Les etapes sont desormais enregistrees au fur et a mesure. Le genre ne
-- signifie donc plus que « onboarding commence », d'ou cette colonne.

alter table public.profiles
  add column if not exists onboarding_completed_at timestamptz;

-- Reprise : tout profil ayant un genre sous l'ancien regime avait forcement
-- termine, puisque rien n'etait ecrit avant la derniere etape.
update public.profiles
set    onboarding_completed_at = coalesce(validated_at, updated_at, created_at)
where  gender is not null
  and  onboarding_completed_at is null;

create index if not exists profiles_onboarding_completed_idx
  on public.profiles (onboarding_completed_at);
