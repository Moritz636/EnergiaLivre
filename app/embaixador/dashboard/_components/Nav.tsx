'use client'

// ============================================================
// Nav — Barra de navegação superior do painel do parceiro.
// Inclui brand, badge "EMBAIXADOR", saudação e ações rápidas.
// ============================================================

import Link from 'next/link'
import {
  Zap,
  LogOut,
  DollarSign,
  Heart,
  FileText,
  Send,
  MessageCircle,
} from 'lucide-react'
import NotificationBell from '@/components/NotificationBell'

interface NavProfile {
  nome?: string | null
}

interface NavProps {
  profile: NavProfile | null
  onLogout: () => void
}

export function Nav({ profile, onLogout }: NavProps) {
  return (
    <nav className="border-b border-white/10 bg-[#020617]/90 backdrop-blur-xl fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-yellow-400 rounded-lg flex items-center justify-center"
            aria-hidden
          >
            <Zap className="text-slate-900 w-4 h-4 fill-current" />
          </div>
          <span className="text-xl font-black text-white">
            ENERGIA<span className="text-emerald-500">LIVRE</span>
          </span>
          <div className="ml-3 px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-[9px] font-black text-yellow-400 uppercase tracking-wider">
            Parceiro
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <span className="text-sm text-slate-400 hidden md:block">
            Olá, <span className="text-white font-medium">{profile?.nome || 'Parceiro'}</span>
          </span>

          <Link
            href="/comissoes"
            className="hidden lg:inline-flex items-center gap-1 text-xs text-yellow-400 hover:text-yellow-300 transition"
            aria-label="Minhas comissões"
          >
            <DollarSign className="w-3 h-3" /> Comissões
          </Link>

          <Link
            href="/dashboard/propostas"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm text-slate-300 hover:text-pink-400 transition"
          >
            <Heart className="w-4 h-4" />
            <span className="hidden md:inline">Propostas</span>
          </Link>

          <Link
            href="/dashboard/faturas"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm text-slate-300 hover:text-cyan-400 transition"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden md:inline">Faturas</span>
          </Link>

          <Link
            href="/embaixador/propostas"
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-300 hover:text-emerald-400 transition"
            title="Enviar proposta em PDF"
          >
            <Send className="w-4 h-4" />
            <span className="hidden md:inline">Propostas</span>
          </Link>

          <Link
            href="/dashboard/chat"
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-300 hover:text-emerald-400 transition"
            title="Chat interno (exclusivo parceiro)"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden md:inline">Chat</span>
          </Link>

          <NotificationBell />

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-400 hover:text-white transition"
            aria-label="Sair"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Sair</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
