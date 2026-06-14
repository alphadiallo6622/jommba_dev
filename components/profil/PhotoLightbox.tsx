'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

type Props = { photo: string; open: boolean; onClose: () => void }

export default function PhotoLightbox({ photo, open, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="lightbox"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            onClick={onClose}
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <motion.img
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            src={photo}
            alt="Photo"
            className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
