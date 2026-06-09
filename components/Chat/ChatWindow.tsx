'use client'

import { useEffect, useRef, useState } from 'react'
import { getSupabase } from '@/lib/supabase/singleton'
import { useAuth } from '@/app/hooks/useAuth'
import {
  listMessages,
  sendMessage,
  markConversationAsRead,
  subscribeToMessages,
  type MessageRecord,
} from '@/lib/chat'
import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'
import ChatHeader from './ChatHeader'
import { Loader2 } from 'lucide-react'

interface ChatWindowProps {
  conversationId: string
  onBack?: () => void
}

export default function ChatWindow({ conversationId, onBack }: ChatWindowProps) {
  const { user, profile } = useAuth()
  const supabase = getSupabase()
  const [messages, setMessages] = useState<MessageRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const firstLoad = useRef(true)

  // Carregar mensagens iniciais
  useEffect(() => {
    if (!conversationId) return
    let mounted = true
    setLoading(true)
    listMessages(supabase, conversationId, { limit: 100 })
      .then((list) => {
        if (!mounted) return
        setMessages(list)
        setError('')
        // Marcar como lida ao abrir
        if (user) markConversationAsRead(supabase, conversationId, user.id)
      })
      .catch((err: any) => {
        if (!mounted) return
        setError(err?.message || 'Erro ao carregar mensagens')
      })
      .finally(() => {
        if (mounted) {
          setLoading(false)
          firstLoad.current = false
        }
      })
    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, user?.id])

  // Realtime
  useEffect(() => {
    if (!conversationId || !user) return
    const unsub = subscribeToMessages(supabase, conversationId, (msg) => {
      setMessages((prev) => {
        // Evitar duplicata
        if (prev.some((m) => m.id === msg.id)) return prev
        return [...prev, msg]
      })
      // Marcar como lida se não é nossa mensagem
      if (msg.sender_id !== user.id) {
        markConversationAsRead(supabase, conversationId, user.id)
      }
    })
    return () => unsub()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, user?.id])

  // Auto-scroll para o fim ao receber mensagens
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages.length])

  const handleSend = async (content: string, attachment: any) => {
    if (!user) return
    if (!content.trim() && !attachment) return
    setSending(true)
    try {
      const msg = await sendMessage(supabase, {
        conversationId,
        senderId: user.id,
        content,
        attachment,
      })
      // A realtime vai adicionar — mas como otimização, adicionamos já
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev
        return [...prev, msg]
      })
    } catch (err: any) {
      setError(err?.message || 'Erro ao enviar')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#020617]">
      <ChatHeader conversationId={conversationId} onBack={onBack} />

      {error && (
        <div className="mx-4 mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-300">
          {error}
        </div>
      )}

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-2"
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500 text-sm">
            Nenhuma mensagem ainda. Comece a conversa!
          </div>
        ) : (
          messages.map((m, i) => {
            const prev = messages[i - 1]
            const showAvatar =
              !prev ||
              prev.sender_id !== m.sender_id ||
              new Date(m.created_at).getTime() - new Date(prev.created_at).getTime() > 5 * 60 * 1000
            return (
              <MessageBubble
                key={m.id}
                message={m}
                isOwn={m.sender_id === user?.id}
                showAvatar={showAvatar}
              />
            )
          })
        )}
      </div>

      <MessageInput
        conversationId={conversationId}
        onSend={handleSend}
        disabled={sending}
      />
    </div>
  )
}
