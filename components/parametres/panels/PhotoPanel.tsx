'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Camera, Crown, Eye, X, Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useCurrentUser } from '@/lib/use-current-user'
import { useAuth } from '@/components/providers/AuthProvider'
import { refreshProfileInStore } from '@/lib/supabase/profile-actions'
import {
  loadMyPhotos, uploadPhoto, deletePhotoById, setPrimaryPhoto,
  type UserPhoto,
} from '@/lib/supabase/photos-service'
import SettingsDrawer from '../SettingsDrawer'

const MAX_FREE    = 3
const MAX_PREMIUM = 6

type Props = { open: boolean; onClose: () => void }

export default function PhotoPanel({ open, onClose }: Props) {
  const router = useRouter()
  const t = useTranslations('dashboard.parametres.photo')
  const currentUser = useCurrentUser()
  const { user } = useAuth()
  const [photos, setPhotos]     = useState<UserPhoto[]>([])
  const [loading, setLoading]   = useState(true)
  const [uploading, setUploading] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const isPremium = currentUser.isPremium
  const maxPhotos = isPremium ? MAX_PREMIUM : MAX_FREE
  const hasRoom   = photos.length < maxPhotos

  const fetchPhotos = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      setPhotos(await loadMyPhotos(user.id, currentUser.avatar))
    } finally {
      setLoading(false)
    }
  }, [user, currentUser.avatar])

  useEffect(() => { if (open) fetchPhotos() }, [open, fetchPhotos])

  const setMain = async (id: string) => {
    if (!user) return
    const photo = photos.find(p => p.id === id)
    if (!photo) return
    setPhotos(prev => prev.map(p => ({ ...p, isMain: p.id === id })))
    const err = await setPrimaryPhoto(user.id, id, photo.src)
    if (err) { toast.error(t('updateError')); fetchPhotos(); return }
    await refreshProfileInStore(user.id)
    toast.success(t('mainUpdated'))
  }

  const deletePhoto = async (id: string) => {
    if (!user) return
    if (photos.length === 1) {
      toast.error(t('keepOne'))
      return
    }
    const wasMain = photos.find(p => p.id === id)?.isMain
    const remaining = photos.filter(p => p.id !== id)
    setPhotos(remaining.map((p, i) => wasMain && i === 0 ? { ...p, isMain: true } : p))

    const err = await deletePhotoById(user.id, id)
    if (err) { toast.error(t('deleteError')); fetchPhotos(); return }
    if (wasMain && remaining[0]) {
      await setPrimaryPhoto(user.id, remaining[0].id, remaining[0].src)
      await refreshProfileInStore(user.id)
    }
    toast.success(t('deleted'))
  }

  const addPhoto = () => {
    if (!isPremium && photos.length >= MAX_FREE) {
      onClose()
      router.push('/dashboard/premium')
      return
    }
    if (photos.length >= MAX_PREMIUM) {
      toast.error(t('maxReached', { max: MAX_PREMIUM }))
      return
    }
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !user) return
    if (!file.type.startsWith('image/')) {
      toast.error(t('selectImage'))
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error(t('tooHeavy'))
      return
    }

    setUploading(true)
    const isMain = photos.length === 0
    const added  = await uploadPhoto(user.id, file, isMain, photos.length)
    setUploading(false)

    if (!added) { toast.error(t('uploadFailed')); return }
    setPhotos(prev => [...prev, added])
    if (isMain) await refreshProfileInStore(user.id)
    toast.success(t('added'))
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
      title={t('title')}
      onClose={onClose}
      footer={
        <button
          onClick={onClose}
          className="w-full py-3 bg-[#10B981] text-white text-sm font-semibold rounded-xl hover:bg-[#059669] transition-colors flex items-center justify-center gap-2"
        >
          <Camera className="w-4 h-4" /> {t('close')}
        </button>
      }
    >
      <div className="px-4 py-5 space-y-4">

        {/* Intro text */}
        <p className="text-sm text-[#10B981] bg-[#E1F5EE] px-4 py-3 rounded-xl leading-relaxed">
          {t('intro')}
        </p>

        {/* Section label */}
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-semibold text-gray-700">{t('myPhotos')}</span>
          <span className="text-sm text-gray-400 font-medium">{photos.length}/{maxPhotos}</span>
          {isPremium && (
            <span className="text-[9px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded-full">PREMIUM</span>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin text-[#10B981]" />
          </div>
        ) : (
        <div className="grid grid-cols-3 gap-3">
          {photos.map(photo => (
            <div key={photo.id} className="flex flex-col gap-1.5">
              <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-gray-100">
                <img src={photo.src} alt="" className="w-full h-full object-cover" />
                {photo.isMain && (
                  <span className="absolute top-1.5 left-1.5 bg-[#10B981] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                    {t('main')}
                  </span>
                )}
              </div>

              {/* Actions below photo */}
              <div className="flex flex-col items-center gap-0.5">
                {photo.isMain ? (
                  <span className="text-[10px] font-semibold text-[#10B981] flex items-center gap-0.5">
                    {t('mainShort')}
                  </span>
                ) : (
                  <button
                    onClick={() => setMain(photo.id)}
                    className="text-[10px] font-semibold text-[#10B981] border border-[#10B981] rounded-full px-2 py-0.5 hover:bg-[#E1F5EE] transition-colors"
                  >
                    {t('makeMain')}
                  </button>
                )}
                <button
                  onClick={() => deletePhoto(photo.id)}
                  className="text-[10px] text-red-400 hover:text-red-600 flex items-center gap-0.5 transition-colors"
                >
                  <X className="w-2.5 h-2.5" /> {t('delete')}
                </button>
              </div>
            </div>
          ))}

          {/* Add slot */}
          {hasRoom && (
            <div className="flex flex-col gap-1.5">
              {/* Aucune photo : le profil est invisible pour les autres membres,
                  on signale l'emplacement en rouge comme les champs obligatoires. */}
              <button
                onClick={addPhoto}
                disabled={uploading}
                className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 hover:border-[#10B981] hover:bg-[#E1F5EE] transition-colors group disabled:opacity-50 ${
                  photos.length === 0 ? 'border-red-400 bg-red-50/40' : 'border-gray-300'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-[#10B981]/15 flex items-center justify-center transition-colors">
                  {uploading
                    ? <Loader2 className="w-4 h-4 animate-spin text-[#10B981]" />
                    : <Plus className="w-4 h-4 text-gray-400 group-hover:text-[#10B981]" />
                  }
                </div>
                <span className="text-[10px] text-gray-400 group-hover:text-[#10B981] font-medium transition-colors">
                  {uploading ? t('sending') : t('add')}
                </span>
              </button>
            </div>
          )}
        </div>
        )}

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
                <p className="text-sm font-semibold text-amber-800">{t('upsellTitle', { max: MAX_PREMIUM })}</p>
                <p className="text-xs text-amber-600">{t('upsellDesc')}</p>
              </div>
            </div>
            <Crown className="w-4 h-4 text-amber-400 shrink-0 ml-2" />
          </button>
        )}

        {/* Inline tips */}
        <div className="bg-[#E1F5EE] rounded-xl px-4 py-3">
          <p className="text-xs text-[#10B981] leading-relaxed">
            {t.rich('tipsInline', { b: (chunks) => <span className="font-semibold">{chunks}</span> })}
          </p>
        </div>

        {/* Visibility info */}
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
          <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
            <Eye className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xs text-amber-700 leading-relaxed">
            {t.rich('visibilityInfo', {
              b: (chunks) => <span className="font-semibold">{chunks}</span>,
              br: () => <br />,
            })}
          </p>
        </div>

        {/* Detailed tips */}
        <div className="bg-[#E1F5EE] rounded-xl px-4 py-3">
          <p className="text-sm font-semibold text-[#064E3B] mb-2">{t('tipsTitle')}</p>
          <ul className="space-y-1">
            {(t.raw('tips') as string[]).map((tip, i) => (
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
