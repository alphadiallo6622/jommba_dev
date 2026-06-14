'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Crown, Eye, X, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useCurrentUser } from '@/lib/use-current-user'
import SettingsDrawer from '../SettingsDrawer'

type Photo = { id: string; src: string; isMain: boolean }

const MAX_FREE    = 3
const MAX_PREMIUM = 6

const TIPS = [
  'Photo récente et de bonne qualité',
  'Visage dégagé et bien éclairé',
  'Fond neutre de préférence',
  'Pas de filtre excessif',
]

type Props = { open: boolean; onClose: () => void }

export default function PhotoPanel({ open, onClose }: Props) {
  const router = useRouter()
  const currentUser = useCurrentUser()
  const [photos, setPhotos] = useState<Photo[]>([
    { id: '1', src: currentUser.avatar, isMain: true },
  ])

  const fileInputRef = useRef<HTMLInputElement>(null)

  const isPremium = currentUser.isPremium
  const maxPhotos = isPremium ? MAX_PREMIUM : MAX_FREE
  const hasRoom   = photos.length < maxPhotos

  const setMain = (id: string) => {
    setPhotos(prev => prev.map(p => ({ ...p, isMain: p.id === id })))
    toast.success('Photo principale mise à jour')
  }

  const deletePhoto = (id: string) => {
    if (photos.length === 1) {
      toast.error('Tu dois conserver au moins une photo')
      return
    }
    setPhotos(prev => {
      const next    = prev.filter(p => p.id !== id)
      const wasMain = prev.find(p => p.id === id)?.isMain
      if (wasMain && next.length > 0) next[0] = { ...next[0], isMain: true }
      return next
    })
    toast.success('Photo supprimée')
  }

  const addPhoto = () => {
    if (!isPremium && photos.length >= MAX_FREE) {
      onClose()
      router.push('/dashboard/premium')
      return
    }
    if (photos.length >= MAX_PREMIUM) {
      toast.error(`Maximum ${MAX_PREMIUM} photos atteint`)
      return
    }
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image trop lourde (max 10 Mo)')
      return
    }
    const url = URL.createObjectURL(file)
    setPhotos(prev => [
      ...prev,
      { id: Date.now().toString(), src: url, isMain: prev.length === 0 },
    ])
    toast.success('Photo ajoutée ✓')
    e.target.value = ''
  }

  return (
    <>
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      className="hidden"
      onChange={handleFileChange}
    />
    <SettingsDrawer
      open={open}
      title="Photo de profil"
      onClose={onClose}
      footer={
        <button
          onClick={() => { toast.success('Photos sauvegardées ✓'); onClose() }}
          className="w-full py-3 bg-[#10B981] text-white text-sm font-semibold rounded-xl hover:bg-[#059669] transition-colors flex items-center justify-center gap-2"
        >
          <Camera className="w-4 h-4" /> Enregistrer et fermer
        </button>
      }
    >
      <div className="px-4 py-5 space-y-4">

        {/* Intro text */}
        <p className="text-sm text-[#10B981] bg-[#E1F5EE] px-4 py-3 rounded-xl leading-relaxed">
          Ta photo principale est la première chose que les autres membres voient. Choisis une photo claire où ton visage est bien visible.
        </p>

        {/* Section label */}
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-semibold text-gray-700">Mes photos</span>
          <span className="text-sm text-gray-400 font-medium">{photos.length}/{maxPhotos}</span>
          {isPremium && (
            <span className="text-[9px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded-full">PREMIUM</span>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 gap-3">
          {photos.map(photo => (
            <div key={photo.id} className="flex flex-col gap-1.5">
              <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-gray-100">
                <img src={photo.src} alt="" className="w-full h-full object-cover" />
                {photo.isMain && (
                  <span className="absolute top-1.5 left-1.5 bg-[#10B981] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                    Principale
                  </span>
                )}
              </div>

              {/* Actions below photo */}
              <div className="flex flex-col items-center gap-0.5">
                {photo.isMain ? (
                  <span className="text-[10px] font-semibold text-[#10B981] flex items-center gap-0.5">
                    ✓ Principal
                  </span>
                ) : (
                  <button
                    onClick={() => setMain(photo.id)}
                    className="text-[10px] font-semibold text-[#10B981] border border-[#10B981] rounded-full px-2 py-0.5 hover:bg-[#E1F5EE] transition-colors"
                  >
                    ● Principal
                  </button>
                )}
                <button
                  onClick={() => deletePhoto(photo.id)}
                  className="text-[10px] text-red-400 hover:text-red-600 flex items-center gap-0.5 transition-colors"
                >
                  <X className="w-2.5 h-2.5" /> Supprimer
                </button>
              </div>
            </div>
          ))}

          {/* Add slot */}
          {hasRoom && (
            <div className="flex flex-col gap-1.5">
              <button
                onClick={addPhoto}
                className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1.5 hover:border-[#10B981] hover:bg-[#E1F5EE] transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-[#10B981]/15 flex items-center justify-center transition-colors">
                  <Plus className="w-4 h-4 text-gray-400 group-hover:text-[#10B981]" />
                </div>
                <span className="text-[10px] text-gray-400 group-hover:text-[#10B981] font-medium transition-colors">Ajouter</span>
              </button>
            </div>
          )}
        </div>

        {/* Premium upsell — free users only */}
        {!isPremium && (
          <button
            onClick={() => { onClose(); router.push('/dashboard/premium') }}
            className="w-full flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 hover:bg-amber-100 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                <Camera className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-800">Ajoutez jusqu&apos;à {MAX_PREMIUM} photos avec Premium</p>
                <p className="text-xs text-amber-600">Augmentez vos chances de recevoir des demandes</p>
              </div>
            </div>
            <Crown className="w-4 h-4 text-amber-400 shrink-0 ml-2" />
          </button>
        )}

        {/* Inline tips */}
        <div className="bg-[#E1F5EE] rounded-xl px-4 py-3">
          <p className="text-xs text-[#10B981] leading-relaxed">
            <span className="font-semibold">Conseils :</span> Choisissez des photos nettes, bien éclairées et récentes.
            Évitez les photos de groupe ou avec des filtres excessifs.
            Cliquez sur "Principal" pour changer votre photo de profil visible par tous.
          </p>
        </div>

        {/* Visibility info */}
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
          <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
            <Eye className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xs text-amber-700 leading-relaxed">
            <span className="font-semibold">Les profils avec photo ont 5x plus de visibilité</span><br />
            Ajoute une photo pour apparaître en haut des recherches et recevoir plus de demandes de contact.
          </p>
        </div>

        {/* Detailed tips */}
        <div className="bg-[#E1F5EE] rounded-xl px-4 py-3">
          <p className="text-sm font-semibold text-[#064E3B] mb-2">Conseils pour une bonne photo :</p>
          <ul className="space-y-1">
            {TIPS.map((tip, i) => (
              <li key={i} className="text-xs text-[#10B981] flex items-start gap-1.5">
                <span className="mt-0.5 shrink-0">•</span>{tip}
              </li>
            ))}
          </ul>
        </div>

      </div>
    </SettingsDrawer>
    </>
  )
}
