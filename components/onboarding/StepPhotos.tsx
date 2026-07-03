'use client'

import { useState, useRef } from 'react'
import { useOnboardingStore } from '@/store/onboarding.store'
import { ArrowLeft, Upload, Star, Eye, EyeOff, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type Props = { onNext: () => void; onBack: () => void; isLast?: boolean }

const MAX_PHOTOS = 3

export default function StepPhotos({ onNext, onBack, isLast }: Props) {
  const { photos, setField } = useOnboardingStore()
  const [blurred, setBlurred]       = useState<boolean[]>([false, false, false])
  const [uploading, setUploading]   = useState<boolean[]>([false, false, false])
  const [loading, setLoading]       = useState(false)
  const fileRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleFile = async (index: number, file: File) => {
    const u = [...uploading]; u[index] = true; setUploading(u)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload/avatar', { method: 'POST', body: formData })
      const json = await res.json() as { url?: string; error?: string }

      if (!res.ok || !json.url) {
        toast.error(json.error ?? 'Échec du téléversement')
        return
      }

      const next = [...photos]
      next[index] = json.url
      setField('photos', next)
    } catch {
      toast.error('Erreur réseau. Réessaie.')
    } finally {
      const u2 = [...uploading]; u2[index] = false; setUploading(u2)
    }
  }

  const removePhoto = (index: number) => {
    const next = [...photos]
    next[index] = ''
    setField('photos', next)
  }

  const toggleBlur = (index: number) => {
    const next = [...blurred]; next[index] = !next[index]; setBlurred(next)
  }

  const handleFinish = async () => {
    setLoading(true)
    try {
      await onNext()
    } finally {
      setLoading(false)
    }
  }

  const hasMainPhoto = photos[0] && photos[0] !== ''

  return (
    <div className="space-y-7">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-serif font-bold text-gray-900">Tes photos</h2>
        <p className="text-sm text-gray-500">Ajoute au moins 1 photo. La première est ta photo principale.</p>
      </div>

      {/* Photo slots */}
      <div className="space-y-3">
        {Array.from({ length: MAX_PHOTOS }).map((_, i) => {
          const url    = photos[i] ?? ''
          const isMain = i === 0
          return (
            <div
              key={i}
              className={cn(
                'relative border-2 rounded-2xl overflow-hidden transition-all',
                url ? 'border-emerald-400' : 'border-dashed border-gray-300',
              )}
            >
              {url ? (
                /* Photo preview */
                <div className="relative h-40 bg-gray-100">
                  <img
                    src={url}
                    alt={`Photo ${i + 1}`}
                    className={cn('w-full h-full object-cover transition-all', blurred[i] ? 'blur-xl' : '')}
                  />
                  {/* Badges */}
                  {isMain && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      <Star className="w-3 h-3 fill-white" /> Principal
                    </div>
                  )}
                  {blurred[i] && (
                    <div className="absolute top-2 right-10 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                      Flouté
                    </div>
                  )}
                  {/* Controls */}
                  <div className="absolute bottom-2 right-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => toggleBlur(i)}
                      className="p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                      title={blurred[i] ? 'Voir' : 'Flouter'}
                    >
                      {blurred[i] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="p-1.5 rounded-full bg-red-500/80 text-white hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Upload zone */
                <button
                  type="button"
                  onClick={() => fileRefs.current[i]?.click()}
                  disabled={uploading[i]}
                  className="w-full h-32 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50/50 transition-all"
                >
                  {uploading[i]
                    ? <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                    : <Upload className="w-6 h-6" />
                  }
                  <span className="text-xs font-medium">
                    {uploading[i] ? 'Téléversement…' : isMain ? 'Photo principale (obligatoire)' : `Photo ${i + 1} (optionnelle)`}
                  </span>
                </button>
              )}
              <input
                ref={el => { fileRefs.current[i] = el }}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(i, f) }}
              />
            </div>
          )
        })}
      </div>

      {/* Validation note */}
      <div className="flex items-start gap-2.5 bg-emerald-50 border border-emerald-100 rounded-xl p-3.5">
        <span className="text-lg shrink-0">✅</span>
        <p className="text-xs text-emerald-700 leading-relaxed">
          Tes photos sont vérifiées par notre équipe avant validation. Seules des photos claires et décentes sont acceptées.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
        <button
          type="button"
          onClick={handleFinish}
          disabled={!hasMainPhoto || loading}
          className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: '#10B981' }}
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isLast ? 'Envoyer mon profil' : 'Continuer'}
        </button>
      </div>
    </div>
  )
}
