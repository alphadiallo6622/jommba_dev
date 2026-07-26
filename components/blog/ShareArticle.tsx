'use client'

// components/blog/ShareArticle.tsx
// Boutons de partage d'un article (réseaux sociaux + copie du lien).
// L'URL est résolue côté client pour rester correcte quel que soit le domaine.
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Check, Copy, Link2, Mail, Send, Share2 } from 'lucide-react'

interface Props {
  title: string
  excerpt?: string
  /** Palette : sur fond clair (blog/académie) ou sur bandeau coloré. */
  tone?: 'light' | 'onDark'
}

/** Cible de partage : l'URL de la page est injectée au moment du clic. */
const TARGETS = [
  {
    key: 'whatsapp',
    label: 'WhatsApp',
    icon: WhatsAppIcon,
    build: (u: string, title: string, text: string) => `https://wa.me/?text=${text}%20${u}`,
  },
  {
    key: 'facebook',
    label: 'Facebook',
    icon: FacebookIcon,
    build: (u: string) => `https://www.facebook.com/sharer/sharer.php?u=${u}`,
  },
  {
    key: 'x',
    label: 'X',
    icon: XIcon,
    build: (u: string, title: string) => `https://twitter.com/intent/tweet?url=${u}&text=${title}`,
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    icon: LinkedInIcon,
    build: (u: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
  },
  {
    key: 'telegram',
    label: 'Telegram',
    icon: Send,
    build: (u: string, title: string) => `https://t.me/share/url?url=${u}&text=${title}`,
  },
  {
    key: 'email',
    label: 'Email',
    icon: Mail,
    build: (u: string, title: string, text: string) => `mailto:?subject=${title}&body=${text}%0A%0A${u}`,
  },
]

export default function ShareArticle({ title, excerpt = '', tone = 'light' }: Props) {
  const t = useTranslations('share')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const id = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(id)
  }, [copied])

  const eTitle = encodeURIComponent(title)
  const eText = encodeURIComponent(excerpt ? `${title} — ${excerpt}` : title)

  // L'URL n'est connue qu'au runtime navigateur : on la lit au moment de l'action
  // plutôt que de la stocker dans un state (évite un rendu en cascade au montage).
  function currentUrl(): string {
    return typeof window === 'undefined' ? '' : window.location.href
  }

  function openShare(build: (u: string, title: string, text: string) => string) {
    const href = build(encodeURIComponent(currentUrl()), eTitle, eText)
    if (href.startsWith('mailto:')) {
      window.location.assign(href)
      return
    }
    window.open(href, '_blank', 'noopener,noreferrer')
  }

  async function copyLink() {
    const url = currentUrl()
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      // Contexte non sécurisé ou permission refusée : repli sur la sélection manuelle.
      window.prompt(t('copyFallback'), url)
    }
  }

  async function nativeShare() {
    // Desktop sans Web Share API : on retombe sur la copie du lien.
    if (typeof navigator === 'undefined' || !navigator.share) {
      await copyLink()
      return
    }
    try {
      await navigator.share({ title, text: excerpt || title, url: currentUrl() })
    } catch {
      // Partage annulé par l'utilisateur : rien à faire.
    }
  }

  const onDark = tone === 'onDark'
  const btn = onDark
    ? 'bg-white/15 text-white hover:bg-white/25 border-white/20'
    : 'bg-gray-50 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 border-gray-200'
  const labelCls = onDark ? 'text-white/75' : 'text-gray-400'

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider ${labelCls}`}>
        <Share2 className="w-3.5 h-3.5" />
        {t('label')}
      </span>

      {TARGETS.map(({ key, label, build, icon: Icon }) => (
        <button
          key={key}
          type="button"
          onClick={() => openShare(build)}
          aria-label={t('shareOn', { network: label })}
          title={t('shareOn', { network: label })}
          className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${btn}`}
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}

      <button
        type="button"
        onClick={copyLink}
        aria-label={copied ? t('copied') : t('copyLink')}
        title={copied ? t('copied') : t('copyLink')}
        className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${btn}`}
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </button>

      {/* Partage natif : proposé partout, l'API est testée au clic (mobile surtout). */}
      <button
        type="button"
        onClick={nativeShare}
        aria-label={t('more')}
        title={t('more')}
        className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${btn}`}
      >
        <Link2 className="w-4 h-4" />
      </button>
    </div>
  )
}

/* Icônes de marque non fournies par lucide-react */

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.96h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07" />
    </svg>
  )
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13Zm1.78 13.02H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0" />
    </svg>
  )
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.48-1.75-1.65-2.05-.17-.3-.02-.46.13-.6.14-.14.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.07 2.86 1.22 3.06c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.28.17-1.4-.07-.13-.27-.2-.57-.35M12.05 21.8h-.02c-1.72 0-3.4-.46-4.87-1.33l-.35-.2-3.62.94.97-3.52-.23-.36a9.7 9.7 0 0 1-1.5-5.19c0-5.36 4.38-9.72 9.77-9.72 2.6 0 5.06 1.02 6.9 2.85a9.66 9.66 0 0 1 2.86 6.88c0 5.36-4.38 9.72-9.9 9.72M20.5 3.49A11.63 11.63 0 0 0 12.05 0C5.6 0 .35 5.23.35 11.65c0 2.05.54 4.06 1.56 5.83L.25 24l6.7-1.75a11.7 11.7 0 0 0 5.1 1.24h.01c6.44 0 11.69-5.23 11.69-11.65 0-3.11-1.22-6.03-3.42-8.23" />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.65l-5.22-6.82-5.96 6.82H1.68l7.73-8.84L1.25 2.25h6.82l4.71 6.23 5.46-6.23Zm-1.16 17.52h1.83L7.08 4.13H5.11l11.97 15.64Z" />
    </svg>
  )
}
