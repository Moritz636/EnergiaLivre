'use client'

import { useEffect, useState } from 'react'
import { getSupabase } from '@/lib/supabase/singleton'
import { ArrowLeft, Users, MoreVertical, Loader2 } from 'lucide-react'
import type { ConversationRecord } from '@/lib/chat'

interface ChatHeaderProps {
  conversationId: string
  onBack?: () => void
}

export default function ChatHeader({ conversationId, onBack }: ChatHeaderProps) {
  const supabase = getSupabase()
  const [conv, setConv] = useState<ConversationRecord | null>(null)
  const [otherNames, setOtherNames] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const { data: c } = await supabase
          .from('conversations')
          .select('*')
          .eq('id', conversationId)
          .single()
        if (!mounted) return
        if (c) setConv(c as unknown as ConversationRecord)

        const { data: members } = await supabase
          .from('conversation_members')
          .select('user_id, profiles!inner(nome)')
          .eq('conversation_id', conversationId)

        if (!mounted) return
        const names = (members ?? [])
          .map((m: any) => m.profiles?.nome)
          .filter(Boolean) as string[]
        setOtherNames(names)
      } catch {
        // ok
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId])

  if (loading) {
    return (
      <div className="flex items-center gap-3 p-4 border-b border-white/10 h-16">
        <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />
      </div>
    )
  }

  const isGroup = conv?.is_group
  const displayName = isGroup
    ? conv?.name ?? 'Grupo'
    : otherNames[0] ?? 'Usuário'

  return (
    <div className="flex items-center gap-3 p-4 border-b border-white/10">
      {onBack && (
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg hover:bg-white/10 transition shrink-0"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-5 h-5 text-slate-300" />
        </button>
      )}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${
          isGroup
            ? 'bg-purple-500/30 text-purple-200'
            : 'bg-emerald-500/30 text-emerald-200'
        }`}
      >
        {isGroup ? <Users className="w-5 h-5" /> : displayName.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-white truncate">{displayName}</h3>
        {isGroup && otherNames.length > 0 && (
          <p className="text-[11px] text-slate-500 truncate">
            {otherNames.slice(0, 3).join(', ')}
            {otherNames.length > 3 ? ` +${otherNames.length - 3}` : ''}
          </p>
        )}
      </div>
      <button
        className="p-1.5 rounded-lg hover:bg-white/10 transition shrink-0"
        aria-label="Mais opções"
        title="Em breve"
      >
        <MoreVertical className="w-4 h-4 text-slate-500" />
      </button>
    </div>
  )
}
