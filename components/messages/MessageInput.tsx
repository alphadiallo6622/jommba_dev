'use client'

import { useState } from 'react'
import { Send, Mic } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

type Props = {
  onSend: (text: string) => void
  isPremium: boolean
}

export default function MessageInput({ onSend, isPremium }: Props) {
  const t = useTranslations('dashboard.messages')
  const [text, setText] = useState('')

  const handleSend = () => {
    if (!text.trim()) return
    onSend(text.trim())
    setText('')
  }

  const handleVoice = () => {
    toast.info(t('input.voiceSoon'))
  }

  return (
    <div className="px-3 sm:px-4 py-3 bg-white border-t border-gray-100 shrink-0">
      <div className="w-full flex items-center gap-2">

        {/* Voice button — premium only */}
        {isPremium && (
          <button
            onClick={handleVoice}
            className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 flex items-center justify-center shrink-0 active:scale-95 transition-all"
          >
            <Mic className="w-4 h-4" />
          </button>
        )}

        {/* Text input */}
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder={t('input.placeholder')}
          className="flex-1 min-w-0 px-4 py-3 bg-gray-100 border border-transparent rounded-full text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-[#10B981]/40 focus:ring-4 focus:ring-[#10B981]/10 transition-all"
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-all ${
            text.trim()
              ? 'bg-gradient-to-br from-[#10B981] to-[#059669] text-white shadow-[0_4px_14px_-4px_rgba(16,185,129,0.8)] hover:brightness-105 active:scale-95'
              : 'bg-gray-100 text-gray-300 cursor-not-allowed'
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
