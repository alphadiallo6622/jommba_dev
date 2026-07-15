import { useTranslations } from 'next-intl'

export default function DailyReminder() {
  const t = useTranslations('dashboard.dailyReminder')
  return (
    <div className="bg-white rounded-lg p-4 border-l-4 border-emerald-500">
      <span className="inline-block text-[10px] font-bold tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mb-2">
        {t('badge')}
      </span>
      <p className="text-gray-700 text-sm italic leading-relaxed">
        {t('quote')}
      </p>
      <p className="text-emerald-600 text-xs font-semibold mt-2">{t('source')}</p>
    </div>
  )
}
