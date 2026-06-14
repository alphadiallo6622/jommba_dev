import { Timer, CheckCircle, XCircle } from 'lucide-react'

type Props = {
  status: 'en-attente' | 'acceptee' | 'refusee'
}

const config = {
  'en-attente': { bg: 'bg-amber-100', text: 'text-amber-600', icon: Timer,       label: 'En attente' },
  'acceptee':   { bg: 'bg-green-100', text: 'text-green-600', icon: CheckCircle, label: 'Acceptée'   },
  'refusee':    { bg: 'bg-red-100',   text: 'text-red-500',   icon: XCircle,     label: 'Refusée'    },
}

export default function StatusBadge({ status }: Props) {
  const { bg, text, icon: Icon, label } = config[status]
  return (
    <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${bg} ${text}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  )
}
