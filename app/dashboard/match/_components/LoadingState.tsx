'use client'

// ============================================================
// LoadingState — Tela de carregamento padrão.
// ============================================================

import { Loader2 } from 'lucide-react'

export function LoadingState() {
  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" aria-hidden />
        <span className="text-xs text-slate-500 uppercase tracking-wider">
          Carregando match
        </span>
      </div>
    </div>
  )
}
