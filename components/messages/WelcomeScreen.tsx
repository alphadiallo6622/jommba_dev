import { MessageCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

type Props = {
  firstName: string
  lastInitial: string
  photo?: string
}

export default function WelcomeScreen({ firstName, lastInitial, photo }: Props) {
  const t = useTranslations('dashboard.messages')
  return (
    <div className="text-center px-8 max-w-sm mx-auto animate-fade-in-up">
      {/* Avatar du contact, avec retombée sur l'emoji si aucune photo */}
      <div className="relative w-20 h-20 mx-auto mb-5">
        {photo ? (
          <img
            src={photo}
            alt={firstName}
            className="w-20 h-20 rounded-full object-cover ring-4 ring-white shadow-[0_10px_30px_-10px_rgba(6,78,59,0.35)]"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-[#E1F5EE] ring-4 ring-white flex items-center justify-center shadow-[0_10px_30px_-10px_rgba(6,78,59,0.35)]">
            <span className="text-3xl">🙂</span>
          </div>
        )}
        <span className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-base">
          🙂
        </span>
      </div>

      <p className="font-bold text-[#064E3B] text-lg leading-snug">
        {t('welcomeGreeting', { name: `${firstName} ${lastInitial}.` })}
      </p>
      <p className="text-gray-500 text-sm leading-relaxed mt-2">
        {t('welcomeSubtitle')}
      </p>

      <div className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-[#E1F5EE] px-3.5 py-1.5 text-[11px] font-semibold text-[#047857]">
        <MessageCircle className="w-3.5 h-3.5" />
        {t('startConversation')}
      </div>
    </div>
  )
}
