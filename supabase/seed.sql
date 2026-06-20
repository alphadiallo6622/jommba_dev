-- ============================================================
-- JOMMBA — Données de test (seed)
-- ============================================================
-- PRÉREQUIS : Créer d'abord les comptes Auth via le Dashboard Supabase
-- ou via l'API Admin (voir instructions ci-dessous).
--
-- Comptes à créer dans Authentication > Users :
--
--   1. Email : abou.diallo@jommba.com  | Password : abou2024
--      → Copier l'UUID généré → remplacer USER_FREE_ID ci-dessous
--
--   2. Email : alphadiallo2308@gmail.com | Password : alpha2308
--      → Copier l'UUID généré → remplacer USER_PREMIUM_ID ci-dessous
--
--   3. Email : admin@jommba.com | Password : JommbaAdmin2026!
--      → Copier l'UUID → remplacer ADMIN_USER_ID ci-dessous
--
-- Après avoir créé les comptes, remplacer les UUIDs et exécuter ce script.
-- ============================================================

-- Remplacer ces UUIDs par ceux générés dans Supabase Auth
\set USER_FREE_ID    '00000000-0000-0000-0000-000000000001'
\set USER_PREMIUM_ID '00000000-0000-0000-0000-000000000002'
\set ADMIN_USER_ID   '00000000-0000-0000-0000-000000000003'

-- Explorer profiles UUIDs
\set PROFILE_01 '11111111-0000-0000-0000-000000000001'
\set PROFILE_02 '11111111-0000-0000-0000-000000000002'
\set PROFILE_03 '11111111-0000-0000-0000-000000000003'
\set PROFILE_04 '11111111-0000-0000-0000-000000000004'
\set PROFILE_05 '11111111-0000-0000-0000-000000000005'
\set PROFILE_06 '11111111-0000-0000-0000-000000000006'

-- ─── Mettre à jour les profils créés automatiquement par le trigger ───────────

UPDATE public.profiles SET
  first_name         = 'Abou',
  last_name          = 'Diallo',
  gender             = 'homme',
  age                = 32,
  height             = 180,
  city               = 'Dakar',
  country            = 'SN',
  avatar_url         = 'https://i.pravatar.cc/150?img=3',
  bio                = 'Un homme sérieux à la recherche d''une épouse pieuse.',
  marriage_vision    = 'Je vois le mariage comme un projet de vie sérieux, fondé sur la religion et la confiance mutuelle.',
  seeking            = 'Une femme pieuse, douce et sérieuse, avec qui construire une famille dans la bonne voie.',
  interests          = 'Football, lecture islamique, voyages, cuisine.',
  qualities          = 'Responsable, sincère, patient, attaché à mes valeurs.',
  dealbreakers       = 'La malhonnêteté et le manque de pudeur.',
  languages          = 'Français, Wolof, Arabe (notions)',
  madhhab            = 'Maliki',
  mosque_frequency   = 'Régulièrement',
  arabic_level       = 'Intermédiaire',
  marital_status     = 'Célibataire',
  education          = 'Bac+3',
  job                = 'Comptable',
  has_children       = 'Non',
  wants_children     = 'Oui',
  can_relocate       = 'À discuter',
  polygamy           = 'Ouvert',
  status             = 'pending',
  is_premium         = false,
  profile_completion = 86
WHERE user_id = :'USER_FREE_ID';

UPDATE public.profiles SET
  first_name         = 'Alpha',
  last_name          = 'Diallo',
  gender             = 'homme',
  age                = 29,
  height             = 175,
  city               = 'Dakar',
  country            = 'SN',
  avatar_url         = 'https://i.pravatar.cc/150?img=8',
  bio                = 'Ingénieur passionné par la foi et la famille.',
  marriage_vision    = 'Le mariage est la moitié de la religion. Je cherche une compagne sincère.',
  seeking            = 'Une femme cultivée, pieuse et équilibrée.',
  interests          = 'Lecture, sport, voyages halal, bénévolat, technologie.',
  qualities          = 'Ambitieux, doux, respectueux, fiable.',
  dealbreakers       = 'Le mensonge et l''absence de pratique religieuse.',
  languages          = 'Français, Wolof, Anglais, Arabe',
  madhhab            = 'Maliki',
  mosque_frequency   = 'Régulièrement',
  arabic_level       = 'Avancé',
  marital_status     = 'Célibataire',
  education          = 'Bac+5',
  job                = 'Ingénieur',
  has_children       = 'Non',
  wants_children     = 'Oui',
  can_relocate       = 'Oui',
  polygamy           = 'Non',
  status             = 'validated',
  is_premium         = true,
  profile_completion = 100
