'use client'

// ============================================================
// Nav — Navbar do consumidor
// ============================================================

import Link from 'next/link'
import { Zap, LogOut, Heart, FileText, MessageCircle } from 'lucide-react'
import NotificationBell from '@/components/NotificationBell'

interface NavProps {
  userName?: string | null
  onLogout: () => void
}

export function Nav({ userName, onLogout }: NavProps) {
  return (
    <nav className="border-b border-white/10 bg-[#020617]/90 backdrop-blur-xl fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-emerald-400 rounded-lg flex items-center justify-center"
            aria-hidden
          >
            <Zap className="text-slate-900 w-4 h-4 fill-current" />
          </div>
          <span className="text-xl font-black text-white">
            ENERGIA<span className="text-emerald-500">LIVRE</span>
          </span>
          <div className="ml-3 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[9px] font-black text-emerald-400 uppercase tracking-wider">
            Consumidor
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <span className="text-sm text-slate-400 hidden md:block">
            Olá, <span className="text-white font-medium">{userName || 'Usuário'}</span>
          </span>
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
          <a
            href={`https://wa.me/5584987858668?text=${encodeURIComponent('Olá! Preciso de ajuda com a EnergiaLivre.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-300 hover:text-emerald-400 transition"
            title="Suporte via WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden md:inline">Suporte</span>
          </a>
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
