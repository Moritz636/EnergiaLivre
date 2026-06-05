'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '@/lib/supabase/singleton'
import { useAuth } from '@/app/hooks/useAuth'
import { listConversations, subscribeToConversations } from '@/lib/chat'
import type { ConversationWithMeta } from '@/lib/chat'
import { formatDistanceToNow } from '@/lib/date'
import {
  Loader2,
  MessageCircle,
  Plus,
  Users,
  Search,
  ArrowLeft,
  CheckCheck,
  Image as ImageIcon,
  FileText,
} from 'lucide-react'

interface ChatListProps {
  activeId?: string
  onSelect?: (id: string) => void
  showBackButton?: boolean
  onCreateGroup?: () => void
}

export default function ChatList({
  activeId,
  onSelect,
  showBackButton = false,
  onCreateGroup,
}: ChatListProps) {
  const { user, profile } = useAuth()
  const router = useRouter()
  const supabase = getSupabase()
  const [conversations, setConversations] = useState<ConversationWithMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const load = async () => {
    if (!user) return
    try {
      setError('')
      const list = await listConversations(supabase, user.id)
      setConversations(list)
    } catch (err: any) {
      setError(err?.message || 'Erro ao carregar conversas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) return
    load()
    const unsub = subscribeToConversations(supabase, user.id, () => load())
    return () => unsub()
  }, [user?.id])

  const filtered = useMemo(() => {
    if (!search.trim()) return conversations
    const q = search.toLowerCase()
    return conversations.filter((c) => {
      if (c.name?.toLowerCase().includes(q)) return true
      if (c.last_message_preview?.toLowerCase().includes(q)) return true
      return c.other_members.some((m) => m.nome?.toLowerCase().includes(q))
    })
  }, [conversations, search])

  const handleSelect = (id: string) => {
    if (onSelect) onSelect(id)
    else router.push(`/dashboard/chat/${id}`)
  }

  if (!user) {
    return (
      <div className="p-6 text-center text-slate-400">
        Faça login para acessar o chat.
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 p-4 border-b border-white/10">
        <div className="flex items-center gap-2 min-w-0">
          {showBackButton && (
            <button
              onClick={() => router.back()}
              className="p-1.5 rounded-lg hover:bg-white/10 transition shrink-0"
              aria-label="Voltar"
            >
              <ArrowLeft className="w-5 h-5 text-slate-300" />
            </button>
          )}
          <MessageCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <h2 className="text-lg font-bold text-white truncate">Conversas</h2>
        </div>
        {onCreateGroup && (
          <button
            onClick={onCreateGroup}
            className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition shrink-0"
            aria-label="Novo grupo"
            title="Criar grupo"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Busca */}
      <div className="p-3 border-b border-white/10">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar conversa ou pessoa..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-6 h-6 text-emerald-500 animate-spin mx-auto" />
          </div>
        ) : error ? (
          <div className="p-4 m-3 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-300">
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <MessageCircle className="w-10 h-10 mx-auto mb-2 text-slate-600" />
            <p className="text-sm">
              {search
                ? 'Nenhuma conversa encontrada'
                : 'Nenhuma conversa ainda. Inicie um match para começar!'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            {filtered.map((c) => {
              const isActive = c.id === activeId
              const isGroup = c.is_group
              const displayName = isGroup
                ? c.name ?? 'Grupo'
                : c.other_members[0]?.nome ?? 'Usuário'
              const lastTime = c.last_message_at
                ? formatDistanceToNow(c.last_message_at)
                : ''

              return (
                <li key={c.id}>
                  <button
                    onClick={() => handleSelect(c.id)}
                    className={`w-full flex items-center gap-3 p-3 text-left transition ${
                      isActive
                        ? 'bg-emerald-500/15 border-l-2 border-emerald-400'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-sm ${
                        isGroup
                          ? 'bg-purple-500/30 text-purple-200'
                          : 'bg-emerald-500/30 text-emerald-200'
                      }`}
                    >
                      {isGroup ? (
                        <Users className="w-5 h-5" />
                      ) : (
                        displayName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-white truncate">
                          {displayName}
                        </p>
                        <span className="text-[10px] text-slate-500 shrink-0">
                          {lastTime}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <p className="text-xs text-slate-400 truncate">
                          {c.last_message_preview ?? 'Sem mensagens'}
                        </p>
                        {c.unread_count > 0 && (
                          <span className="bg-emerald-500 text-[#020617] text-[10px] font-extrabold rounded-full px-1.5 py-0.5 min-w-[18px] text-center shrink-0">
                            {c.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
