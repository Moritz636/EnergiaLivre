'use client'

import { Crown, Users, Map as MapIcon, Navigation, TrendingUp } from 'lucide-react'

type View = 'cards' | 'map'

interface HeaderProps {
  daysRemaining: number
  view: View
  onViewChange: (view: View) => void
  totalCandidates: number
  avgDistance?: number | null
  avgSavings?: number | null
}

export function Header({
  daysRemaining, view, onViewChange,
  totalCandidates, avgDistance, avgSavings,
}: HeaderProps) {
  return (
    <div className="mb-6">
      {/* Title row */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            <Crown className="w-6 h-6 text-yellow-400" />
            Match Geolocalizado
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            {daysRemaining > 0
              ? `Member Plus ativo · ${daysRemaining} ${daysRemaining === 1 ? 'dia restante' : 'dias restantes'}`
              : 'Member Plus ativo'}
          </p>
        </div>
        <div className="flex items-center gap-2" role="tablist" aria-label="Modo de visualização">
          <button
            role="tab"
            aria-selected={view === 'cards'}
            onClick={() => onViewChange('cards')}
            className={`px-3 py-2 rounded-lg flex items-center gap-1.5 text-sm font-bold transition ${
              view === 'cards'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-transparent'
            }`}
          >
            <Users className="w-4 h-4" /> Cards
          </button>
          <button
            role="tab"
            aria-selected={view === 'map'}
            onClick={() => onViewChange('map')}
            className={`px-3 py-2 rounded-lg flex items-center gap-1.5 text-sm font-bold transition ${
              view === 'map'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-transparent'
            }`}
          >
            <MapIcon className="w-4 h-4" /> Mapa
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase font-bold mb-1">
            <Users className="w-3 h-3" /> Candidatos
          </div>
          <p className="text-xl font-black text-white">{totalCandidates}</p>
        </div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase font-bold mb-1">
            <Navigation className="w-3 h-3" /> Dist. média
          </div>
          <p className="text-xl font-black text-white">
            {avgDistance != null ? `${Math.round(avgDistance)} km` : '—'}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase font-bold mb-1">
            <TrendingUp className="w-3 h-3" /> Desconto médio
          </div>
          <p className="text-xl font-black text-emerald-400">
            {avgSavings != null ? `${avgSavings.toFixed(1)}%` : '—'}
          </p>
        </div>
      </div>
    </div>
  )
}
