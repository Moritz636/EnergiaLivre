'use client'

// ============================================================
// MemberPlusCta — CTA para abrir o Match (só quando não há
// faturas elegíveis).
// ============================================================

import Link from 'next/link'
import { Crown, Sparkles, ArrowRight } from 'lucide-react'

export function MemberPlusCta() {
  return (
    <div className="mt-6 p-6 rounded-2xl bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 flex items-center gap-4 flex-wrap">
      <Crown className="w-8 h-8 text-yellow-400 shrink-0" />
      <div className="flex-1 min-w-[200px]">
        <h3 className="text-lg font-bold text-white">Conecte-se a geradores próximos</h3>
        <p className="text-slate-300 text-sm">
          Com o Member Plus, você vê no mapa quem está gerando energia limpa perto de você e
          propõe conexões diretas.
        </p>
      </div>
      <Link
        href="/dashboard/match"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-900 rounded-xl font-bold transition shadow-lg shadow-yellow-500/20"
      >
        <Sparkles className="w-4 h-4" /> Abrir Match
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  )
}
