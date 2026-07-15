'use client'

import { Crown, Shield, UserCheck, Calendar } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { useCurrentUser } from '@/lib/use-current-user'

export default function PremiumFooterCTA() {
  const t = useTranslations('dashboard.premium.footerCta')
  const tCta = useTranslations('dashboard.premium.cta')
  const { firstName } = useCurrentUser()

  const securityBadges = [
    { icon: Shield,    title: t('badge1Title'), sub: t('badge1Sub') },
    { icon: UserCheck, title: t('badge2Title'), sub: t('badge2Sub') },
    { icon: Calendar,  title: t('badge3Title'), sub: t('badge3Sub') },
  ]

  return (
    <section className="py-6 pb-12">
      {/* Security badges */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {securityBadges.map(({ icon: Icon, title, sub }) => (
          <div key={title} className="flex flex-col items-center text-center gap-1.5">
            <Icon className="w-5 h-5 text-emerald-500" />
            <span className="text-xs font-semibold text-gray-800 leading-tight">{title}</span>
            <span className="text-[10px] text-gray-400 leading-tight">{sub}</span>
          </div>
        ))}
      </div>

      {/* Dark CTA block */}
      <div className="bg-emerald-900 rounded-2xl p-10 text-center text-white">
        <p className="font-serif text-2xl font-bold mb-4 leading-snug">
          {t('title', { name: firstName })}
        </p>
        <p className="text-emerald-200 text-sm mb-2">
          {t('body1')}
        </p>
        <p className="text-emerald-200 text-sm mb-8">
          {t('body2')}
        </p>

        <button
          onClick={() => toast.success(tCta('paymentSoon'))}
          className="bg-white text-emerald-900 font-semibold px-8 py-3 rounded-xl hover:bg-gray-100 transition-colors inline-flex items-center gap-2 mx-auto"
        >
          <Crown className="w-5 h-5" />
          {t('button')}
        </button>

        <p className="text-emerald-300 text-xs mt-8 italic opacity-80">
          {t('quote')}
        </p>
      </div>
    </section>
  )
}
