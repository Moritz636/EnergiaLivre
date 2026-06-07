'use client'

// ============================================================
// Nav — Header da página de comissões (admin)
// ============================================================

import Link from 'next/link'
import { DollarSign } from 'lucide-react'

interface NavProps {
  userName?: string | null
}

export function Nav({ userName }: NavProps) {
  return (
    <nav className="border-b border-white/10 bg-[#020617]/90 backdrop-blur-xl fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-lg flex items-center justify-center"
            aria-hidden
          >
            <DollarSign className="text-white w-4 h-4" />
          </div>
          <span className="text-xl font-bold text-white">
            ENERGIA<span className="text-yellow-500">LIVRE</span>
          </span>
          <div className="ml-3 px-2 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-[9px] font-black text-yellow-400 uppercase tracking-wider">
            Embaixador
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-sm text-slate-400">
            <span>{userName}</span>
          </div>
          <Link
            href="/dashboard"
            className="text-slate-400 hover:text-yellow-400 transition"
          >
            Voltar
          </Link>
        </div>
      </div>
    </nav>
  )
}
