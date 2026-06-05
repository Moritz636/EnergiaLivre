'use client'

import { useState, useEffect } from 'react'
import { getSupabase } from '@/lib/supabase/singleton'
import { searchUsers, createGroupConversation } from '@/lib/chat'
import { X, Search, Users, Loader2, Check } from 'lucide-react'
import { useAuth } from '@/app/hooks/useAuth'

interface CreateGroupModalProps {
  onClose: () => void
  onCreated: (conversationId: string) => void
}

export default function CreateGroupModal({ onClose, onCreated }: CreateGroupModalProps) {
  const { user } = useAuth()
  const supabase = getSupabase()
  const [name, setName] = useState('')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Array<{ id: string; nome: string; tipo: string; cidade: string | null }>>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [searching, setSearching] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([])
      return
    }
    let mounted = true
    setSearching(true)
    const t = setTimeout(async () => {
      try {
        const exclude = user ? [user.id] : []
        const list = await searchUsers(supabase, query, exclude, 15)
        if (mounted) setResults(list)
      } catch (err) {
        // ok
      } finally {
        if (mounted) setSearching(false)
      }
    }, 300)
    return () => {
      mounted = false
      clearTimeout(t)
    }
  }, [query, user?.id])

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleCreate = async () => {
    if (!user) return
    if (!name.trim()) {
      setError('Nome do grupo é obrigatório')
      return
    }
    if (selected.size < 1) {
      setError('Selecione pelo menos 1 membro')
      return
    }
    setCreating(true)
    setError('')
    try {
      const convId = await createGroupConversation(supabase, {
        name: name.trim(),
        createdBy: user.id,
        memberIds: Array.from(selected),
      })
      onCreated(convId)
    } catch (err: any) {
      setError(err?.message || 'Erro ao criar grupo')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#0a0f1f] border border-white/10 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            Criar Grupo
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10"
            aria-label="Fechar"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">
              Nome do grupo
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Time de match SP"
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5">
              Adicionar membros ({selected.size} selecionado{selected.size === 1 ? '' : 's'})
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nome..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            {searching && (
              <div className="mt-2 text-center">
                <Loader2 className="w-4 h-4 text-slate-500 animate-spin inline" />
              </div>
            )}
            {results.length > 0 && (
              <ul className="mt-2 max-h-48 overflow-y-auto rounded-lg bg-white/5 border border-white/10">
                {results.map((u) => {
                  const isSel = selected.has(u.id)
                  return (
                    <li key={u.id}>
                      <button
                        onClick={() => toggle(u.id)}
                        className="w-full flex items-center gap-2 p-2 text-left hover:bg-white/5"
                      >
                        <div className="w-8 h-8 rounded-full bg-emerald-500/30 text-emerald-200 flex items-center justify-center text-xs font-bold shrink-0">
                          {u.nome.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{u.nome}</p>
                          <p className="text-[10px] text-slate-500">
                            {u.tipo} {u.cidade ? `• ${u.cidade}` : ''}
                          </p>
                        </div>
                        {isSel && <Check className="w-4 h-4 text-emerald-400" />}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {error && (
            <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300">
              {error}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 p-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="flex-1 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-[#020617] text-sm font-bold transition disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {creating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Criando...
              </>
            ) : (
              'Criar grupo'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
