'use client'

// ============================================================
// DiferencialBadge — Selo "Sem investimento", "Sem obras" etc.
// ------------------------------------------------------------
// - Card com hover lift + tooltip explicativo.
// - Wrapper acessível: aria-describedby via Tooltip.
// ============================================================

import { type LucideIcon } from 'lucide-react'
import Tooltip from './Tooltip'

interface DiferencialBadgeProps {
  icon: LucideIcon
  label: string
  tooltip: string
}

export default function DiferencialBadge({
  icon: Icon,
  label,
  tooltip,
}: DiferencialBadgeProps) {
  return (
    <Tooltip content={tooltip} side="top">
      <div
        tabIndex={0}
        className="group relative flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/[0.025] border border-white/5 cursor-help transition-all duration-300 hover:bg-white/[0.05] hover:border-emerald-500/30 hover:-translate-y-0.5 focus-visible:bg-white/[0.05] focus-visible:border-emerald-500/30 focus-visible:-translate-y-0.5"
      >
        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
          <Icon className="w-3.5 h-3.5 text-emerald-400" strokeWidth={2.5} />
        </div>
        <span className="text-[11px] font-medium text-slate-300 group-hover:text-white transition-colors text-center leading-tight">
          {label}
        </span>
      </div>
    </Tooltip>
  )
}
