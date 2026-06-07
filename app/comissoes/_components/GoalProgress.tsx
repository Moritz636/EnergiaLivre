'use client'

// ============================================================
// GoalProgress — Barra de progresso da meta com nível
// ============================================================

import { BarChart3, CheckCircle } from 'lucide-react'

interface GoalProgressProps {
  atuais: number
  meta: number
}

export function GoalProgress({ atuais, meta }: GoalProgressProps) {
  const progresso = Math.min((atuais / meta) * 100, 100)
  const bateu = progresso >= 100
  const faltam = Math.max(meta - atuais, 0)

  return (
    <div
      className="mb-10 p-6 rounded-2xl bg-white/5 border border-white/10"
      role="region"
      aria-label="Progresso da meta"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-bold text-white">Progresso da Meta</h3>
        </div>
        <div className="text-sm text-slate-400">
          {atuais} / {meta} clientes
        </div>
      </div>

      <div
        className="mb-4"
        role="progressbar"
        aria-valuenow={Math.round(progresso)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-green-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${progresso}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-400">
          {bateu ? (
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> Meta atingida!
            </span>
          ) : (
            `Faltam ${faltam} clientes`
          )}
        </div>
        <div className="text-sm font-bold text-emerald-400">
          {progresso.toFixed(1)}%
        </div>
      </div>
    </div>
  )
}