WHERE user_id = :'USER_PREMIUM_ID';

-- Mise à jour de la subscription premium
UPDATE public.subscriptions SET
  plan               = 'premium',
  status             = 'active',
  current_period_end = NOW() + INTERVAL '30 days'
WHERE user_id = :'USER_PREMIUM_ID';

-- ─── Profils de l'explorateur (utilisateurs fictifs validés) ─────────────────
-- Note : ces profils nécessitent des comptes Auth fictifs.
-- Pour la démo, on peut créer de faux comptes ou utiliser des UUID fixes.
-- Voici des exemples avec de vraies données.

-- Fa D. — Profil validé féminin
INSERT INTO public.profiles (id, user_id, first_name, last_name, gender, age, city, country,
  avatar_url, marital_status, job, marriage_vision, seeking, interests, qualities,
  madhhab, education, has_children, wants_children, can_relocate, polygamy,
  status, is_premium, profile_completion)
VALUES (
  :'PROFILE_01',
  :'PROFILE_01',  -- user_id fictif pour la démo
  'Fa', 'D.', 'femme', 47, 'Paris', 'FR',
  'https://i.pravatar.cc/400?img=47',
  'Divorcé(e)', 'Animatrice périscolaire',
  'Le mariage est une ancre solide, où foi et amour se rejoignent.',
  'Je cherche quelqu''un qui craint Allah, sincère et bienveillant.',
  'Balades, restaurant, cinéma, sport en salle.',
  'Bienveillante, à l''écoute, loyale et très gentille.',
  'Maliki', 'Baccalauréat', '1 enfant', 'J''en ai déjà', 'Oui', 'N''accepte pas',
  'validated', true, 90
) ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.profiles (id, user_id, first_name, last_name, gender, age, city, country,
  avatar_url, marital_status, job, marriage_vision, seeking, interests, qualities,
  madhhab, education, has_children, wants_children, can_relocate, polygamy,
  status, is_premium, profile_completion)
VALUES (
  :'PROFILE_02',
  :'PROFILE_02',
  'Fama', 'N.', 'femme', 29, 'Thiès', 'SN',
  'https://i.pravatar.cc/400?img=29',
  'Célibataire', 'Agent de sécurité',
  'Je cherche un partenaire sincère et pieux pour construire un foyer solide.',
  'Quelqu''un de sérieux et pratiquant, avec de bonnes valeurs familiales.',
  'Lecture, cuisine, sport.',
  'Honnête et sérieuse.',
  'Maliki', 'Bac+3', '0', 'J''en veux', 'Non', 'Non',
  'validated', true, 85
) ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.profiles (id, user_id, first_name, last_name, gender, age, city, country,
  avatar_url, marital_status, job, marriage_vision, seeking, interests, qualities,
  madhhab, education, has_children, wants_children, can_relocate, polygamy,
  status, is_premium, profile_completion)
VALUES (
  :'PROFILE_03',
  :'PROFILE_03',
  'Ndeye', 'G.', 'femme', 46, 'Montréal', 'CA',
  'https://i.pravatar.cc/400?img=46',
  'Divorcé(e)', 'Infirmière',
  'La foi avant tout. Je cherche une union bénie et durable.',
  'Un homme mature et posé, craignant Allah.',
  'Voyages, cuisine, lecture islamique.',
  'Discrète et fiable, très organisée.',
  'Maliki', 'Bac+5', '2', 'Indifférent', 'Oui', 'À discuter',
  'validated', false, 80
) ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.profiles (id, user_id, first_name, last_name, gender, age, city, country,
  avatar_url, marital_status, job, marriage_vision, seeking, interests, qualities,
  madhhab, education, has_children, wants_children, can_relocate, polygamy,
  status, is_premium, profile_completion)
