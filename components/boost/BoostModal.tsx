'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { X } from 'lucide-react'
import { useBoostStore } from '@/store/boost.store'
import BoostStep1 from './BoostStep1'
import BoostStep2 from './BoostStep2'
import BoostStep3 from './BoostStep3'

export default function BoostModal() {
  const t = useTranslations('dashboard.boost')
  const { step, closeBoost } = useBoostStore()

  return (
    <AnimatePresence>
      {step && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={closeBoost}
        >
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm relative"
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeBoost}
              aria-label={t('close')}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors z-10"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>

            {step === 1 && <BoostStep1 />}
            {step === 2 && <BoostStep2 />}
            {step === 3 && <BoostStep3 />}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
