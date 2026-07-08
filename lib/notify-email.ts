'use client'

type NotifyType = 'demande' | 'message' | 'demande_acceptee'

// Fire-and-forget : ne bloque jamais l'action métier (envoi de message/demande)
// si l'email échoue ou si le destinataire a désactivé cette préférence.
export function notifyByEmail(receiverId: string, type: NotifyType, senderName: string) {
  fetch('/api/notify-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ receiverId, type, senderName }),
    keepalive: true,
  }).catch(() => {})
}
