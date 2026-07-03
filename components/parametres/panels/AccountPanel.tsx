'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { AlertTriangle, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import SettingsDrawer from '../SettingsDrawer'

type Props = { open: boolean; onClose: () => void }

export default function AccountPanel({ open, onClose }: Props) {
  const router = useRouter()
  const { user } = useAuth()
  const [suspendModal, setSuspendModal] = useState(false)
  const [deleteModal1, setDeleteModal1] = useState(false)
  const [deleteModal2, setDeleteModal2] = useState(false)
  const [busy, setBusy]                 = useState(false)

  const suspend = async () => {
    if (!user || busy) return
    setBusy(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'suspended' })
        .eq('user_id', user.id)
      if (error) { toast.error('Erreur lors de la suspension'); return }

      setSuspendModal(false)
      onClose()
      toast.success('Compte suspendu temporairement')
      await supabase.auth.signOut()
      router.push('/')
    } finally {
      setBusy(false)
    }
  }

  const deleteAccount = async () => {
    if (busy) return
    setBusy(true)
    try {
      const res = await fetch('/api/account/delete', { method: 'POST' })
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: 'Erreur inconnue' }))
        toast.error(error ?? 'Échec de la suppression')
        return
      }
      setDeleteModal2(false)
      onClose()
      toast.success('Compte supprimé définitivement')
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <SettingsDrawer open={open} title="Mon compte" onClose={onClose}
        footer={
          <button onClick={onClose} className="w-full py-3 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors">
            Fermer
          </button>
        }
      >
        <div className="px-4 py-5 space-y-4">
          {/* Suspend */}
          <div className="border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-9 h-9 bg-amber-50 rounded-full flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Suspendre mon compte</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Ton profil sera masqué temporairement. Tu peux le réactiver à tout moment en te reconnectant.
                </p>
              </div>
            </div>
            <button
              onClick={() => setSuspendModal(true)}
              className="w-full py-2.5 bg-amber-50 text-amber-700 text-sm font-semibold border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors"
            >
              Suspendre
            </button>
          </div>

          {/* Delete */}
          <div className="border border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-9 h-9 bg-red-50 rounded-full flex items-center justify-center shrink-0">
                <Trash2 className="w-4 h-4 text-red-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Supprimer mon compte</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Action irréversible. Toutes tes données et conversations seront définitivement supprimées.
                </p>
              </div>
            </div>
            <button
              onClick={() => setDeleteModal1(true)}
              className="w-full py-2.5 bg-red-50 text-red-600 text-sm font-semibold border border-red-200 rounded-xl hover:bg-red-100 transition-colors"
            >
              Supprimer définitivement
            </button>
          </div>
        </div>
      </SettingsDrawer>

      {/* Suspend modal */}
      {suspendModal && (
        <div className="fixed inset-0 bg-black/50 z-[80] flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-semibold text-gray-900 mb-2">Suspendre le compte ?</h3>
            <p className="text-sm text-gray-500 mb-5">Ton profil sera masqué. Tu pourras te reconnecter à tout moment.</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setSuspendModal(false)} className="py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl">Annuler</button>
              <button onClick={suspend} className="py-2.5 bg-amber-500 text-white text-sm font-semibold rounded-xl">Confirmer</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete modal 1 */}
      {deleteModal1 && (
        <div className="fixed inset-0 bg-black/50 z-[80] flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-semibold text-gray-900 mb-2">Es-tu sûr(e) ?</h3>
            <p className="text-sm text-gray-500 mb-5">Cette action supprimera définitivement ton profil, tes photos et tous tes messages. Elle est irréversible.</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setDeleteModal1(false)} className="py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl">Annuler</button>
              <button onClick={() => { setDeleteModal1(false); setDeleteModal2(true) }} className="py-2.5 bg-red-500 text-white text-sm font-semibold rounded-xl">Continuer</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete modal 2 */}
      {deleteModal2 && (
        <div className="fixed inset-0 bg-black/50 z-[80] flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-semibold text-red-600 mb-2">Confirmation finale</h3>
            <p className="text-sm text-gray-500 mb-5">Clique sur "Supprimer" pour confirmer la suppression définitive de ton compte Jommba.</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setDeleteModal2(false)} className="py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl">Annuler</button>
              <button onClick={deleteAccount} className="py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
