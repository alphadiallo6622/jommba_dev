'use client'

import { Home, SlidersHorizontal, Layers, LayoutGrid } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useExplorerStore } from '@/store/explorer.store'
import { useCurrentUser } from '@/lib/use-current-user'
import { cn } from '@/lib/utils'

export default function SecondaryNav() {
  const router = useRouter()
  const { mode, grillUsesLeft, setMode, setFiltersOpen, setShowPremiumModal, decrementGrillUses } = useExplorerStore()
  const { isPremium } = useCurrentUser()

  const handleGridClick = () => {
    if (isPremium) {
      setMode('grid')
      return
    }
    if (grillUsesLeft > 0) {
      setMode('grid')
      decrementGrillUses()
    } else {
      setShowPremiumModal(true)
    }
  }

  return (
    <div className="flex items-center justify-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
      {/* Back home */}
      <button
        onClick={() => router.push('/dashboard')}
        className="flex items-center justify-center w-10 h-10 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
        title="Retour à l'accueil"
      >
        <Home className="w-5 h-5" />
      </button>

      {/* Filters button */}
      <button
        onClick={() => setFiltersOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filtres
      </button>

      {/* Swipe mode */}
      <button
        onClick={() => setMode('swipe')}
        className={cn(
          'flex items-center justify-center w-10 h-10 rounded-xl transition-colors',
          mode === 'swipe'
            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
            : 'text-gray-500 hover:bg-gray-100',
        )}
        title="Mode swipe"
      >
        <Layers className="w-5 h-5" />
      </button>

      {/* Grid mode */}
      <button
        onClick={handleGridClick}
        className={cn(
          'relative flex items-center justify-center w-10 h-10 rounded-xl transition-colors',
          mode === 'grid'
            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
            : 'text-gray-500 hover:bg-gray-100',
        )}
        title="Mode grille"
      >
        <LayoutGrid className="w-5 h-5" />
        {!isPremium && grillUsesLeft > 0 && (
          <span className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
            {grillUsesLeft}
          </span>
        )}
      </button>
    </div>
  )
}
