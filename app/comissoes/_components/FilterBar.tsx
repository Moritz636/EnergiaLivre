'use client'

// ============================================================
// FilterBar — Seletor de mês/ano + botão atualizar
// ============================================================

import { Calendar, RefreshCw } from 'lucide-react'
import { monthName } from '../_utils/format'

interface FilterBarProps {
  mes: number
  ano: number
  onMesChange: (m: number) => void
  onAnoChange: (a: number) => void
  loading: boolean
  onRefresh: () => void
}

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)
const YEARS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

export function FilterBar({
  mes,
  ano,
  onMesChange,
  onAnoChange,
  loading,
  onRefresh,
}: FilterBarProps) {
  return (
    <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" aria-hidden />
          <select
            value={mes}
            onChange={(e) => onMesChange(parseInt(e.target.value))}
            aria-label="Mês"
            className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none"
          >
            {MONTHS.map((m) => (
              <option key={m} value={m}>
                {monthName(m)}
              </option>
            ))}
          </select>
        </div>
        <select
          value={ano}
          onChange={(e) => onAnoChange(parseInt(e.target.value))}
          aria-label="Ano"
          className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none"
        >
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={onRefresh}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/10 rounded-lg hover:bg-white/20 transition disabled:opacity-50"
      >
        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        Atualizar
      </button>
    </div>
  )
}
