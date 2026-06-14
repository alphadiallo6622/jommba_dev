'use client'

import { useCurrentUser } from '@/lib/use-current-user'

export default function PremiumHero() {
  const { firstName } = useCurrentUser()

  return (
    <section className="text-center py-6">
      {/* Alert banner */}
      <div className="inline-flex items-center bg-amber-600 text-white text-xs px-4 py-2 rounded-full mb-6">
        Halal, sérieux, vérifié à la main
      </div>

      {/* Title */}
      <h1 className="font-serif text-4xl leading-tight text-gray-900 mb-4">
        <span className="block">{firstName},</span>
        <span className="block">
          ta future épouse t&apos;attend.{' '}
          <span className="text-emerald-500">Ne la rate pas.</span>
        </span>
      </h1>

      {/* Subtitle */}
      <p className="text-gray-500 max-w-md mx-auto text-sm leading-relaxed mb-8">
        Sans Premium, ton profil reste noyé. Avec Premium, tu apparais en premier,
        tu vois qui s&apos;intéresse à toi, et tu réponds sans limite.
      </p>

      {/* Stats */}
      <div className="bg-yellow-50 border border-amber-200 rounded-xl grid grid-cols-3 divide-x divide-amber-200">
        {[
          { value: '3x',        label: 'plus de réponses' },
          { value: '200 000+',  label: 'profils vérifiés' },
          { value: '100%',      label: 'halal garanti'    },
        ].map(({ value, label }) => (
          <div key={label} className="py-5 flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-amber-600">{value}</span>
            <span className="text-xs text-gray-500">{label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
