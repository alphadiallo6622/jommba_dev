'use client'

import { useEffect, useRef } from 'react'
import { Message } from '@/lib/mock-messages'
import MessageBubble from './MessageBubble'
import WelcomeScreen from './WelcomeScreen'

type Props = {
  messages: Message[]
  firstName: string
  lastInitial: string
  photo?: string
}

export default function MessageArea({ messages, firstName, lastInitial, photo }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div
      className="flex-1 overflow-y-auto flex flex-col"
      style={{
        backgroundColor: '#F7F8FA',
        backgroundImage:
          'radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.07), transparent 60%), radial-gradient(circle, rgba(16, 185, 129, 0.09) 1px, transparent 1px)',
        backgroundSize: '100% 320px, 22px 22px',
        backgroundRepeat: 'no-repeat, repeat',
      }}
    >
      {messages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <WelcomeScreen firstName={firstName} lastInitial={lastInitial} photo={photo} />
        </div>
      ) : (
        <div className="w-full px-3 sm:px-5 py-5">
          {messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  )
}
