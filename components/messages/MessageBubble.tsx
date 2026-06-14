import { Message } from '@/lib/mock-messages'

type Props = { message: Message }

export default function MessageBubble({ message }: Props) {
  const isMine = message.sender === 'me'

  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[70%] px-4 py-2.5 text-sm ${
        isMine
          ? 'bg-[#10B981] text-white rounded-2xl rounded-br-sm'
          : 'bg-white text-gray-900 rounded-2xl rounded-bl-sm shadow-sm'
      }`}>
        {message.text}
        <p className={`text-xs mt-1 ${isMine ? 'text-white/60 text-right' : 'text-gray-400'}`}>
          {message.time}
        </p>
      </div>
    </div>
  )
}
