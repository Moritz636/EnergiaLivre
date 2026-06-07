'use client'

// ============================================================
// GoalProgress — Barra de progresso premium da meta mensal.
// Mostra % e mensagem contextual (meta batida / quanto falta).
// ============================================================

import { Award } from 'lucide-react'

interface GoalProgressProps {
  indicadosMes: number
  meta: number
}

export function GoalProgress({ indicadosMes, meta }: GoalProgressProps) {
  const progresso = Math.min((indicadosMes / meta) * 100, 100)
  const bateu = indicadosMes >= meta
  const faltam = Math.max(meta - indicadosMes, 0)

  return (
    <div
      className="p-6 rounded-2xl bg-gradient-to-r from-yellow-500/10 to-emerald-500/5 border border-yellow-500/30 mb-8"
      role="region"
      aria-label="Progresso da meta mensal"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Award className="w-5 h-5 text-yellow-400" aria-hidden />
          <h3 className="text-lg font-bold text-white">
            Meta mensal: {indicadosMes} / {meta}
          </h3>
        </div>
        <span
          className="text-sm text-yellow-400 font-bold"
          aria-label={`${Math.round(progresso)} por cento da meta`}
        >
          {Math.round(progresso)}%
        </span>
      </div>

      <div
        className="w-full h-3 bg-slate-800 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(progresso)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-gradient-to-r from-yellow-500 to-emerald-500 transition-all duration-700 ease-out"
          style={{ width: `${progresso}%` }}
        />
      </div>

      {bateu ? (
        <p className="text-xs text-emerald-400 mt-2">
          🎉 Meta batida! Continue assim para o próximo nível.
        </p>
      ) : (
        <p className="text-xs text-slate-500 mt-2">
          Faltam {faltam} {faltam === 1 ? 'indicado' : 'indicados'} para bater a meta do mês.
        </p>
      )}
    </div>
  )
}
