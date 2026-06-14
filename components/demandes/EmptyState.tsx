import { Search, LucideIcon } from 'lucide-react'

type Props = {
  icon: LucideIcon
  title: string
  subtitle: string
  buttonLabel: string
  onButtonClick: () => void
}

export default function EmptyState({ icon: Icon, title, subtitle, buttonLabel, onButtonClick }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
      <div className="w-14 h-14 rounded-full bg-[#E1F5EE] flex items-center justify-center mx-auto mb-4">
        <Icon className="w-7 h-7 text-[#10B981]" />
      </div>
      <p className="font-semibold text-gray-800 mb-2">{title}</p>
      <p className="text-gray-400 text-sm mb-6">{subtitle}</p>
      <button
        onClick={onButtonClick}
        className="flex items-center gap-2 bg-[#E1F5EE] text-[#10B981] px-4 py-2 rounded-lg text-sm font-medium mx-auto hover:bg-green-100 transition-colors"
      >
        <Search className="w-4 h-4" />
        {buttonLabel}
      </button>
    </div>
  )
}
