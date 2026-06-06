'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/app/hooks/useAuth'
import {
  Loader2,
  Inbox,
  Send,
  Heart,
  CheckCheck,
  X,
  MessageCircle,
  ArrowLeft,
  Check,
  Clock,
  Sparkles,
  Crown,
} from 'lucide-react'

type ProposalStatus = 'pending' | 'accepted' | 'rejected' | 'expired' | 'cancelled'
type Direction = 'received' | 'sent'

interface OtherUser {
  id: string
  nome: string
  tipo: 'consumidor' | 'gerador' | 'parceiro' | 'admin' | null
  cidade: string | null
  estado: string | null
  avatar_url: string | null
}

interface Proposal {
  id: number
  status: ProposalStatus
  message: string | null
  expires_at: string
  responded_at: string | null
  created_at: string
  direction: Direction
  other_user: OtherUser | null
}

interface Stats {
  received_pending: number
  sent_pending: number
  accepted: number
}

type Tab = 'received' | 'sent' | 'accepted'

const TABS: Array<{ value: Tab; label: string; icon: any }> = [
  { value: 'received', label: 'Recebidas', icon: Inbox },
  { value: 'sent', label: 'Enviadas', icon: Send },
  { value: 'accepted', label: 'Aceitas', icon: CheckCheck },
]

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

