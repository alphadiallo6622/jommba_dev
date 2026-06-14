'use client'

import { useState } from 'react'
import { Eye, PauseCircle, MessageCircle, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useVisibilityStore, VisibilityMode } from '@/store/visibility.store'

type Option = { id: VisibilityMode; label: string; icon: string }

const options: Option[] = [
  { id: 'actif',      label: 'Profil actif',  icon: '👁️' },
  { id: 'pause',      label: 'En pause',       icon: '⏸️' },
  { id: 'discussion', label: 'En discussion',  icon: '💬' },
]

type ConfirmConfig = {
  mode: VisibilityMode
  title: string
  body: string
  confirmLabel: string
  confirmClass: string
  icon: React.ReactNode
}

const confirmConfigs: Record<'pause' | 'discussion', ConfirmConfig> = {
  pause: {
    mode: 'pause',
    title: 'Mettre en pause ?',
    body: 'Ton profil sera invisible dans les recherches. Les membres ne pourront plus te trouver.',
    confirmLabel: 'Confirmer',
    confirmClass: 'bg-red-500 hover:bg-red-600',
    icon: <PauseCircle className="w-8 h-8 text-red-500" />,
  },
  discussion: {
    mode: 'discussion',
    title: 'Passer En Discussion ?',
    body: "Tu apparaîtras avec un badge 'En discussion'. Les nouvelles demandes seront bloquées.",
    confirmLabel: 'Confirmer',
    confirmClass: 'bg-pink-500 hover:bg-pink-600',
    icon: <MessageCircle className="w-8 h-8 text-pink-500" />,
  },
}

export default function VisibilityToggle() {
  const { mode, setMode } = useVisibilityStore()
  const [pending, setPending] = useState<'pause' | 'discussion' | null>(null)

  const handleSelect = (id: VisibilityMode) => {
    if (id === 'actif') {
      setMode('actif')
      return
    }
    if (id === mode) return
    setPending(id as 'pause' | 'discussion')
  }

  const confirm = () => {
    if (pending) setMode(pending)
    setPending(null)
  }

  const config = pending ? confirmConfigs[pending] : null

  return (
    <>
      <div className="bg-white rounded-xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <Eye className="w-4 h-4 text-emerald-500" />
          <span className="font-bold text-gray-900 text-sm">Visibilité du profil</span>
        </div>
        <p className="text-xs text-gray-400 mb-3">Contrôle qui peut te voir</p>

        <div className="grid grid-cols-3 gap-2">
          {options.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => handleSelect(id)}
              className={cn(
                'flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border-2 transition-all duration-200',
                mode === id
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-100 bg-gray-50 hover:border-gray-200'
              )}
            >
              <span className="text-lg">{icon}</span>
              <span className={cn('text-[10px] font-semibold leading-tight text-center', mode === id ? 'text-emerald-700' : 'text-gray-500')}>
                {label}
              </span>
              {mode === id && (
                <span className="text-[9px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                  Actif
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Confirmation modal */}
      <AnimatePresence>
        {config && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setPending(null)}
            />
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.2 }}
              className="fixed left-4 right-4 top-1/2 -translate-y-1/2 max-w-sm mx-auto bg-white rounded-2xl z-[51] shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="px-5 pt-5 pb-4">
                {/* Close */}
                <button
                  onClick={() => setPending(null)}
                  className="absolute top-4 right-4 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-gray-600" />
                </button>

                {/* Icon + title */}
                <div className="flex flex-col items-center text-center gap-3 mb-4">
                  {config.icon}
                  <h3 className="font-bold text-gray-900 text-base">{config.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{config.body}</p>
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={confirm}
                    className={cn('w-full py-3 rounded-xl text-white text-sm font-semibold transition-colors', config.confirmClass)}
                  >
                    {config.confirmLabel}
                  </button>
                  <button
                    onClick={() => setPending(null)}
                    className="w-full py-3 rounded-xl bg-gray-100 text-gray-600 text-sm font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
