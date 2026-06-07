'use client'

// ============================================================
// MetricsGrid — 4 KPIs (Economia Mensal / kWh / CO2 / Arvores)
// ============================================================

import { DollarSign, Zap, Leaf, Globe } from 'lucide-react'
import { formatNumber } from '../_utils/format'

export interface Metrics {
  economiaMensal: number
  kwhEconomizados: number
  co2Evitado: number
  arvoresSalvas: number
  percentualEconomia: number
}

export const EMPTY_METRICS: Metrics = {
  economiaMensal: 0,
  kwhEconomizados: 0,
  co2Evitado: 0,
  arvoresSalvas: 0,
  percentualEconomia: 0,
}

interface MetricsGridProps {
  metrics: Metrics
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <KpiCard
        tone="emerald"
        icon={<DollarSign className="w-4 h-4" />}
        label="Economia Mensal"
        value={`R$ ${formatNumber(metrics.economiaMensal)}`}
        caption={`↓ ${metrics.percentualEconomia}% na fatura`}
        captionTone="emerald"
        highlight
      />
      <KpiCard
        tone="neutral"
        icon={<Zap className="w-4 h-4" />}
        iconColor="text-yellow-400"
        label="kWh Economizados"
        value={formatNumber(metrics.kwhEconomizados)}
        caption="por mês"
      />
      <KpiCard
        tone="neutral"
        icon={<Leaf className="w-4 h-4" />}
        iconColor="text-green-400"
        label="CO₂ Evitado"
        value={formatNumber(metrics.co2Evitado)}
        caption="kg por mês"
      />
      <KpiCard
        tone="neutral"
        icon={<Globe className="w-4 h-4" />}
        iconColor="text-emerald-400"
        label="Árvores Salvas"
        value={String(metrics.arvoresSalvas)}
        caption="equivalentes"
      />
    </div>
  )
}

// ============================================================
// KpiCard
// ============================================================

type Tone = 'emerald' | 'neutral'

interface KpiCardProps {
  icon: React.ReactNode
  iconColor?: string
  label: string
  value: string
  caption: string
  captionTone?: 'emerald' | 'slate'
  tone?: Tone
  highlight?: boolean
}

const TONE_CLASSES: Record<Tone, string> = {
  emerald: 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 border-emerald-500/30',
  neutral: 'bg-white/5 border-white/10',
}

function KpiCard({
  icon,
  iconColor = 'text-emerald-400',
  label,
  value,
  caption,
  captionTone = 'slate',
  tone = 'neutral',
  highlight,
}: KpiCardProps) {
  return (
    <div
      className={`p-6 rounded-2xl ${TONE_CLASSES[tone]} border ${
        highlight ? 'shadow-lg shadow-emerald-500/10' : ''
      }`}
    >
      <div className={`flex items-center gap-2 ${iconColor} mb-2`}>
        {icon}
        <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-3xl font-black text-white">{value}</p>
      <p
        className={`text-xs mt-1 ${
          captionTone === 'emerald' ? 'text-emerald-300' : 'text-slate-400'
        }`}
      >
        {caption}
      </p>
    </div>
  )
}
