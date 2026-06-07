'use client'

// ============================================================
// SummaryStats — 4 KPIs (Total usuários com saldo / Saldo total
// distribuído / Transações / Última atividade)
// ============================================================

import { Users, Wallet, Activity, Clock } from 'lucide-react'
import { formatBRL, formatDateTime } from '../_utils/format'

export interface Summary {
  totalUsers: number
  totalBalance: number
  totalTransactions: number
  lastActivityAt: string | null
  pendingRequests: number
}

interface SummaryStatsProps {
  summary: Summary
}

export function SummaryStats({ summary }: SummaryStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <StatCard
        tone="emerald"
        icon={<Users className="w-4 h-4" />}
        label="Usuários com saldo"
        value={String(summary.totalUsers)}
      />
      <StatCard
        tone="cyan"
        icon={<Wallet className="w-4 h-4" />}
        label="Saldo total"
        value={`R$ ${formatBRL(summary.totalBalance)}`}
        highlight
      />
      <StatCard
        tone={summary.pendingRequests > 0 ? 'yellow' : 'neutral'}
        icon={<Activity className="w-4 h-4" />}
        label="Solicitações pendentes"
        value={String(summary.pendingRequests)}
        pulse={summary.pendingRequests > 0}
      />
      <StatCard
        tone="neutral"
        icon={<Clock className="w-4 h-4" />}
        label="Última atividade"
        value={formatDateTime(summary.lastActivityAt)}
        small
      />
    </div>
  )
}

type Tone = 'emerald' | 'cyan' | 'yellow' | 'neutral'

const TONE_CLASSES: Record<Tone, string> = {
  emerald: 'border-emerald-500/30 text-emerald-300',
  cyan: 'border-cyan-500/30 text-cyan-300',
  yellow: 'border-yellow-500/30 text-yellow-300',
  neutral: 'border-white/10 text-slate-300',
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string
  tone?: Tone
  highlight?: boolean
  small?: boolean
  pulse?: boolean
}

function StatCard({ icon, label, value, tone = 'neutral', highlight, small, pulse }: StatCardProps) {
  return (
    <div
      className={`relative p-4 rounded-2xl bg-white/5 border ${TONE_CLASSES[tone]} ${
        highlight ? 'shadow-lg shadow-cyan-500/10' : ''
      }`}
    >
      {pulse && (
        <span className="absolute top-2 right-2 flex h-2 w-2" aria-hidden>
          <span className="absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75 animate-ping" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-400" />
        </span>
      )}
      <div className="flex items-center gap-1.5 mb-1.5">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <p
        className={`font-black text-white ${small ? 'text-sm' : 'text-2xl'} ${
          small ? 'leading-tight' : ''
        }`}
      >
        {value}
      </p>
    </div>
  )
}
