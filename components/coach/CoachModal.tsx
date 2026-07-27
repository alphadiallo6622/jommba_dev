'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Send } from 'lucide-react'
import { useCoachStore } from '@/store/coach.store'
import { useCurrentUser } from '@/lib/use-current-user'

const COACH_AVATAR = '/coach.png'

export default function CoachModal() {
  const {
    isOpen, isMinimized, messages, isLoading,
    closeCoach, toggleMinimize, addMessage, setLoading, updateLastMessage,
  } = useCoachStore()
  const mockUser = useCurrentUser()

  const [input, setInput]         = useState('')
  const messagesEndRef             = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const getTime = () =>
    new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: input.trim(),
      timestamp: getTime(),
    }
    addMessage(userMessage)
    setInput('')
    setLoading(true)

    const apiMessages = [...messages, userMessage]
      .filter(m => m.id !== 'welcome')
      .map(m => ({ role: m.role, content: m.content }))

    const assistantMsg = {
      id: (Date.now() + 1).toString(),
      role: 'assistant' as const,
      content: '',
      timestamp: getTime(),
    }
    addMessage(assistantMsg)

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, userName: mockUser.firstName }),
      })

      if (!res.ok) {
        let errorMsg = 'Désolé, une erreur est survenue. Réessaie dans un moment.'
        try {
          const errBody = await res.json()
          // Quota quotidien atteint : message d'information, pas une panne.
          if (errBody?.reason === 'limit' && errBody?.error) errorMsg = errBody.error
          else if (errBody?.error) errorMsg = `Erreur : ${errBody.error}`
        } catch { /* ignore json parse error */ }
        updateLastMessage(errorMsg)
        return
      }

      if (!res.body) {
        updateLastMessage('Désolé, réponse vide du serveur.')
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        fullText += decoder.decode(value, { stream: true })
        updateLastMessage(fullText)
      }
    } catch {
      updateLastMessage('Désolé, une erreur est survenue. Réessaie dans un moment.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="coach-modal"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-24 right-6 z-50 w-[340px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          style={{ maxHeight: isMinimized ? 'auto' : '520px' }}
        >
          {/* Header */}
          <div className="bg-[#10B981] px-4 py-3 flex items-center gap-3 shrink-0">
            <img
              src={COACH_AVATAR}
              alt="Coach Abdallah"
              className="w-10 h-10 rounded-full object-cover border-2 border-white/40 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm">Coach Abdallah</p>
              <p className="text-white/80 text-xs">Ton coach personnel mariage</p>
            </div>
            <button
              onClick={toggleMinimize}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors shrink-0"
            >
              <Minus className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={closeCoach}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors shrink-0"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Body — hidden when minimized */}
          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((msg, idx) => (
                  <div key={msg.id}>
                    {msg.role === 'assistant' ? (
                      <div className="flex gap-2">
                        <img
                          src={COACH_AVATAR}
                          alt="Coach"
                          className="w-8 h-8 rounded-full object-cover shrink-0 mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-[#10B981] text-xs font-semibold mb-1">Cheikh Abdallah</p>
                          <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                            <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                              {msg.content}
                              {isLoading &&
                                idx === messages.length - 1 &&
                                msg.content === '' && (
                                  <span className="inline-flex gap-1 ml-1">
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                  </span>
                                )}
                            </p>
                            <p className="text-gray-400 text-xs text-right mt-1">{msg.timestamp}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-end">
                        <div className="max-w-[80%] bg-[#10B981] rounded-2xl rounded-tr-sm px-4 py-3">
                          <p className="text-white text-sm leading-relaxed">{msg.content}</p>
                          <p className="text-white/60 text-xs text-right mt-1">{msg.timestamp}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="px-3 py-3 bg-white border-t border-gray-100 flex items-center gap-2 shrink-0">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                  placeholder="Écrivez votre message..."
                  className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#10B981]/30 transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    input.trim() && !isLoading
                      ? 'bg-[#10B981] hover:bg-[#059669]'
                      : 'bg-gray-200 cursor-not-allowed'
                  }`}
                >
                  <Send className={`w-4 h-4 ${input.trim() && !isLoading ? 'text-white' : 'text-gray-400'}`} />
                </button>
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
