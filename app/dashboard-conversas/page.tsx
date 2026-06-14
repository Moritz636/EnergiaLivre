'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/app/hooks/useAuth'
import { getSupabase } from '@/lib/supabase/singleton'
import { subscribeToMessages } from '@/lib/chat'
import type { MessageRecord } from '@/lib/chat'
import {
  Loader2,
  MessageCircle,
  ArrowLeft,
  Heart,
  Search,
  Send,
  Check,
  CheckCheck,
  Clock,
  ChevronLeft,
  X,
} from 'lucide-react'

type Tab = 'matches' | 'chat'

interface OtherUser {
  id: string
  nome: string
  tipo: string | null
  cidade: string | null
  estado: string | null
  avatar_url: string | null
}

interface Proposal {
  id: number
  status: string
  message: string | null
  created_at: string
  direction: string
  other_user: OtherUser | null
}

interface ChatMessage {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
  attachment_name: string | null
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime()
  const min = Math.floor(ms / 60000)
  const h = Math.floor(min / 60)
  const d = Math.floor(h / 24)
  if (min < 1) return 'agora'
  if (min < 60) return `há ${min}min`
  if (h < 24) return `há ${h}h`
  if (d < 7) return `há ${d}d`
  return new Date(iso).toLocaleDateString('pt-BR')
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  if (sameDay) return time
  return `${d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} ${time}`
}

function getInitial(name: string): string {
  return (name ?? 'U').charAt(0).toUpperCase()
}

function getAvatarColor(tipo: string | null): string {
  if (tipo === 'gerador') return 'bg-blue-500/20 text-blue-300'
  if (tipo === 'parceiro') return 'bg-purple-500/20 text-purple-300'
  return 'bg-emerald-500/20 text-emerald-300'
}

