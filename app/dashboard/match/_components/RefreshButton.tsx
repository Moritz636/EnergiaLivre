'use client'

// ============================================================
// RefreshButton — Botão padronizado de "Atualizar lista" com
// estado de loading.
// ============================================================

import { RefreshCcw } from 'lucide-react'

interface RefreshButtonProps {
  onClick: () => void
  loading: boolean
}

export function RefreshButton({ onClick, loading }: RefreshButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-bold transition flex items-center justify-center gap-2 disabled:opacity-50"
    >
      <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
      Atualizar lista
    </button>
  )
}
