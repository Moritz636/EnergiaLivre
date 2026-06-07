'use client'

// ============================================================
// MetricsGrid — 4 cards de KPI: Total Ganho, Pago, Indicados,
// Conversão. Animação leve de entrada com stagger.
// ============================================================

import { DollarSign, TrendingUp, Users, Target } from 'lucide-react'
import Stagger from '@/app/simulador/_components/Stagger'
import { formatBRLDecimal, formatBRL, plural } from '../_utils/format'

export interface Metrics {
  totalEstimado: number
  totalPago: number
  indicadosMes: number
  leadsCount: number
  aprovadosCount: number
}

interface MetricsGridProps {
  metrics: Metrics
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  const taxaConversao =
    metrics.leadsCount > 0
      ? Math.round((metrics.aprovadosCount / metrics.leadsCount) * 100)
      : 0

  return (
    <Stagger className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <MetricCard
        tone="emerald"
        icon={<DollarSign className="w-4 h-4" />}
        label="Total Ganho"
        value={`R$ ${formatBRL(metrics.totalEstimado)}`}
        caption="pago + pendente"
        highlight
      />
      <MetricCard
        tone="yellow"
        icon={<TrendingUp className="w-4 h-4" />}
        label="Pago"
        value={`R$ ${formatBRLDecimal(metrics.totalPago)}`}
        caption="já recebido"
      />
      <MetricCard
        tone="cyan"
        icon={<Users className="w-4 h-4" />}
        label="Indicados"
        value={String(metrics.indicadosMes)}
        caption="este mês"
      />
      <MetricCard
        tone="emerald"
        icon={<Target className="w-4 h-4" />}
        label="Conversão"
        value={
          <>
            {taxaConversao}
            <span className="text-base text-emerald-400">%</span>
          </>
        }
        caption={`${metrics.aprovadosCount} de ${metrics.leadsCount} ${plural(metrics.leadsCount, 'lead')}`}
      />
    </Stagger>
  )
}

// ============================================================
// MetricCard — Card premium de KPI com 4 tons (emerald/yellow/cyan/neutral)
// ============================================================

type Tone = 'emerald' | 'yellow' | 'cyan' | 'neutral'

interface MetricCardProps {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
  caption: string
  tone?: Tone
  highlight?: boolean
}

const TONE_CLASSES: Record<Tone, { wrap: string; label: string }> = {
  emerald: {
    wrap: 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 border border-emerald-500/30',
    label: 'text-emerald-400',
  },
  yellow: {
    wrap: 'bg-white/5 border border-white/10',
    label: 'text-yellow-400',
  },
  cyan: {
    wrap: 'bg-white/5 border border-white/10',
    label: 'text-cyan-400',
  },
  neutral: {
    wrap: 'bg-white/5 border border-white/10',
    label: 'text-slate-400',
  },
}

function MetricCard({ icon, label, value, caption, tone = 'yellow', highlight }: MetricCardProps) {
  const classes = TONE_CLASSES[tone]

  return (
    <div
      className={`p-6 rounded-2xl ${classes.wrap} ${
        highlight ? 'shadow-lg shadow-emerald-500/10' : ''
      } transition hover:scale-[1.02] hover:shadow-xl`}
    >
      <div className={`flex items-center gap-2 ${classes.label} mb-2`}>
        {icon}
        <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-3xl font-black text-white">{value}</p>
      <p className="text-xs text-slate-400 mt-1">{caption}</p>
    </div>
  )
}
