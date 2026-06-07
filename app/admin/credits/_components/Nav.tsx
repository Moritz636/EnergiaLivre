'use client'

// ============================================================
// Nav — Header do admin de créditos
// ============================================================

import Link from 'next/link'
import { Coins, ArrowLeft, LogOut, Shield } from 'lucide-react'

interface NavProps {
  userName?: string | null
  onLogout: () => void
}

export function Nav({ userName, onLogout }: NavProps) {
  return (
    <nav className="border-b border-white/10 bg-[#020617]/90 backdrop-blur-xl fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/dashboard"
            className="p-1.5 rounded-lg hover:bg-white/10 transition"
            aria-label="Voltar ao dashboard admin"
          >
            <ArrowLeft className="w-5 h-5 text-slate-300" />
          </Link>
          <div
            className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center"
            aria-hidden
          >
            <Coins className="text-slate-900 w-4 h-4" />
          </div>
          <div>
            <span className="text-base font-black text-white tracking-tight">
              ENERGIA<span className="text-emerald-400">LIVRE</span>
            </span>
            <div className="flex items-center gap-1 -mt-0.5">
              <Shield className="w-2.5 h-2.5 text-emerald-400" />
              <span className="text-[9px] font-black text-emerald-300 uppercase tracking-wider">
                Admin · Créditos
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400 hidden md:block">
            {userName || 'Administrador'}
          </span>
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
