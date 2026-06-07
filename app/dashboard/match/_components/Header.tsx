'use client'

// ============================================================
// Header — Título + status do Member Plus + toggle Cards/Mapa
// ============================================================

import { Crown, List, Map as MapIcon } from 'lucide-react'

type View = 'cards' | 'map'

interface HeaderProps {
  daysRemaining: number
  view: View
  onViewChange: (view: View) => void
}

export function Header({ daysRemaining, view, onViewChange }: HeaderProps) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <Crown className="w-7 h-7 text-yellow-400" />
          Match Geolocalizado
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {daysRemaining > 0
            ? `Member Plus ativo • ${daysRemaining} ${daysRemaining === 1 ? 'dia restante' : 'dias restantes'}`
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
          <List className="w-4 h-4" /> Cards
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
  )
}
