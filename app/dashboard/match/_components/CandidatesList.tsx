'use client'

import { useRef, useEffect, useState } from 'react'
import {
  Loader2, Search, MapPin, Zap, TrendingDown, Star,
  Send, X, Award, Sparkles, User as UserIcon, Building2,
} from 'lucide-react'
import type { MatchCandidateData } from '@/components/Match/SwipeCard'
import { formatDistance } from '../_utils/format'

interface CandidatesListProps {
  candidates: MatchCandidateData[]
  loading: boolean
  proposingId: string | null
  onPropose: (c: MatchCandidateData) => void
  onSkip: (c: MatchCandidateData) => void
}

export function CandidatesList({
  candidates, loading, proposingId, onPropose, onSkip,
}: CandidatesListProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    if (selectedId && !candidates.find(c => c.id === selectedId)) {
      setSelectedId(null)
    }
  }, [candidates, selectedId])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Buscando candidatos...</p>
        </div>
      </div>
    )
  }

  if (candidates.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-xs">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-500" />
          </div>
          <p className="text-slate-300 font-bold mb-1">Nenhum candidato por perto</p>
          <p className="text-slate-500 text-sm leading-relaxed">
            Aumente o raio de busca, mude o estado ou selecione outra distribuidora.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto pr-1 space-y-2" ref={listRef}>
      {candidates.map((c) => {
        const isSelected = selectedId === c.id
        const accent = c.tipo === 'gerador'
          ? { ring: 'border-blue-500/30', bg: 'bg-blue-500/10', text: 'text-blue-400', gradient: 'from-blue-500 to-blue-600' }
          : { ring: 'border-emerald-500/30', bg: 'bg-emerald-500/10', text: 'text-emerald-400', gradient: 'from-emerald-500 to-emerald-600' }
        const Icon = c.tipo === 'gerador' ? Building2 : UserIcon

        return (
          <div
            key={c.id}
            onClick={() => setSelectedId(isSelected ? null : c.id)}
            className={`group p-3 rounded-xl border transition-all cursor-pointer ${
              isSelected
                ? `bg-white/[0.04] ${accent.ring}`
                : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.04] hover:border-white/20'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl ${accent.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-5 h-5 ${accent.text}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm font-bold text-white truncate">{c.nome}</span>
                  {c.isMemberPlus && (
                    <span className="px-1 py-0.5 rounded text-[8px] font-black bg-yellow-500 text-slate-900 leading-none">PLUS</span>
                  )}
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${accent.bg} ${accent.text} uppercase leading-none`}>
                    {c.tipo}
                  </span>
                </div>
                {c.cidade && c.estado && (
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-2.5 h-2.5" /> {c.cidade}, {c.estado}
                  </p>
                )}
              </div>
              {c.distanciaKm != null && (
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-white">{Math.round(c.distanciaKm)} <span className="text-[10px] text-slate-400 font-normal">km</span></p>
                </div>
              )}
            </div>

            {/* Expandable details */}
            <div className={`grid transition-all duration-200 ${
              isSelected ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0'
            }`}>
              <div className="overflow-hidden">
                <div className="grid grid-cols-2 gap-1.5 mb-3">
                  {c.precoKwh != null && (
                    <div className="px-2 py-1.5 rounded-lg bg-blue-500/5 border border-blue-500/10">
                      <p className="text-[9px] text-blue-300 font-bold uppercase">Preço kWh</p>
                      <p className="text-xs font-bold text-blue-300">R$ {c.precoKwh.toFixed(4)}</p>
                    </div>
                  )}
                  {c.descontoPercentual != null && (
                    <div className="px-2 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                      <p className="text-[9px] text-emerald-300 font-bold uppercase">Desconto</p>
                      <p className="text-xs font-bold text-emerald-300">{c.descontoPercentual.toFixed(1)}%</p>
                    </div>
                  )}
                  {c.mediaAvaliacoes != null && c.totalAvaliacoes != null && c.totalAvaliacoes > 0 && (
                    <div className="px-2 py-1.5 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
                      <p className="text-[9px] text-yellow-300 font-bold uppercase">Avaliação</p>
                      <p className="text-xs font-bold text-yellow-300">{c.mediaAvaliacoes.toFixed(1)} <span className="text-[9px] text-slate-400">({c.totalAvaliacoes})</span></p>
                    </div>
                  )}
                  {c.rankingScore != null && (
                    <div className="px-2 py-1.5 rounded-lg bg-purple-500/5 border border-purple-500/10">
                      <p className="text-[9px] text-purple-300 font-bold uppercase">Score</p>
                      <p className="text-xs font-bold text-purple-300">{c.rankingScore.toFixed(0)}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-1.5">
                  <button
                    onClick={(e) => { e.stopPropagation(); onSkip(c) }}
                    disabled={proposingId === c.id}
                    className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-50 active:scale-95"
                  >
                    <X className="w-3 h-3" /> Pular
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onPropose(c) }}
                    disabled={proposingId === c.id}
                    className="flex-1 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-900 text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-lg shadow-emerald-500/20 active:scale-95"
                  >
                    {proposingId === c.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <><Send className="w-3 h-3" /> Conectar</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
