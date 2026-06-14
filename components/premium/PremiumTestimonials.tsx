'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { testimonials } from '@/lib/mock-premium'

export default function PremiumTestimonials() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  const t = testimonials[current]

  return (
    <section className="py-6">
      {/* Header */}
      <div className="flex justify-center mb-3">
        <span className="bg-emerald-100 text-emerald-700 text-xs font-medium px-3 py-1 rounded-full">
          ❤️ Histoires vraies
        </span>
      </div>
      <h2 className="text-center font-bold text-xl text-gray-900 mb-6">
        Ils ont trouvé leur moitié
      </h2>

      {/* Card carousel */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="bg-yellow-50 rounded-xl p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <span className="bg-amber-100 text-amber-600 text-xs px-2 py-1 rounded-full font-medium">
                ⏱ {t.daysLabel}
              </span>
              <span className="bg-emerald-50 text-emerald-600 text-xs px-2 py-1 rounded-full font-medium">
                {t.statusLabel}
              </span>
            </div>
            <p className="text-gray-700 italic text-sm leading-relaxed">
              &ldquo;{t.quote}&rdquo;
            </p>
            <p className="text-emerald-600 font-semibold text-sm mt-4">
              {t.author} • {t.city}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current ? 'bg-amber-500 w-5' : 'bg-gray-200 w-2'
            }`}
          />
        ))}
      </div>
    </section>
  )
}
