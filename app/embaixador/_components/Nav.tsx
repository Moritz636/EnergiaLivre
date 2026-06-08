'use client'

// ============================================================
// Nav — Navbar superior da landing /embaixador
// ============================================================

import Link from 'next/link'
import { Zap, MessageCircle } from 'lucide-react'

interface NavProps {
  whatsappGroupUrl: string
}

export function Nav({ whatsappGroupUrl }: NavProps) {
  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-[#020617]/90 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="Página inicial">
          <div
            className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center"
            aria-hidden
          >
            <Zap className="text-slate-900 w-4 h-4 fill-current" />
          </div>
          <span className="text-base font-black text-white tracking-tight">EnergiaLivre</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="hidden sm:inline text-xs text-slate-300 hover:text-white transition"
          >
            Entrar
          </Link>
          <a
            href={whatsappGroupUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition flex items-center gap-1.5"
          >
            <MessageCircle className="w-3.5 h-3.5" /> Grupo
          </a>
          <a
            href="#cadastro"
            className="px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 text-xs font-bold hover:from-emerald-400 hover:to-cyan-400 transition"
          >
            Ser Parceiro
          </a>
        </div>
      </div>
    </nav>
  )
}
