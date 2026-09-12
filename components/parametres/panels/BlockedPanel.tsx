'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Ban, Loader2, ShieldCheck } from 'lucide-react'
import SettingsDrawer from '../SettingsDrawer'
import { useAuth } from '@/components/providers/AuthProvider'
import { fetchBlockedMembers, unblockUser, type BlockedMember } from '@/lib/supabase/moderation-service'

type Props = { open: boolean; onClose: () => void }

export default function BlockedPanel({ open, onClose }: Props) {
  const router  = useRouter()
  const t       = useTranslations('dashboard.parametres.blocked')
  const { user } = useAuth()
  // null = jamais chargé (spinner). Une réouverture rafraîchit en gardant la
  // liste précédente à l'écran plutôt que de faire clignoter un spinner.
  const [members, setMembers] = useState<BlockedMember[] | null>(null)
  // Déblocage en cours, par membre : évite un double clic sur la même ligne.
  const [pending, setPending] = useState<string | null>(null)
  const loading = members === null

  // Rechargé à chaque ouverture : la liste bouge depuis l'écran de discussion.
  useEffect(() => {
    if (!open || !user) return
    let cancelled = false
    fetchBlockedMembers(user.id).then(list => {
      if (!cancelled) setMembers(list)
    })
    return () => { cancelled = true }
  }, [open, user])

  const handleUnblock = async (member: BlockedMember) => {
    if (!user) return
    setPending(member.userId)
    try {
      if (!await unblockUser(user.id, member.userId)) {
        toast.error(t('unblockError'))
        return
      }
      setMembers(list => (list ?? []).filter(m => m.userId !== member.userId))
      toast.success(t('unblockDone', { name: member.firstName }))
    } finally {
      setPending(null)
    }
  }

  return (
    <SettingsDrawer open={open} title={t('title')} onClose={onClose}
      footer={
        <button onClick={onClose} className="w-full py-3 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors">
          {t('close')}
        </button>
      }
    >
      <div className="px-4 py-5 space-y-4">

        {/* Rappel de ce que le blocage implique */}
        <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-gray-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">{t('explainTitle')}</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{t('explainDesc')}</p>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin text-[#10B981]" />
          </div>
        )}

        {members !== null && members.length === 0 && (
          <div className="border border-gray-100 rounded-xl p-10 text-center">
            <Ban className="w-9 h-9 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">{t('empty')}</p>
            <p className="text-xs text-gray-300 mt-1">{t('emptyHint')}</p>
          </div>
        )}

        {members !== null && members.length > 0 && (
          <div className="space-y-2">
            {members.map(member => (
              <div
                key={member.userId}
                className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-3"
              >
                <img
                  src={member.photo}
                  alt={member.firstName}
                  className="w-10 h-10 rounded-full object-cover shrink-0 grayscale"
                />
                <button
                  onClick={() => { onClose(); router.push(`/dashboard/profil/${member.userId}`) }}
                  className="flex-1 min-w-0 text-left"
                >
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {member.firstName} {member.lastInitial}.
                  </p>
                  <p className="text-xs text-gray-400">
                    {t('since', { date: new Date(member.blockedAt).toLocaleDateString() })}
                  </p>
                </button>
                <button
                  onClick={() => handleUnblock(member)}
                  disabled={pending === member.userId}
                  className="shrink-0 px-3.5 py-2 rounded-xl bg-[#E1F5EE] text-[#047857] text-xs font-semibold hover:bg-[#d1eee3] disabled:opacity-60 flex items-center gap-1.5 transition-colors"
                >
                  {pending === member.userId && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {t('unblock')}
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </SettingsDrawer>
  )
}
