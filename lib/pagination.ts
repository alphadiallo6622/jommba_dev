// Calcul des numéros de pages à afficher dans une pagination.
//
// Rendre un bouton par page déborde dès que la liste grossit : avec 304
// membres (31 pages) la barre sortait de l'écran sur mobile. On n'affiche donc
// que la première page, la dernière, et une fenêtre autour de la page courante,
// les trous étant matérialisés par des ellipses.

/** Un élément de la barre : un numéro de page, ou un trou « … ». */
export type PageItem = number | "ellipsis"

/** Liste des entiers de `start` à `end` inclus. */
function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

/**
 * Numéros de pages à afficher, ellipses comprises.
 *
 * @param current  Page courante (1-indexée).
 * @param total    Nombre total de pages.
 * @param siblings Nombre de pages affichées de chaque côté de la courante.
 *
 * Exemples avec `siblings = 1` :
 *   (1, 31)  → 1 2 3 4 5 … 31
 *   (15, 31) → 1 … 14 15 16 … 31
 *   (31, 31) → 1 … 27 28 29 30 31
 */
export function paginationRange(
  current: number,
  total: number,
  siblings = 1,
): PageItem[] {
  // Au-delà de ce seuil seulement, une ellipse fait gagner de la place :
  // première + dernière + courante + 2×siblings + 2 ellipses.
  const maxVisible = siblings * 2 + 5
  if (total <= maxVisible) return range(1, total)

  // La fenêtre est bornée pour ne jamais déborder des pages existantes.
  const left = Math.max(current - siblings, 1)
  const right = Math.min(current + siblings, total)

  // Une ellipse ne se justifie que si elle masque au moins deux pages :
  // collée à la première ou à la dernière, elle en cacherait une seule et
  // prendrait autant de place que le numéro qu'elle remplace.
  const showLeft = left > 2
  const showRight = right < total - 1

  // Nombre de pages du bloc collé à un bord (hors ellipse et page opposée).
  const edgeCount = siblings * 2 + 3

  if (!showLeft && showRight) return [...range(1, edgeCount), "ellipsis", total]
  if (showLeft && !showRight) return [1, "ellipsis", ...range(total - edgeCount + 1, total)]

  return [1, "ellipsis", ...range(left, right), "ellipsis", total]
}
