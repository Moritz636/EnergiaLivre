'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/app/hooks/useAuth'
import ChatList from '@/components/Chat/ChatList'
import CreateGroupModal from '@/components/Chat/CreateGroupModal'
import { ArrowLeft, MessageCircle, ShieldCheck } from 'lucide-react'

// ============================================================
// CHAT — Exclusivo do Parceiro (modelo Hinode)
// ------------------------------------------------------------
// O chat serve ao parceiro para:
//   • Conversar com seus assinantes / indicados.
//   • Coordenar transferências de moedas e tokens.
//   • Planejar divulgações e materiais de campanha.
//
// Consumidores e geradores NÃO têm acesso — quem precisa de
// suporte abre o WhatsApp da EnergiaLivre (canal público).
// ============================================================

export default function ChatIndexPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [accessChecked, setAccessChecked] = useState(false)

  // 1) Se não logado → /login (preservando fluxo original)
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?from=parceiro')
    }
  }, [user, loading, router])

  // 2) Após carregar, valida o tipo do perfil
  useEffect(() => {
    if (loading || !user || !profile) return
    const isEmbaixador =
      profile.tipo === 'parceiro' || (profile as any).role === 'admin'
    if (!isEmbaixador) {
      // Consumidor / gerador são redirecionados ao dashboard deles.
      const target =
        profile.tipo === 'gerador'
          ? '/dashboard-gerador'
          : '/dashboard-consumidor'
      router.replace(target)
      return
    }
    setAccessChecked(true)
  }, [loading, user, profile, router])

  if (loading || !user || !accessChecked) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-slate-400">
        Carregando...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
      <nav className="fixed top-0 left-0 right-0 z-40 bg-[#020617]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/embaixador/dashboard"
              className="p-1.5 rounded-lg hover:bg-white/10 transition"
              aria-label="Voltar ao painel do parceiro"
            >
              <ArrowLeft className="w-5 h-5 text-slate-300" />
            </Link>
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <MessageCircle className="text-emerald-400 w-4 h-4" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xl font-black text-white">CHAT</span>
              <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5" />
                Parceiro
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-20 pb-6 px-4 md:px-6 max-w-3xl mx-auto">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden h-[calc(100vh-7rem)]">
          <ChatList onCreateGroup={() => setShowCreateGroup(true)} />
        </div>
      </main>

      {showCreateGroup && (
        <CreateGroupModal
          onClose={() => setShowCreateGroup(false)}
          onCreated={(id) => {
            setShowCreateGroup(false)
            router.push(`/dashboard/chat/${id}`)
          }}
        />
      )}
    </div>
  )
}
