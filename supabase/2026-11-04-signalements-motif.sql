-- 2026-11-04 · Signalements : motif détaillé
--
-- Le formulaire de signalement demande désormais un motif (code stable) et un
-- commentaire obligatoire : c'est ce commentaire que la console admin affiche
-- pour trancher entre « Ignorer », « Avertir » et « Suspendre ».
--
-- Les deux colonnes existaient déjà sur le projet de production mais n'étaient
-- enregistrées dans aucun fichier SQL du dépôt : une installation neuve créait
-- une table `reports` incomplète, et l'insertion du signalement échouait.
-- `IF NOT EXISTS` rend ce script rejouable sur la base existante.

ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS severity TEXT NOT NULL DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS description TEXT;

-- La sévérité est déduite du motif côté application (arnaque / harcèlement /
-- contenu inapproprié → haute). La contrainte garde la colonne alignée sur les
-- trois niveaux que la console sait afficher.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.reports'::regclass AND conname = 'reports_severity_check'
  ) THEN
    ALTER TABLE public.reports
      ADD CONSTRAINT reports_severity_check CHECK (severity IN ('high', 'medium', 'low'));
  END IF;
END $$;

COMMENT ON COLUMN public.reports.reason IS
  'Code motif stable (fausse_photo, faux_nom, inapproprie, arnaque, harcelement, autre). Les lignes antérieures contiennent une phrase libre.';
COMMENT ON COLUMN public.reports.description IS
  'Commentaire saisi par le membre qui signale — pièce de la décision de modération.';
