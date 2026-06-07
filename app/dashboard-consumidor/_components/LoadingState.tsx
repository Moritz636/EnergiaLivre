'use client'

// ============================================================
// LoadingState — Spinner inicial
// ============================================================

import { Loader2 } from 'lucide-react'

export function LoadingState() {
  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        <span className="text-xs text-slate-500 uppercase tracking-wider">
          Carregando dashboard
        </span>
      </div>
    </div>
  )
}
