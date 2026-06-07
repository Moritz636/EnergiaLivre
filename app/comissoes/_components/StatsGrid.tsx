'use client'

// ============================================================
// StatsGrid — 4 KPIs (Pago / Pendente / Indicações / Meta)
// ============================================================

import { CheckCircle, Clock, Users, Target, ArrowUpRight } from 'lucide-react'
import { formatBRLDecimal } from '../_utils/format'

export interface Stats {
  totalPago: number
  totalPendente: number
  cadastrosMes: number
  recorrentesMes: number
  metaDescricao: string
  metaBonus: number
  metaCadastros: number
  cadastrosTotais: number
}

interface StatsGridProps {
  stats: Stats
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      <KpiCard
        tone="emerald"
        icon={<CheckCircle className="w-8 h-8 text-emerald-400" />}
        badge={{ text: 'Pago', className: 'bg-emerald-500/20 text-emerald-400' }}
        value={`R$ ${formatBRLDecimal(stats.totalPago)}`}
        caption="Comissões pagas"
        footer={
          <span className="text-emerald-400/80">
            <ArrowUpRight className="w-3 h-3 inline mr-1" /> +12% este mês
          </span>
        }
      />
      <KpiCard
        tone="yellow"
        icon={<Clock className="w-8 h-8 text-yellow-400" />}
        badge={{ text: 'Pendente', className: 'bg-yellow-500/20 text-yellow-400' }}
        value={`R$ ${formatBRLDecimal(stats.totalPendente)}`}
        caption="A receber"
        footer={<span className="text-yellow-400/80">Processando pagamento</span>}
      />
      <KpiCard
        tone="blue"
        icon={<Users className="w-8 h-8 text-blue-400" />}
        badge={{ text: 'Indicações', className: 'bg-blue-500/20 text-blue-400' }}
        value={String(stats.cadastrosTotais)}
        caption="Clientes indicados"
        footer={
          <span className="text-blue-400/80">
            {stats.cadastrosMes} novos este mês
          </span>
        }
      />
      <KpiCard
        tone="purple"
        icon={<Target className="w-8 h-8 text-purple-400" />}
        badge={{ text: 'Meta', className: 'bg-purple-500/20 text-purple-400' }}
        value={stats.metaDescricao}
        caption="Nível atual"
        footer={
          <span className="text-purple-400/80">
            R$ {formatBRLDecimal(stats.metaBonus)} de bônus
          </span>
        }
      />
    </div>
  )
}

// ============================================================
// KpiCard
// ============================================================

type Tone = 'emerald' | 'yellow' | 'blue' | 'purple'

const TONE_CLASSES: Record<Tone, string> = {
  emerald: 'from-emerald-500/10 to-green-500/5 border-emerald-500/30',
  yellow: 'from-yellow-500/10 to-amber-600/5 border-yellow-500/30',
  blue: 'from-blue-500/10 to-cyan-600/5 border-blue-500/30',
  purple: 'from-purple-500/10 to-pink-600/5 border-purple-500/30',
}

interface KpiCardProps {
  icon: React.ReactNode
  badge: { text: string; className: string }
  value: string
  caption: string
  footer?: React.ReactNode
  tone: Tone
}

function KpiCard({ icon, badge, value, caption, footer, tone }: KpiCardProps) {
  return (
    <div className={`p-6 rounded-2xl bg-gradient-to-br ${TONE_CLASSES[tone]} border`}>
      <div className="flex items-center justify-between mb-3">
        {icon}
        <span className={`text-[10px] px-2 py-0.5 rounded-full ${badge.className}`}>
          {badge.text}
        </span>
      </div>
      <div className="text-3xl font-bold text-white">{value}</div>
      <p className="text-slate-400 text-sm">{caption}</p>
      <div className="mt-3 text-[10px]">{footer}</div>
    </div>
  )
}
