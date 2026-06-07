'use client'

// ============================================================
// AccessDenied — Bloqueio para não-admin
// ============================================================

import { Sparkles } from 'lucide-react'

export function AccessDenied() {
  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-8 text-center">
        <Sparkles className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Acesso Restrito</h1>
        <p className="text-slate-400">
          Você não tem permissão para acessar o painel de comissões.
        </p>
      </div>
    </div>
  )
}
