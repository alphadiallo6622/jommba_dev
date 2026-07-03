'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Eye, EyeOff, Trash2, Settings, CheckCircle, Crown, Plus, Star } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useProfileStore } from '@/store/profile.store'
import { useCurrentUser } from '@/lib/use-current-user'
import { useAuth } from '@/components/providers/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { refreshProfileInStore } from '@/lib/supabase/profile-actions'
import {
  loadMyPhotos, uploadPhoto, deletePhotoById, setPrimaryPhoto,
  type UserPhoto,
} from '@/lib/supabase/photos-service'

const MAX_FREE    = 3
const MAX_PREMIUM = 6

type Props = { open: boolean; onClose: () => void }

export default function PhotoEditModal({ open, onClose }: Props) {
  const router = useRouter()
  const { isPhotosBlurred, togglePhotosBlur } = useProfileStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const currentUser = useCurrentUser()
  const { user } = useAuth()

  const [photos, setPhotos] = useState<UserPhoto[]>([])

  const isPremium = currentUser.isPremium
  const maxPhotos = isPremium ? MAX_PREMIUM : MAX_FREE
  const hasRoom   = photos.length < maxPhotos

  const fetchPhotos = useCallback(async () => {
    if (!user) return
    setPhotos(await loadMyPhotos(user.id, currentUser.avatar))
  }, [user, currentUser.avatar])

  useEffect(() => { if (open) fetchPhotos() }, [open, fetchPhotos])

  const setMain = async (id: string) => {
    if (!user) return
    const photo = photos.find(p => p.id === id)
    if (!photo) return
    setPhotos(prev => prev.map(p => ({ ...p, isMain: p.id === id })))
    const err = await setPrimaryPhoto(user.id, id, photo.src)
    if (err) { toast.error('Erreur lors de la mise à jour'); fetchPhotos(); return }
    await refreshProfileInStore(user.id)
    toast.success('Photo principale mise à jour ✓')
  }

  const deletePhoto = async (id: string) => {
    if (!user) return
    if (photos.length === 1) {
      toast.error('Tu dois conserver au moins une photo')
      return
    }
    const wasMain   = photos.find(p => p.id === id)?.isMain
    const remaining = photos.filter(p => p.id !== id)
    setPhotos(remaining.map((p, i) => wasMain && i === 0 ? { ...p, isMain: true } : p))

    const err = await deletePhotoById(user.id, id)
    if (err) { toast.error('Erreur lors de la suppression'); fetchPhotos(); return }
    if (wasMain && remaining[0]) {
      await setPrimaryPhoto(user.id, remaining[0].id, remaining[0].src)
      await refreshProfileInStore(user.id)
    }
    toast.success('Photo supprimée ✓')
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !user) return
    if (!file.type.startsWith('image/')) { toast.error('Veuillez sélectionner une image'); return }
    if (file.size > 10 * 1024 * 1024)   { toast.error('Image trop lourde (max 10 Mo)');  return }

    const isMain = photos.length === 0
    const added  = await uploadPhoto(user.id, file, isMain, photos.length)
    if (!added) { toast.error("Échec de l'upload. Réessaie."); return }
    setPhotos(prev => [...prev, added])
    if (isMain) await refreshProfileInStore(user.id)
    toast.success('Photo ajoutée ✓')
  }

  // Le flou des photos est une préférence persistée (user_preferences)
  const handleToggleBlur = async () => {
    togglePhotosBlur()
    if (!user) return
    const supabase = createClient()
    await supabase.from('user_preferences')
      .update({ photos_blurred: !isPhotosBlurred })
      .eq('user_id', user.id)
  }

  const handleSave = () => {
    onClose()
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

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={onClose}
            />
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.2 }}
              className="fixed left-4 right-4 top-1/2 -translate-y-1/2 max-w-sm mx-auto bg-white rounded-2xl z-[51] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
                <div>
                  <h3 className="font-semibold text-gray-900">Modifier mes photos</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {photos.length}/{maxPhotos} photo{photos.length > 1 ? 's' : ''}
                    {isPremium ? ' · Premium' : ' gratuites'}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* Scrollable body */}
              <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">

                {/* Blur status + toggle */}
                <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl ${
                  isPhotosBlurred ? 'bg-amber-50 border border-amber-200' : 'bg-[#E1F5EE]'
                }`}>
                  <CheckCircle className={`w-4 h-4 shrink-0 ${isPhotosBlurred ? 'text-amber-500' : 'text-[#10B981]'}`} />
                  <p className={`text-sm font-medium flex-1 ${isPhotosBlurred ? 'text-amber-700' : 'text-[#10B981]'}`}>
                    {isPhotosBlurred ? 'Photos floutées' : 'Photos défloutées'}
                  </p>
                </div>

                <button
                  onClick={handleToggleBlur}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-colors ${
                    isPhotosBlurred
                      ? 'bg-[#E1F5EE] border-[#10B981]/40 hover:bg-green-100'
                      : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                  }`}
                >
                  {isPhotosBlurred
                    ? <Eye className="w-5 h-5 text-[#10B981] shrink-0" />
                    : <EyeOff className="w-5 h-5 text-blue-500 shrink-0" />
                  }
                  <div>
                    <p className={`text-sm font-semibold ${isPhotosBlurred ? 'text-[#10B981]' : 'text-blue-700'}`}>
                      {isPhotosBlurred ? 'Déflouter mes photos' : 'Flouter mes photos'}
                    </p>
                    <p className={`text-xs mt-0.5 ${isPhotosBlurred ? 'text-[#10B981]/70' : 'text-blue-500'}`}>
                      {isPhotosBlurred ? 'Rendre visibles à tous' : 'Masquer aux visiteurs'}
                    </p>
                  </div>
                </button>

                {/* Photo grid */}
                <div className="grid grid-cols-3 gap-2">
                  {photos.map(photo => (
                    <div key={photo.id} className="flex flex-col gap-1">
                      <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-gray-100">
                        <img src={photo.src} alt="" className="w-full h-full object-cover" />
                        {photo.isMain && (
                          <span className="absolute top-1 left-1 bg-[#10B981] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                            Principale
                          </span>
                        )}
                        {photo.isMain && (
                          <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#10B981] flex items-center justify-center">
                            <Star className="w-2.5 h-2.5 text-white fill-white" />
                          </div>
                        )}
                        <button
                          onClick={() => deletePhoto(photo.id)}
                          className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-red-500/90 flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <Trash2 className="w-2.5 h-2.5 text-white" />
                        </button>
                      </div>
                      {!photo.isMain && (
                        <button
                          onClick={() => setMain(photo.id)}
                          className="text-[9px] font-semibold text-[#10B981] border border-[#10B981] rounded-full px-2 py-0.5 hover:bg-[#E1F5EE] transition-colors text-center"
                        >
                          ● Définir principale
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Add slot */}
                  {hasRoom && (
                    <button
                      onClick={addPhoto}
                      className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 hover:border-[#10B981] hover:bg-[#E1F5EE] transition-colors group"
                    >
                      <div className="w-7 h-7 rounded-full bg-gray-100 group-hover:bg-[#10B981]/15 flex items-center justify-center">
                        <Plus className="w-4 h-4 text-gray-400 group-hover:text-[#10B981]" />
                      </div>
                      <span className="text-[9px] text-gray-400 group-hover:text-[#10B981] font-medium">Ajouter</span>
                    </button>
                  )}

                  {/* Premium locked slots */}
                  {!isPremium && Array.from({ length: Math.min(MAX_PREMIUM - photos.length - (hasRoom ? 1 : 0), 5) }).map((_, i) => (
                    <button
                      key={`locked-${i}`}
                      onClick={() => { onClose(); router.push('/dashboard/premium') }}
                      className="aspect-square rounded-xl bg-amber-50 border-2 border-dashed border-amber-200 flex flex-col items-center justify-center gap-0.5 hover:bg-amber-100 transition-colors"
                    >
                      <Crown className="w-4 h-4 text-amber-400" />
                      <span className="text-[8px] text-amber-500 font-medium">Premium</span>
                    </button>
                  ))}
                </div>

                {/* Premium upsell */}
                {!isPremium && (
                  <button
                    onClick={() => { onClose(); router.push('/dashboard/premium') }}
                    className="w-full flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 hover:bg-amber-100 transition-colors text-left"
                  >
                    <Crown className="w-8 h-8 text-amber-400 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-amber-800">Ajoutez jusqu'à {MAX_PREMIUM} photos avec Premium</p>
                      <p className="text-xs text-amber-600">Augmentez vos chances de recevoir des demandes</p>
                    </div>
                  </button>
                )}

                {/* Tip */}
                <p className="text-xs text-amber-700 bg-amber-50 px-3 py-2.5 rounded-xl leading-relaxed">
                  💡 <span className="font-medium">Astuce :</span> Les photos floutées sont visibles uniquement par les personnes avec qui vous avez échangé des messages.
                </p>

                {/* Advanced settings */}
                <button
                  onClick={() => { onClose(); router.push('/dashboard/parametres') }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Settings className="w-4 h-4 text-gray-400" />
                  Gestion avancée dans les paramètres
                </button>
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-gray-100 shrink-0">
                <button
                  onClick={handleSave}
                  className="w-full py-3 bg-[#10B981] text-white text-sm font-semibold rounded-xl hover:bg-[#059669] transition-colors"
                >
                  Enregistrer et fermer
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
