'use client'

// components/pwa/PWAInstallBanner.tsx
// Bannière d'installation personnalisée (glassmorphism), affichée en bas de
// l'écran. Elle remplace la mini-infobar native de Chromium (interceptée dans
// lib/use-pwa-install.ts) et propose sur iOS un guide manuel, Safari
// n'implémentant pas `beforeinstallprompt`.
//
// Toute la logique d'éligibilité vit dans le hook : ce composant ne fait que
// l'affichage.

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { AnimatePresence, motion } from 'framer-motion'
import { Share, SquarePlus, X } from 'lucide-react'
import { usePWAInstall } from '@/lib/use-pwa-install'

export default function PWAInstallBanner() {
  const t = useTranslations('pwa')
  const { canShowBanner, isIOS, promptInstall, dismiss } = usePWAInstall()

  return (
    <AnimatePresence>
      {canShowBanner && (
        <motion.div
          // `role="dialog"` + aria-labelledby : annoncé correctement par les
          // lecteurs d'écran sans piéger le focus (la bannière est non modale).
          role="dialog"
          aria-modal="false"
          aria-labelledby="pwa-install-title"
          aria-describedby="pwa-install-description"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          className={[
            // Positionnement : au-dessus de la barre de navigation mobile
            // éventuelle, avec respect de l'encoche iOS (safe-area).
            'fixed inset-x-3 bottom-3 z-[60] sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[26rem]',
            'pb-[env(safe-area-inset-bottom)]',
          ].join(' ')}
        >
          <div
            className={[
              'relative rounded-2xl p-4 shadow-elevation',
              // Glassmorphism : fond translucide + flou, avec repli opaque
              // pour les navigateurs sans backdrop-filter.
              'border border-white/40 bg-white/80 backdrop-blur-xl',
              'supports-[backdrop-filter]:bg-white/70',
              // Mode sombre (prefers-color-scheme).
              'dark:border-white/10 dark:bg-jommba-dark/85 dark:supports-[backdrop-filter]:bg-jommba-dark/75',
            ].join(' ')}
          >
            {/* Fermeture rapide, en plus du bouton « Plus tard » */}
            <button
              type="button"
              onClick={dismiss}
              aria-label={t('close')}
              className="absolute right-2.5 top-2.5 rounded-lg p-1.5 text-text-muted transition-colors hover:bg-black/5 hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-text-subtle dark:hover:bg-white/10 dark:hover:text-white"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>

            <div className="flex items-start gap-3.5">
              <Image
                src="/logo_PWA_Jommba.png"
                alt=""
                width={48}
                height={48}
                className="h-12 w-12 shrink-0 rounded-xl object-contain"
              />

              <div className="min-w-0 flex-1 pr-6">
                <h2
                  id="pwa-install-title"
                  className="font-semibold text-text-primary dark:text-white"
                >
                  {isIOS ? t('iosTitle') : t('installTitle')}
                </h2>
                <p
                  id="pwa-install-description"
                  className="mt-1 text-sm leading-relaxed text-text-muted dark:text-text-subtle"
                >
                  {isIOS ? t('iosDescription') : t('installDescription')}
                </p>

                {isIOS ? (
                  // ── iOS : guide manuel ────────────────────────────────────
                  // Safari n'expose aucune API pour ouvrir la feuille de partage
                  // ni pour déclencher « Sur l'écran d'accueil » (navigator.share
                  // n'offre que les cibles de partage). Ces étapes sont donc
                  // volontairement non cliquables : elles sont numérotées et
                  // décrivent l'emplacement réel des boutons dans Safari.
                  <>
                    <ol className="mt-3 space-y-2">
                      <li className="flex items-start gap-2.5 text-sm text-text-primary dark:text-white">
                        <span
                          aria-hidden="true"
                          className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[0.6875rem] font-bold text-white"
                        >
                          1
                        </span>
                        <span className="leading-snug">
                          {t.rich('iosStepShare', {
                            icon: () => (
                              <Share
                                className="inline h-4 w-4 -translate-y-px text-primary"
                                aria-hidden="true"
                              />
                            ),
                          })}
                        </span>
                      </li>
                      <li className="flex items-start gap-2.5 text-sm text-text-primary dark:text-white">
                        <span
                          aria-hidden="true"
                          className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[0.6875rem] font-bold text-white"
                        >
                          2
                        </span>
                        <span className="leading-snug">
                          {t.rich('iosStepAdd', {
                            icon: () => (
                              <SquarePlus
                                className="inline h-4 w-4 -translate-y-px text-primary"
                                aria-hidden="true"
                              />
                            ),
                          })}
                        </span>
                      </li>
                    </ol>

                    <button
                      type="button"
                      onClick={dismiss}
                      className="mt-3.5 inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-green-btn transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-dark active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      {t('iosGotIt')}
                    </button>
                  </>
                ) : (
                  // ── Android / Chrome / Edge : invite native ────────────────
                  <div className="mt-3.5 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={promptInstall}
                      className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-green-btn transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-dark active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      {t('install')}
                    </button>
                    <button
                      type="button"
                      onClick={dismiss}
                      className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-black/5 hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-text-subtle dark:hover:bg-white/10 dark:hover:text-white"
                    >
                      {t('later')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