export default function PropostasPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('received')
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [stats, setStats] = useState<Stats>({ received_pending: 0, sent_pending: 0, accepted: 0 })
  const [loadingList, setLoadingList] = useState(true)
  const [actionId, setActionId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [openingChatId, setOpeningChatId] = useState<number | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?from=' + (profile?.tipo ?? 'consumidor'))
    }
  }, [user, loading, profile, router])

  const load = useCallback(async () => {
    if (!user) return
    setLoadingList(true)
    setError('')
    try {
      const res = await fetch(`/api/matches/list?direction=${tab}`)
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Erro ao listar')
      setProposals(body.proposals ?? [])
      if (body.stats) setStats(body.stats)
    } catch (err: any) {
      setError(err?.message || 'Erro ao carregar')
    } finally {
      setLoadingList(false)
    }
  }, [tab, user?.id])

  useEffect(() => {
    if (user) load()
  }, [tab, user?.id, load])

  const handleRespond = async (proposalId: number, response: 'accepted' | 'rejected') => {
    setActionId(proposalId)
    setError('')
    try {
      const res = await fetch('/api/matches/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposalId, response }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Erro ao responder')
      // Atualizar lista
      await load()
    } catch (err: any) {
      setError(err?.message || 'Erro ao responder')
    } finally {
      setActionId(null)
    }
  }

  // ============================================================
  // CHAT INTERNO → apenas para embaixadores (tipo=parceiro).
  // Consumidores/geradores caem no WhatsApp institucional.
  // ============================================================
  const handleOpenChat = async (matchId: number) => {
    setOpeningChatId(matchId)
    setError('')
    try {
      if (profile?.tipo === 'parceiro') {
        const res = await fetch(`/api/chat/or-with-match/${matchId}`)
        const body = await res.json()
        if (!res.ok) throw new Error(body.error || 'Erro ao abrir chat')
        router.push(`/dashboard/chat/${body.conversationId}`)
        return
      }
      // Demais perfis: atendimento via WhatsApp oficial
      const msg = encodeURIComponent(
        'Olá! Vim pelo EnergiaLivre e gostaria de falar sobre uma proposta aceita.',
      )
      window.open(`https://wa.me/5584987858668?text=${msg}`, '_blank', 'noopener')
    } catch (err: any) {
      setError(err?.message || 'Erro ao abrir conversa')
    } finally {
      setOpeningChatId(null)
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
      <nav className="fixed top-0 left-0 right-0 z-40 bg-[#020617]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
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
              <span className="text-xl font-black text-white">PROPOSTAS</span>
              <p className="text-[10px] text-slate-500 -mt-0.5">
                {stats.received_pending > 0
                  ? `${stats.received_pending} pendente${stats.received_pending > 1 ? 's' : ''}`
                  : 'Match direto, sem admin'}
              </p>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-20 pb-8 px-4 md:px-6 max-w-3xl mx-auto">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
          {/* Tabs */}
          <div className="grid grid-cols-3 border-b border-white/10">
            {TABS.map((t) => {
              const Icon = t.icon
              const active = tab === t.value
              const count =
                t.value === 'received'
                  ? stats.received_pending
                  : t.value === 'sent'
                    ? stats.sent_pending
                    : stats.accepted
              return (
                <button
                  key={t.value}
                  onClick={() => setTab(t.value)}
                  className={`relative flex items-center justify-center gap-1.5 py-3 text-xs sm:text-sm font-bold transition ${
                    active
                      ? 'text-emerald-300 bg-emerald-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.label}</span>
                  {count > 0 && (
                    <span
                      className={`ml-1 text-[10px] font-extrabold rounded-full px-1.5 py-0.5 ${
                        active
                          ? 'bg-emerald-500 text-[#020617]'
                          : 'bg-white/10 text-slate-300'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {error && (
            <div className="m-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Lista */}
          {loadingList ? (
            <div className="p-12 text-center">
              <Loader2 className="w-6 h-6 text-emerald-500 animate-spin mx-auto" />
            </div>
          ) : proposals.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              {tab === 'received' ? (
                <>
                  <Inbox className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                  <p className="text-sm">Nenhuma proposta recebida ainda</p>
                  <p className="text-xs mt-1 text-slate-600">
                    Vá em <Link href="/dashboard/match" className="text-emerald-400 hover:underline">Match</Link> e dê um &ldquo;Propor Match&rdquo; em alguém.
                  </p>
                </>
              ) : tab === 'sent' ? (
                <>
                  <Send className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                  <p className="text-sm">Nenhuma proposta enviada</p>
                </>
              ) : (
                <>
                  <CheckCheck className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                  <p className="text-sm">Nenhum match aceito ainda</p>
                  <p className="text-xs mt-1 text-slate-600">
                    Quando duas pessoas se curtirem mutuamente, o match vira aceito e o chat abre.
                  </p>
                </>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-white/5">
              {proposals.map((p) => (
                <ProposalCard
                  key={p.id}
                  proposal={p}
                  tab={tab}
                  onRespond={handleRespond}
                  onOpenChat={handleOpenChat}
                  loading={actionId === p.id}
                  openingChat={openingChatId === p.id}
                />
              ))}
            </ul>
          )}
        </div>

        <p className="text-center text-[11px] text-slate-600 mt-4">
          <Sparkles className="w-3 h-3 inline" /> Match direto: quando duas pessoas se curtem mutuamente, o match aceita sozinho e o chat libera na hora.
        </p>
      </main>
    </div>
  )
}

function ProposalCard({
  proposal,
  tab,
  onRespond,
  onOpenChat,
  loading,
  openingChat,
}: {
  proposal: Proposal
  tab: Tab
  onRespond: (id: number, response: 'accepted' | 'rejected') => void
  onOpenChat: (id: number) => void
  loading: boolean
  openingChat: boolean
}) {
  const o = proposal.other_user
  if (!o) {
    return (
      <li className="p-4 text-slate-500 text-sm">
        Proposta #{proposal.id} • usuário removido
      </li>
    )
  }
  const isGerador = o.tipo === 'gerador'
  const accent = isGerador ? 'blue' : 'emerald'
  const initial = (o.nome ?? 'U').charAt(0).toUpperCase()

  return (
    <li className="p-4">
      <div className="flex items-start gap-3">
        <div
          className={`w-12 h-12 rounded-2xl bg-${accent}-500/20 flex items-center justify-center shrink-0`}
        >
          <span className={`text-${accent}-300 font-extrabold text-lg`}>{initial}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-white truncate">{o.nome}</h3>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold bg-${accent}-500/20 text-${accent}-300 uppercase`}
            >
              {o.tipo}
            </span>
            <StatusBadge status={proposal.status} />
          </div>
          {(o.cidade || o.estado) && (
            <p className="text-xs text-slate-500 mt-0.5">
              {o.cidade}{o.estado ? `/${o.estado}` : ''}
            </p>
          )}
          {proposal.message && (
            <p className="text-sm text-slate-300 mt-2 italic line-clamp-2">
              &ldquo;{proposal.message}&rdquo;
            </p>
          )}
          <p className="text-[10px] text-slate-500 mt-1.5">
            <Clock className="w-3 h-3 inline" /> {timeAgo(proposal.created_at)}
          </p>

          {/* Acoes */}
          {tab === 'received' && proposal.status === 'pending' && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => onRespond(proposal.id, 'rejected')}
                disabled={loading}
                className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition disabled:opacity-50 flex items-center justify-center gap-1"
              >
                {loading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <X className="w-3 h-3" />
                )}
                Recusar
              </button>
              <button
                onClick={() => onRespond(proposal.id, 'accepted')}
                disabled={loading}
                className="flex-1 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-[#020617] text-xs font-bold transition disabled:opacity-50 flex items-center justify-center gap-1"
              >
                {loading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Check className="w-3 h-3" />
                )}
                Aceitar
              </button>
            </div>
          )}

          {tab === 'accepted' && proposal.status === 'accepted' && (
            <button
              onClick={() => onOpenChat(proposal.id)}
              disabled={openingChat}
              className="mt-3 w-full py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-[#020617] text-xs font-bold transition disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {openingChat ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" /> Abrindo...
                </>
              ) : (
                <>
                  <MessageCircle className="w-3 h-3" /> Abrir chat
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </li>
  )
}

function StatusBadge({ status }: { status: ProposalStatus }) {
  const map: Record<ProposalStatus, { label: string; cls: string }> = {
    pending: {
      label: 'Pendente',
      cls: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    },
    accepted: {
      label: 'Aceita',
      cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
    rejected: {
      label: 'Recusada',
      cls: 'bg-red-500/20 text-red-400 border-red-500/30',
    },
    expired: {
      label: 'Expirada',
      cls: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    },
    cancelled: {
      label: 'Cancelada',
      cls: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    },
  }
  const m = map[status]
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${m.cls}`}
    >
      {m.label}
    </span>
  )
}
