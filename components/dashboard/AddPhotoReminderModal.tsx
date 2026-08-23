'use client'

// Popup non-bloquant affiché à l'ouverture du dashboard quand l'utilisateur
// n'a pas de photo de profil. But : le pousser à en ajouter une, sinon son
// profil reste invisible pour les autres membres. Disparaît dès qu'une photo
// est présente (hasPhoto passé par le layout serveur).
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Camera, X } from 'lucide-react'

export default function AddPhotoReminderModal({ hasPhoto }: { hasPhoto: boolean }) {
  const router = useRouter()
  const t = useTranslations('dashboard.addPhotoReminder')
  const [open, setOpen] = useState(true)

  // Rien à afficher si une photo existe déjà.
  if (hasPhoto || !open) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-gradient-to-br from-[#0a7a52] via-[#0d9e6a] to-[#10b981] px-6 pt-7 pb-6 text-center">
          <button
            onClick={() => setOpen(false)}
            className="absolute top-3 right-3 p-1.5 rounded-full text-white/80 hover:bg-white/15 transition-colors"
            aria-label={t('close')}
          >
            <X className="w-4 h-4" />
          </button>
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
            <Camera className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-white text-lg font-bold">{t('title')}</h2>
        </div>

        <div className="px-6 py-5 space-y-4">
          <p className="text-sm leading-relaxed text-gray-600">
            {t.rich('body', {
              b: (chunks) => <span className="font-semibold text-gray-900">{chunks}</span>,
            })}
          </p>

          <button
            onClick={() => {
              setOpen(false)
              router.push('/dashboard/parametres')
            }}
            className="w-full py-2.5 rounded-lg text-white text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ background: '#10B981' }}
          >
            {t('cta')}
          </button>
          <button
            onClick={() => setOpen(false)}
            className="w-full py-1.5 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
          >
            {t('later')}
          </button>
        </div>
      </div>
    </div>
  )
}
