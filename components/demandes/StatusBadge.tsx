import { Timer, CheckCircle, XCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

type Props = {
  status: 'en-attente' | 'acceptee' | 'refusee'
}

const config = {
  'en-attente': { bg: 'bg-amber-100', text: 'text-amber-600', icon: Timer,       labelKey: 'pending'  },
  'acceptee':   { bg: 'bg-green-100', text: 'text-green-600', icon: CheckCircle, labelKey: 'accepted' },
  'refusee':    { bg: 'bg-red-100',   text: 'text-red-500',   icon: XCircle,     labelKey: 'rejected' },
} as const

export default function StatusBadge({ status }: Props) {
  const t = useTranslations('dashboard.demandes.status')
  const { bg, text, icon: Icon, labelKey } = config[status]
  return (
    <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${bg} ${text}`}>
      <Icon className="w-3 h-3" />
      {t(labelKey)}
    </span>
  )
}
