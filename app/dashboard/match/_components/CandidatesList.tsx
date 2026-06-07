'use client'

// ============================================================
// CandidatesList — Lista de SwipeCards com estados
// (loading/empty/ready).
// ============================================================

import { Loader2, Search } from 'lucide-react'
import SwipeCard, { type MatchCandidateData } from '@/components/Match/SwipeCard'

interface CandidatesListProps {
  candidates: MatchCandidateData[]
  loading: boolean
  proposingId: string | null
  onPropose: (c: MatchCandidateData) => void
  onSkip: (c: MatchCandidateData) => void
}

export function CandidatesList({
  candidates,
  loading,
  proposingId,
  onPropose,
  onSkip,
}: CandidatesListProps) {
  if (loading) {
    return (
      <div className="p-12 text-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-3" />
        <p className="text-slate-400">Buscando candidatos...</p>
      </div>
    )
  }

  if (candidates.length === 0) {
    return (
      <div className="p-12 text-center rounded-2xl bg-white/5 border border-white/10">
        <Search className="w-12 h-12 text-slate-500 mx-auto mb-3" />
        <p className="text-slate-300 font-bold mb-1">Nenhum candidato por perto</p>
        <p className="text-slate-500 text-sm">
          Tente aumentar o raio de busca ou salvar sua localização.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {candidates.map((c) => (
        <SwipeCard
          key={c.id}
          candidate={c}
          onPropose={onPropose}
          onSkip={onSkip}
          loading={proposingId === c.id}
        />
      ))}
    </div>
  )
}
