import { Message } from '@/lib/mock-messages'

type Props = { message: Message }

export default function MessageBubble({ message }: Props) {
  const isMine = message.sender === 'me'

  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-2.5 animate-fade-in-up`}>
      <div className={`max-w-[80%] sm:max-w-[min(70%,620px)] px-3.5 py-2.5 text-[14px] leading-relaxed whitespace-pre-wrap break-words ${
        isMine
          ? 'bg-gradient-to-br from-[#10B981] to-[#059669] text-white rounded-2xl rounded-br-md shadow-[0_3px_12px_-4px_rgba(16,185,129,0.65)]'
          : 'bg-white text-gray-800 rounded-2xl rounded-bl-md ring-1 ring-gray-900/[0.06] shadow-[0_2px_8px_-4px_rgba(17,24,39,0.18)]'
      }`}>
        {message.text}
        <span className={`block text-[10px] tabular-nums mt-1 ${
          isMine ? 'text-white/70 text-right' : 'text-gray-400'
        }`}>
          {message.time}
        </span>
      </div>
    </div>
  )
}