VALUES (
  :'PROFILE_04',
  :'PROFILE_04',
  'Aïssatou', 'B.', 'femme', 27, 'Dakar', 'SN',
  'https://i.pravatar.cc/400?img=27',
  'Célibataire', 'Infirmière',
  'Le mariage est une sunnah que je souhaite honorer avec sérieux.',
  'Un homme pieux, travailleur et respectueux de sa famille.',
  'Médecine, lecture, cuisine africaine.',
  'Patiente, douce, sérieuse dans mes engagements.',
  'Maliki', 'Bac+3', '0', 'J''en veux', 'Selon les conditions', 'Non',
  'validated', false, 75
) ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.profiles (id, user_id, first_name, last_name, gender, age, city, country,
  avatar_url, marital_status, job, marriage_vision, seeking, interests, qualities,
  madhhab, education, has_children, wants_children, can_relocate, polygamy,
  status, is_premium, profile_completion)
VALUES (
  :'PROFILE_05',
  :'PROFILE_05',
  'Mariama', 'S.', 'femme', 33, 'Paris', 'FR',
  'https://i.pravatar.cc/400?img=33',
  'Célibataire', 'Comptable',
  'Trouver un compagnon de route pour ce monde et l''au-delà.',
  'Un homme cultivé, pieux, stable financièrement.',
  'Cinéma, voyages, cuisine.',
  'Autonome, souriante, très organisée.',
  'Maliki', 'Bac+5', '0', 'J''en veux', 'Non', 'N''accepte pas',
  'validated', false, 82
) ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.profiles (id, user_id, first_name, last_name, gender, age, city, country,
  avatar_url, marital_status, job, marriage_vision, seeking, interests, qualities,
  madhhab, education, has_children, wants_children, can_relocate, polygamy,
  status, is_premium, profile_completion)
VALUES (
  :'PROFILE_06',
  :'PROFILE_06',
  'Sokhna', 'M.', 'femme', 36, 'Montréal', 'CA',
  'https://i.pravatar.cc/400?img=36',
  'Célibataire', 'Pharmacienne',
  'Un foyer de sérénité, de respect mutuel et de foi partagée.',
  'Un homme sérieux, bien éduqué, pratiquant avec modération.',
  'Médecine, lecture, sport.',
  'Professionnelle, douce, loyale.',
  'Maliki', 'Bac+5', '0', 'J''en veux', 'Selon les conditions', 'Non',
  'validated', true, 95
) ON CONFLICT (user_id) DO NOTHING;

-- ─── Quelques notifications de test ──────────────────────────────────────────
INSERT INTO public.notifications (user_id, type, title, body)
VALUES
  (:'USER_FREE_ID',    'like',    'Nouvelle demande', 'Fama N. vous a envoyé une demande de contact.'),
  (:'USER_FREE_ID',    'visitor', 'Visite de profil', 'Quelqu''un a visité votre profil.'),
  (:'USER_PREMIUM_ID', 'like',    'Nouveau favori',   'Ndeye G. vous a ajouté en favori.');

-- ─── Visiteurs de profil fictifs ─────────────────────────────────────────────
INSERT INTO public.profile_visitors (visitor_id, profile_id)
VALUES
  (:'PROFILE_01', :'USER_FREE_ID'),
  (:'PROFILE_02', :'USER_FREE_ID'),
  (:'PROFILE_03', :'USER_PREMIUM_ID'),
  (:'PROFILE_04', :'USER_PREMIUM_ID'),
  (:'PROFILE_05', :'USER_PREMIUM_ID');

-- ─── Demandes de contact fictives ────────────────────────────────────────────
INSERT INTO public.likes (sender_id, receiver_id, type, status)
VALUES
  (:'PROFILE_01', :'USER_FREE_ID',    'request',  'pending'),
  (:'PROFILE_02', :'USER_FREE_ID',    'request',  'pending'),
  (:'PROFILE_03', :'USER_PREMIUM_ID', 'favorite', 'pending'),
  (:'PROFILE_04', :'USER_PREMIUM_ID', 'request',  'accepted');
