import { LucideIcon } from 'lucide-react'

type Props = {
  icon: LucideIcon
  iconColor: string
  iconBg: string
  title: string
  text: string
}

export default function ProfileSection({ icon: Icon, iconColor, iconBg, title, text }: Props) {
  if (!text) return null
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-8 h-8 rounded-full ${iconBg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
    </div>
  )
}
