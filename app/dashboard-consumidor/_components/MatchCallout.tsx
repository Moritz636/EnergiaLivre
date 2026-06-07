'use client'

// ============================================================
// MatchCallout — Banner de "você está visível" (só quando há
// faturas elegíveis para match).
// ============================================================

import Link from 'next/link'
import { Heart, Sparkles } from 'lucide-react'

interface MatchCalloutProps {
  matchableCount: number
}

export function MatchCallout({ matchableCount }: MatchCalloutProps) {
  if (matchableCount === 0) return null

  return (
    <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-pink-500/15 to-amber-500/10 border border-pink-500/30 flex items-center gap-4 flex-wrap">
      <div
        className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center"
        aria-hidden
      >
        <Heart className="w-6 h-6 text-pink-300" />
      </div>
      <div className="flex-1 min-w-[200px]">
        <h3 className="text-base font-bold text-white">Você está visível para geradores próximos!</h3>
        <p className="text-sm text-slate-300">
          {matchableCount} {matchableCount === 1 ? 'fatura' : 'faturas'} com consumo ≥ 300 kWh.
          Geradores podem te encontrar no mapa e enviar propostas.
        </p>
      </div>
      <Link
        href="/dashboard/match"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-amber-500 hover:from-pink-400 text-slate-900 rounded-xl font-bold transition shadow-lg shadow-pink-500/20"
      >
        <Sparkles className="w-4 h-4" /> Ver matches
      </Link>
    </div>
  )
}
