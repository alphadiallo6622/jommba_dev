'use client'

// components/pwa/PWAInstallBar.tsx
// Bandeau d'installation permanent, en haut de toutes les pages (site public
// et dashboard), au-dessus des en-têtes `fixed`. Contrairement à l'ancienne
// bannière flottante, il n'est pas refermable : il reste tant que l'app n'est
// pas installée, et disparaît définitivement une fois le mode standalone
// détecté (l'app installée ouvre le site en standalone).
//
// Le bouton n'ouvre aucun store : il déclenche l'invite d'installation PWA
// native (`beforeinstallprompt`, capturée dans lib/use-pwa-install.ts). Sur
// iOS, où Safari n'expose pas cette API, il ouvre les deux étapes manuelles.
//
// La hauteur du bandeau est publiée dans `--pwa-bar-h` (voir globals.css) :
// le <body> s'en sert comme padding haut et les en-têtes `fixed` comme
// décalage, pour que rien ne passe dessous.

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { AnimatePresence, motion } from 'framer-motion'
import { Download, Share, SquarePlus, X } from 'lucide-react'
import { usePWAInstall } from '@/lib/use-pwa-install'

/** La console d'administration est un back-office : pas de promotion d'app. */
const EXCLUDED_PREFIXES = ['/adminjommba']

export default function PWAInstallBar() {
  const t = useTranslations('pwa')
  const pathname = usePathname()
  const { canInstall, isIOS, promptInstall } = usePWAInstall()
  const [showIOSGuide, setShowIOSGuide] = useState(false)

  const excluded = EXCLUDED_PREFIXES.some((p) => pathname?.startsWith(p))
  const visible = canInstall && !excluded

  // Publie la présence du bandeau sur <html> : c'est ce drapeau qui donne sa
  // valeur à `--pwa-bar-h` et décale le reste de la page.
  useEffect(() => {
    const root = document.documentElement
    if (visible) root.setAttribute('data-pwa-bar', '1')
    else root.removeAttribute('data-pwa-bar')
    return () => root.removeAttribute('data-pwa-bar')
  }, [visible])

  const handleClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true)
      return
    }
    await promptInstall()
  }

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.aside
            aria-label={t('barAria')}
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="pwa-bar fixed inset-x-0 top-0 z-[55] h-[58px] overflow-hidden sm:h-16"
          >
            {/* Balayage lumineux lent — l'effet « premium » du bandeau. */}
            <span aria-hidden="true" className="pwa-bar__sheen" />

            <div className="relative flex h-full items-center gap-3 px-3 sm:px-5">
              {/* Icône de l'app */}
              <span className="pwa-bar__icon grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/15 ring-1 ring-white/25 sm:h-10 sm:w-10">
                <Image
                  src="/logo_PWA_Jommba.png"
                  alt=""
                  width={28}
                  height={28}
                  className="h-7 w-7 object-contain sm:h-[1.875rem] sm:w-[1.875rem]"
                />
              </span>

              {/* Accroche */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.8125rem] font-bold leading-tight text-white sm:text-sm">
                  {t('barTitle')}
                </p>
                <p className="truncate text-[0.6875rem] leading-tight text-white/75 sm:text-xs">
                  {t('barSubtitle')}
                </p>
              </div>

              {/* Appel à l'action — invite PWA, jamais le store */}
              <button
                type="button"
                onClick={handleClick}
                className="pwa-bar__cta inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-[0.8125rem] font-bold text-primary-dark shadow-lg shadow-black/10 transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:px-4 sm:text-sm"
              >
                <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="whitespace-nowrap">{t('barCta')}</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── iOS : guide manuel ───────────────────────────────────────────────
          Safari n'expose aucune API pour ouvrir la feuille de partage ni pour
          déclencher « Sur l'écran d'accueil ». Ces étapes sont donc
          descriptives : elles indiquent où se trouvent les vrais boutons. */}
      <AnimatePresence>
        {showIOSGuide && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-end justify-center p-3 sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
              onClick={() => setShowIOSGuide(false)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="pwa-ios-title"
              initial={{ y: 32, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 32, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                aria-label={t('close')}
                className="absolute right-2.5 top-2.5 rounded-lg p-1.5 text-text-muted transition-colors hover:bg-black/5 hover:text-text-primary"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>

              <div className="flex items-center gap-3">
                <Image
                  src="/logo_PWA_Jommba.png"
                  alt=""
                  width={44}
                  height={44}
                  className="h-11 w-11 shrink-0 rounded-xl object-contain"
                />
                <h2 id="pwa-ios-title" className="font-bold text-text-primary">
                  {t('iosTitle')}
                </h2>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-text-muted">
                {t('iosDescription')}
              </p>

              <ol className="mt-4 space-y-2.5">
                {([
                  ['iosStepShare', Share],
                  ['iosStepAdd', SquarePlus],
                ] as const).map(([key, Icon], index) => (
                  <li key={key} className="flex items-start gap-2.5 text-sm text-text-primary">
                    <span
                      aria-hidden="true"
                      className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[0.6875rem] font-bold text-white"
                    >
                      {index + 1}
                    </span>
                    <span className="leading-snug">
                      {t.rich(key, {
                        icon: () => (
                          <Icon className="inline h-4 w-4 -translate-y-px text-primary" aria-hidden="true" />
                        ),
                      })}
                    </span>
                  </li>
                ))}
              </ol>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-green-btn transition-colors hover:bg-primary-dark"
              >
                {t('iosGotIt')}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
