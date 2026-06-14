import { LucideIcon } from 'lucide-react'

type Field = { label: string; value: string }

type Props = {
  icon: LucideIcon
  iconColor: string
  iconBg: string
  title: string
  fields: Field[]
}

export default function ProfileGridSection({ icon: Icon, iconColor, iconBg, title, fields }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-8 h-8 rounded-full ${iconBg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {fields.map(({ label, value }) => (
          <div key={label}>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
            <p className="text-sm font-semibold text-gray-800">{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