export default function DashboardConversasPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = getSupabase()

  const [proposals, setProposals] = useState<Proposal[]>([])
  const [matchesLoading, setMatchesLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [activeMatchId, setActiveMatchId] = useState<number | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [conversationLoading, setConversationLoading] = useState(false)

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [activeOtherUser, setActiveOtherUser] = useState<OtherUser | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?from=consumidor')
    }
  }, [user, authLoading, router])

  // Load matches
  const loadMatches = useCallback(async () => {
    if (!user) return
    setMatchesLoading(true)
    setError('')
    try {
      const res = await fetch('/api/matches/list?direction=accepted')
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Erro ao carregar')
      setProposals(body.proposals ?? [])
    } catch (err: any) {
      setError(err?.message || 'Erro ao carregar')
    } finally {
      setMatchesLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) loadMatches()
  }, [user, loadMatches])

  // Open chat for a match
  const handleOpenChat = async (proposal: Proposal) => {
    if (!proposal.other_user) return
    setActiveMatchId(proposal.id)
    setActiveOtherUser(proposal.other_user)
    setConversationLoading(true)
    setError('')
    setMessages([])
    try {
      const res = await fetch(`/api/chat/or-with-match/${proposal.id}`)
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Erro ao abrir conversa')
      setConversationId(body.conversationId)
      setConversationLoading(false)
    } catch (err: any) {
      setError(err?.message || 'Erro ao abrir conversa')
      setConversationLoading(false)
    }
  }

  const handleBack = () => {
    setActiveMatchId(null)
    setConversationId(null)
    setActiveOtherUser(null)
    setMessages([])
  }

  // Load messages when conversation is ready
  useEffect(() => {
    if (!conversationId) return
    loadMessages(conversationId)
  }, [conversationId])

  const loadMessages = async (convId: string) => {
    setMessagesLoading(true)
    try {
      const res = await fetch(`/api/chat/conversations/${convId}/messages`)
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Erro ao carregar mensagens')
      setMessages(body.messages ?? [])
    } catch (err: any) {
      console.error('loadMessages error:', err)
    } finally {
      setMessagesLoading(false)
    }
  }

  // Auto scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Realtime subscription
  useEffect(() => {
    if (!conversationId) return
    const cleanup = subscribeToMessages(supabase as any, conversationId, (msg: MessageRecord) => {
      setMessages((prev) => [...prev, msg as ChatMessage])
    })
    return cleanup
  }, [conversationId, supabase])

  const handleSend = async () => {
    if (!newMessage.trim() || !conversationId || sending) return
    setSending(true)
    try {
      const res = await fetch(`/api/chat/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage.trim() }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Erro ao enviar')
      setNewMessage('')
    } catch (err: any) {
      setError(err?.message || 'Erro ao enviar')
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const filtered = search
    ? proposals.filter((p) =>
        p.other_user?.nome?.toLowerCase().includes(search.toLowerCase()),
      )
    : proposals

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
      </div>
    )
  }

  // ---- CHAT PANEL VIEW ----
  if (activeMatchId && activeOtherUser) {
    const accent = activeOtherUser.tipo === 'gerador' ? 'blue' : activeOtherUser.tipo === 'parceiro' ? 'purple' : 'emerald'
    return (
      <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col">
        {/* Chat Header */}
        <div className="sticky top-0 z-40 bg-[#020617]/80 backdrop-blur-md border-b border-white/10">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
            <button
              onClick={handleBack}
              className="p-1.5 rounded-lg hover:bg-white/10 transition"
              aria-label="Voltar"
            >
              <ChevronLeft className="w-5 h-5 text-slate-300" />
            </button>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
              accent === 'blue' ? 'bg-blue-500/20' : accent === 'purple' ? 'bg-purple-500/20' : 'bg-emerald-500/20'
            }`}>
              <span className={`font-extrabold text-lg ${
                accent === 'blue' ? 'text-blue-300' : accent === 'purple' ? 'text-purple-300' : 'text-emerald-300'
              }`}>
                {getInitial(activeOtherUser.nome)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold text-white truncate">{activeOtherUser.nome}</h2>
              <p className="text-[11px] text-slate-500">
                {activeOtherUser.tipo}
                {activeOtherUser.cidade ? ` • ${activeOtherUser.cidade}` : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 max-w-3xl mx-auto w-full">
          {conversationLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
            </div>
          ) : messagesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-10 h-10 mx-auto mb-2 text-slate-600" />
              <p className="text-sm text-slate-500">Nenhuma mensagem ainda</p>
              <p className="text-xs text-slate-600 mt-1">Envie uma mensagem para iniciar a conversa!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_id === user.id
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 ${
                      isMe
                        ? 'bg-emerald-500/20 border border-emerald-500/30 text-slate-100'
                        : 'bg-white/5 border border-white/10 text-slate-200'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {msg.content}
                    </p>
                    {msg.attachment_name && (
                      <p className="text-xs text-slate-500 mt-1">📎 {msg.attachment_name}</p>
                    )}
                    <p className={`text-[10px] mt-1 ${isMe ? 'text-emerald-400/60' : 'text-slate-500'}`}>
                      {formatTime(msg.created_at)}
                      {isMe && <Check className="w-3 h-3 inline ml-1 -mt-0.5" />}
                    </p>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="sticky bottom-0 bg-[#020617]/80 backdrop-blur-md border-t border-white/10">
          <div className="max-w-3xl mx-auto px-4 py-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua mensagem..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition"
                disabled={sending}
              />
              <button
                onClick={handleSend}
                disabled={!newMessage.trim() || sending}
                className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 text-[#020617] animate-spin" />
                ) : (
                  <Send className="w-4 h-4 text-[#020617]" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ---- MATCHES LIST VIEW ----
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
      {/* Header */}
      <nav className="sticky top-0 z-40 bg-[#020617]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={
                profile?.tipo === 'gerador'
                  ? '/dashboard-gerador'
                  : profile?.tipo === 'parceiro'
                    ? '/embaixador/dashboard'
                    : '/dashboard-consumidor'
              }
              className="p-1.5 rounded-lg hover:bg-white/10 transition"
              aria-label="Voltar"
            >
              <ArrowLeft className="w-5 h-5 text-slate-300" />
            </Link>
            <div className="w-9 h-9 rounded-lg bg-pink-500/20 flex items-center justify-center">
              <Heart className="text-pink-400 w-4 h-4" />
            </div>
            <div>
              <span className="text-xl font-black text-white">MATCH</span>
              <p className="text-[10px] text-slate-500 -mt-0.5">Conversas</p>
            </div>
          </div>
          <Link
            href="/dashboard/propostas"
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition"
          >
            Propostas
          </Link>
        </div>
      </nav>

      <main className="pb-8 px-4 md:px-6 max-w-3xl mx-auto">
        {/* Search */}
        <div className="relative mt-4 mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar conversas..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition"
          />
        </div>

        {error && (
          <div className="mb-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Loading */}
        {matchesLoading ? (
          <div className="py-16 text-center">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
            <p className="text-sm text-slate-500 mt-3">Carregando matches...</p>
          </div>
        ) : filtered.length === 0 ? (
          /* Empty state */
          <div className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 mx-auto mb-4 flex items-center justify-center">
              <Heart className="w-7 h-7 text-slate-600" />
            </div>
            <p className="text-base font-bold text-slate-400">Nenhum match ainda</p>
            <p className="text-sm text-slate-600 mt-1 max-w-xs mx-auto">
              Quando duas pessoas se curtirem mutuamente, o match vira aceito e o chat libera.
            </p>
            <Link
              href="/dashboard/match"
              className="inline-block mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-[#020617] text-sm font-bold hover:from-emerald-400 hover:to-emerald-500 transition"
            >
              Explorar perfis
            </Link>
          </div>
        ) : (
          /* Matches list */
          <div className="space-y-2">
            {filtered.map((p) => {
              const o = p.other_user
              if (!o) return null
              const accent = o.tipo === 'gerador' ? 'blue' : o.tipo === 'parceiro' ? 'purple' : 'emerald'
              const initial = getInitial(o.nome)
              return (
                <button
                  key={p.id}
                  onClick={() => handleOpenChat(p)}
                  className="w-full text-left rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] transition p-4 flex items-center gap-3 group"
                >
                  <div className="relative shrink-0">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      accent === 'blue' ? 'bg-blue-500/20' : accent === 'purple' ? 'bg-purple-500/20' : 'bg-emerald-500/20'
                    }`}>
                      <span className={`font-extrabold text-lg ${
                        accent === 'blue' ? 'text-blue-300' : accent === 'purple' ? 'text-purple-300' : 'text-emerald-300'
                      }`}>
                        {initial}
                      </span>
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#020617]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white truncate">{o.nome}</h3>
                      <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        accent === 'blue' ? 'bg-blue-500/20 text-blue-300' : accent === 'purple' ? 'bg-purple-500/20 text-purple-300' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {o.tipo}
                      </span>
                    </div>
                    {(o.cidade || o.estado) && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        {o.cidade}{o.estado ? `/${o.estado}` : ''}
                      </p>
                    )}
                    <p className="text-xs text-slate-600 mt-1 truncate">
                      <MessageCircle className="w-3 h-3 inline mr-1" />
                      Clique para conversar
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-slate-600">{timeAgo(p.created_at)}</p>
                    <div className="mt-1.5 w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <ChevronLeft className="w-3.5 h-3.5 text-emerald-400 rotate-180" />
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
