'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, X, MessageCircle, Crown, Heart, Send, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { FullProfile } from '@/lib/mock-demandes'

type Props = {
  profile: FullProfile
  isPremium: boolean
  /** Envoie la demande de contact avec un message flash joint. Retourne ok. */
  onSend: (flashMessage: string) => Promise<boolean>
  onClose: () => void
}

const MAX = 300

export default function FlashMessageModal({ profile, isPremium, onSend, onClose }: Props) {
  const router = useRouter()
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)

  const handleUpgrade = () => {
    onClose()
    router.push('/dashboard/premium')
  }

  const handleSend = async () => {
    const message = text.trim()
    if (!message) { toast.error('Écris un message flash'); return }
    setSending(true)
    const ok = await onSend(message)
    setSending(false)
    if (ok) onClose()
  }

  // ─── Upsell (non-Premium) ─────────────────────────────────────────────────
  if (!isPremium) {
    return (
      <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
        <div
          className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-400 mx-auto flex items-center justify-center mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center justify-center gap-1.5">
              Le Message Flash <span>⚡</span>
            </h2>
            <p className="text-sm text-gray-500 mt-1.5">Fais la différence dès le premier contact.</p>
          </div>

          <div className="px-6 space-y-4">
            <Benefit
              icon={<MessageCircle className="w-4 h-4 text-[#10B981]" />}
              bg="bg-[#E1F5EE]"
              title="Présente-toi avant même l'acceptation"
              text="Ta demande arrive avec ton message personnalisé"
            />
            <Benefit
              icon={<Crown className="w-4 h-4 text-amber-500" />}
              bg="bg-amber-50"
              title="Montre ton sérieux"
              text="Un message personnalisé vaut mille demandes vides"
            />
            <Benefit
              icon={<Heart className="w-4 h-4 text-pink-500" />}
              bg="bg-pink-50"
              title="2x plus de chances d'être accepté"
              text="Les profils avec message ont bien plus de succès"
            />
          </div>

          <div className="flex gap-3 p-6 pt-6">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Plus tard
            </button>
            <button
              onClick={handleUpgrade}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 text-white text-sm font-bold hover:bg-amber-600 transition-colors"
            >
              <Crown className="w-4 h-4" /> Débloquer Premium
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ─── Composer (Premium) ───────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-end md:items-center md:justify-center" onClick={onClose}>
      <div
        className="bg-white rounded-t-2xl md:rounded-2xl w-full md:w-[440px] md:max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-base leading-tight flex items-center gap-1">Message Flash <span>⚡</span></h2>
              <p className="text-gray-400 text-xs">Ta demande à {profile.firstName} arrive avec ton message</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors shrink-0"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 pb-6">
          <div className="relative">
            <textarea
              value={text}
              onChange={e => setText(e.target.value.slice(0, MAX))}
              placeholder={`Présente-toi à ${profile.firstName} en quelques mots…`}
              rows={5}
              autoFocus
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all resize-none"
            />
            <span className="absolute bottom-2 right-3 text-[11px] text-gray-400">{text.length}/{MAX}</span>
          </div>

          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1.5">
            <Heart className="w-3 h-3 shrink-0" />
            Reste pudique et sincère : ton message est modéré.
          </p>

          <button
            onClick={handleSend}
            disabled={sending}
            className="w-full flex items-center justify-center gap-2 py-3.5 mt-4 rounded-xl bg-amber-500 text-white text-sm font-bold hover:bg-amber-600 transition-colors disabled:opacity-60"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Envoyer la demande avec message
          </button>
        </div>
      </div>
    </div>
  )
}

function Benefit({ icon, bg, title, text }: { icon: React.ReactNode; bg: string; title: string; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center shrink-0`}>{icon}</div>
      <div>
        <p className="font-semibold text-gray-900 text-sm leading-tight">{title}</p>
        <p className="text-gray-500 text-xs mt-0.5">{text}</p>
      </div>
    </div>
  )
}
