import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { CheckCircle2, Clock, Shield, Star } from 'lucide-react'

export default async function OnboardingSuccessPage() {
  const t = await getTranslations('onboarding.success')
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm space-y-8 text-center">

        {/* Logo */}
        <div className="flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo_jommba_fond_transparent.png"
            alt="Jommba"
            className="h-14 w-auto"
          />
        </div>

        {/* Success circle */}
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, #10B981 0%, #064E3B 100%)' }}
          >
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-2xl font-serif font-bold text-gray-900">{t('title')}</h1>
            <p className="text-sm text-gray-500 leading-relaxed">
              {t('subtitle')}
            </p>
          </div>
        </div>

        {/* Status badges */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 text-left">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{t('submittedTitle')}</p>
              <p className="text-xs text-gray-400">{t('submittedDesc')}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-amber-50 rounded-xl px-4 py-3 text-left">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{t('verifyingTitle')}</p>
              <p className="text-xs text-gray-400">{t('verifyingDesc')}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 text-left opacity-50">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{t('validatedTitle')}</p>
              <p className="text-xs text-gray-400">{t('validatedDesc')}</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/dashboard"
          className="w-full block py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity text-center"
          style={{ background: '#10B981' }}
        >
          {t('cta')}
        </Link>

        {/* Premium upsell */}
        <div
          className="rounded-2xl p-5 text-left space-y-3"
          style={{ background: 'linear-gradient(135deg, #064E3B 0%, #10B981 100%)' }}
        >
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <p className="text-sm font-bold text-white">{t('premiumTitle')}</p>
          </div>
          <p className="text-xs text-white/80 leading-relaxed">
            {t('premiumDesc')}
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white">10 $</span>
            <span className="text-xs text-white/70">{t('perMonth')}</span>
            <span className="ml-2 text-xs line-through text-white/50">15 $</span>
          </div>
          <button className="w-full py-2 rounded-xl bg-amber-400 text-gray-900 font-bold text-sm hover:bg-amber-300 transition-colors">
            {t('premiumCta')}
          </button>
        </div>

        {/* Quranic citation */}
        <div className="border-t border-gray-50 pt-4">
          <p className="text-xs italic text-gray-400 leading-relaxed">
            {t('quote')}
          </p>
          <p className="text-xs text-emerald-500 font-medium mt-1">{t('quoteSource')}</p>
        </div>
      </div>
    </div>
  )
}
