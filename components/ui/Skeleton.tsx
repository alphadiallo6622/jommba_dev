import { cn } from '@/lib/utils'

// Squelettes de chargement : reprennent la silhouette des cartes réelles pour
// éviter le saut de mise en page à l'arrivée des données.

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('skeleton rounded-md', className)} />
}

/** Grille de cartes profil (photo + deux lignes de texte). */
export function SkeletonCardGrid({
  count = 8,
  className,
  photoClassName = 'aspect-[3/4]',
}: {
  count?: number
  className?: string
  photoClassName?: string
}) {
  return (
    <div aria-busy="true" className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
          <Skeleton className={cn('w-full rounded-none', photoClassName)} />
          <div className="p-3 space-y-2">
            <Skeleton className="h-3.5 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

/** Liste de lignes (avatar rond + deux lignes) : messages, notifications, demandes. */
export function SkeletonList({
  count = 5,
  className = 'space-y-2',
  itemClassName = 'bg-white rounded-xl border border-gray-100 shadow-sm p-4',
}: {
  count?: number
  className?: string
  itemClassName?: string
}) {
  return (
    <div aria-busy="true" className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={cn('flex items-center gap-3', itemClassName)}>
          <Skeleton className="w-12 h-12 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}
