'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { faqs } from '@/lib/mock-premium'
import { cn } from '@/lib/utils'

export default function PremiumFAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="py-6">
      <h2 className="text-center font-bold text-xl text-gray-900 mb-6">
        Questions fréquentes
      </h2>

      <div className="border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-100">
        {faqs.map((faq, i) => (
          <div key={i}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex justify-between items-center px-4 py-4 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-medium text-gray-800 pr-4">{faq.question}</span>
              <ChevronDown
                className={cn(
                  'w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200',
                  open === i && 'rotate-180'
                )}
              />
            </button>

            <AnimatePresence initial={false}>
              {open === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <p className="px-4 pb-4 text-sm text-gray-500 leading-relaxed">
                    {faq.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  )
}
