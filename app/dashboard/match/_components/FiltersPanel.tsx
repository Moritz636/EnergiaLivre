'use client'

// ============================================================
// FiltersPanel — Sidebar com 3 modos (Perto/Estado/Distribuidora),
// seletor de tipo de alvo (gerador/consumidor) e slider de raio.
// ============================================================

import { Sliders, MapPin, Globe2, Zap, Check } from 'lucide-react'
import type { MatchMode } from '@/lib/matches'
import { DISTRIBUIDORAS, getDistribuidorasPorEstado, type Distribuidora } from '@/lib/distribuidoras'

type TargetTipo = 'gerador' | 'consumidor'

interface FiltersPanelProps {
  matchMode: MatchMode
  onMatchModeChange: (mode: MatchMode) => void
  targetTipo: TargetTipo
  onTargetTipoChange: (tipo: TargetTipo) => void
  radiusKm: number
  onRadiusKmChange: (km: number) => void
  myEstado: string
  distribuidoraFilter: string
  onDistribuidoraFilterChange: (nome: string) => void
}

const MATCH_MODES: Array<{ value: MatchMode; label: string; icon: typeof MapPin; desc: string }> = [
  { value: 'radius', label: 'Perto', icon: MapPin, desc: 'Por distância (km)' },
  { value: 'state', label: 'Estado', icon: Globe2, desc: 'Mesma UF' },
  { value: 'distributor', label: 'Distribuidora', icon: Zap, desc: 'Mesma rede' },
]

const TARGET_TIPO_OPTIONS: Array<{ value: TargetTipo; label: string }> = [
  { value: 'gerador', label: 'Geradores' },
  { value: 'consumidor', label: 'Consumidores' },
]

const RADIUS_OPTIONS = [25, 50, 100, 250, 500]

export function FiltersPanel({
  matchMode,
  onMatchModeChange,
  targetTipo,
  onTargetTipoChange,
  radiusKm,
  onRadiusKmChange,
  myEstado,
  distribuidoraFilter,
  onDistribuidoraFilterChange,
}: FiltersPanelProps) {
  return (
    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
      <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-1.5">
        <Sliders className="w-4 h-4" /> Filtros
      </h3>

      <div className="mb-4">
        <p className="text-xs text-slate-500 mb-1.5">Modo de busca</p>
        <div className="grid grid-cols-3 gap-1">
          {MATCH_MODES.map((m) => {
            const Icon = m.icon
            return (
              <button
                key={m.value}
                onClick={() => {
                  onMatchModeChange(m.value)
                  if (m.value === 'distributor' && myEstado && !distribuidoraFilter) {
                    const sugestoes = getDistribuidorasPorEstado(myEstado)
                    if (sugestoes[0]) onDistribuidoraFilterChange(sugestoes[0].nome)
                  }
                }}
                title={m.desc}
                className={`px-2 py-2 rounded-lg text-[10px] font-bold transition flex flex-col items-center gap-1 ${
                  matchMode === m.value
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {m.label}
              </button>
            )
          })}
        </div>
        {matchMode === 'state' && !myEstado && (
          <p className="text-[10px] text-amber-300 mt-1.5">
            Defina sua localização para usar este modo.
          </p>
        )}
        {matchMode === 'distributor' && !distribuidoraFilter && (
          <p className="text-[10px] text-amber-300 mt-1.5">
            Escolha uma distribuidora abaixo.
          </p>
        )}
      </div>

      {matchMode === 'distributor' && (
        <div className="mb-3">
          <p className="text-xs text-slate-500 mb-1.5">Distribuidora</p>
          <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
            {DISTRIBUIDORAS.map((d: Distribuidora) => (
              <button
                key={d.codigo}
                onClick={() => onDistribuidoraFilterChange(d.nome)}
                className={`w-full px-2 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-between gap-2 ${
                  distribuidoraFilter === d.nome
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-transparent'
                }`}
              >
                <span className="flex flex-col items-start min-w-0">
                  <span className="truncate">{d.nome}</span>
                  <span className="text-[9px] text-slate-500 font-normal">
                    {d.estados.join(', ')} • {d.market_share}% share
                  </span>
                </span>
                {distribuidoraFilter === d.nome && <Check className="w-3.5 h-3.5 shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mb-3">
        <p className="text-xs text-slate-500 mb-1.5">Buscar</p>
        <div className="grid grid-cols-2 gap-1">
          {TARGET_TIPO_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onTargetTipoChange(opt.value)}
              className={`px-2 py-1.5 rounded-lg text-xs font-bold transition ${
                targetTipo === opt.value
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-transparent'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {matchMode === 'radius' && (
        <div>
          <p className="text-xs text-slate-500 mb-1.5">
            Raio: <strong className="text-white">{radiusKm} km</strong>
          </p>
          <div className="flex flex-wrap gap-1">
            {RADIUS_OPTIONS.map((r) => (
              <button
                key={r}
                onClick={() => onRadiusKmChange(r)}
                className={`px-2 py-1 rounded text-xs font-bold transition ${
                  radiusKm === r
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                {r}km
              </button>
            ))}
          </div>
        </div>
      )}

      {matchMode === 'state' && myEstado && (
        <p className="text-xs text-emerald-300 mt-1">
          Buscando em <strong className="text-white">{myEstado}</strong> (todas as distâncias)
        </p>
      )}

      {matchMode === 'distributor' && distribuidoraFilter && (
        <p className="text-xs text-emerald-300 mt-1">
          Mesma rede: <strong className="text-white">{distribuidoraFilter}</strong>
        </p>
      )}
    </div>
  )
}
