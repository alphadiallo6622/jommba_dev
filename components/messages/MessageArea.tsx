'use client'

import { useEffect, useRef } from 'react'
import { Message } from '@/lib/mock-messages'
import MessageBubble from './MessageBubble'
import WelcomeScreen from './WelcomeScreen'

type Props = {
  messages: Message[]
  firstName: string
  lastInitial: string
}

export default function MessageArea({ messages, firstName, lastInitial }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div
      className="flex-1 overflow-y-auto flex flex-col"
      style={{
        backgroundColor: '#F3F4F6',
        backgroundImage: 'radial-gradient(circle, rgba(16, 185, 129, 0.10) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      {messages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <WelcomeScreen firstName={firstName} lastInitial={lastInitial} />
        </div>
      ) : (
        <div className="p-4">
          {messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  )
}
