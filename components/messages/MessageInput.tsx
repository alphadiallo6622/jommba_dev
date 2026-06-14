'use client'

import { useState } from 'react'
import { Send, Mic } from 'lucide-react'
import { toast } from 'sonner'

type Props = {
  onSend: (text: string) => void
  isPremium: boolean
}

export default function MessageInput({ onSend, isPremium }: Props) {
  const [text, setText] = useState('')

  const handleSend = () => {
    if (!text.trim()) return
    onSend(text.trim())
    setText('')
  }

  const handleVoice = () => {
    toast.info('Messages vocaux — disponible dans la prochaine version 🎤')
  }

  return (
    <div className="flex items-center gap-2 px-3 py-3 bg-white border-t border-gray-100 shrink-0">

      {/* Voice button — premium only */}
      {isPremium && (
        <button
          onClick={handleVoice}
          className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center shrink-0 transition-colors"
        >
          <Mic className="w-4 h-4 text-gray-500" />
        </button>
      )}

      {/* Text input */}
      <input
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSend()}
        placeholder="Écrivez votre message..."
        className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#10B981]/30 transition-all"
      />

      {/* Send button */}
      <button
        onClick={handleSend}
        disabled={!text.trim()}
        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
          text.trim()
            ? 'bg-[#10B981] hover:bg-[#059669]'
            : 'bg-gray-200 cursor-not-allowed'
        }`}
      >
        <Send className={`w-4 h-4 ${text.trim() ? 'text-white' : 'text-gray-400'}`} />
      </button>
    </div>
  )
}
