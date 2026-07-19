import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalise une saisie de taille en centimètres, en acceptant le format
 * mètres avec séparateur point ou virgule (1.70, 1,70) en plus des cm bruts
 * (170). Certains utilisateurs saisissent leur taille au format "1,70 m" —
 * sans normalisation, parseInt() tronque au premier caractère non numérique
 * (1,70 → 1), ce qui viole la contrainte CHECK height >= 140 en base.
 *
 * Règle : si la partie entière avant le séparateur est < 10 (donc un format
 * mètres du type 1.xx ou 2.xx), on multiplie par 100. Sinon la valeur est
 * déjà en cm et on l'arrondit telle quelle.
 */
export function normalizeHeightCm(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const normalized = trimmed.replace(",", ".");
  const value = parseFloat(normalized);
  if (!Number.isFinite(value) || value <= 0) return null;

  const hasSeparator = normalized.includes(".");
  const wholePart = Math.trunc(value);

  if (hasSeparator && wholePart < 10) {
    return Math.round(value * 100);
  }
  return Math.round(value);
}
