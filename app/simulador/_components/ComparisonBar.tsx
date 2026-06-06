'use client'

// ============================================================
// ComparisonBar — Termômetro visual "antes/depois"
// ------------------------------------------------------------
// - Duas barras horizontais: referência (sem solar) e economia (com).
// - Animação de preenchimento conforme `value` muda (CSS transition).
// - Hover: brilha + ícones pulsam.
// - Acessível: role="img" + aria-label com valores.
// ============================================================

import { TrendingDown, Zap } from 'lucide-react'
import { formatBRL } from '../_utils/format'

interface ComparisonBarProps {
  gasto: number
  contaComEnergiaLivre: number
}

export default function ComparisonBar({
  gasto,
  contaComEnergiaLivre,
}: ComparisonBarProps) {
  // Normaliza o "antes" como 100% e o "depois" como fração
  const totalRef = Math.max(gasto, 1)
  const reducaoPct = Math.max(
    0,
    Math.min(100, ((gasto - contaComEnergiaLivre) / totalRef) * 100),
  )

  return (
    <div
      role="img"
      aria-label={`Comparativo: sem energia solar a fatura é R$ ${formatBRL(
        gasto,
      )} e com EnergiaLivre cai para R$ ${formatBRL(
        contaComEnergiaLivre,
      )}, uma redução de ${reducaoPct.toFixed(0)}%.`}
      className="relative rounded-2xl border border-white/5 bg-white/[0.02] p-5 md:p-6 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
          Sua fatura hoje vs. com EnergiaLivre
        </h3>
        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-2.5 py-1">
          −{reducaoPct.toFixed(0)}%
        </span>
      </div>

      <div className="space-y-5">
        {/* BARRA 1 — Sem energia solar */}
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="flex items-center gap-2 text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              Sem energia solar
            </span>
            <span className="font-bold text-slate-200 tabular-nums">
              R$ {formatBRL(gasto)}
            </span>
          </div>
          <div className="relative h-3 rounded-full bg-slate-800/70 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-slate-600 to-slate-500 transition-all duration-500 ease-out"
              style={{ width: '100%' }}
            />
            {/* Marcador */}
            <span
              className="absolute top-1/2 -translate-y-1/2 right-1 w-1.5 h-1.5 rounded-full bg-slate-300"
              aria-hidden
            />
          </div>
        </div>

        {/* BARRA 2 — Com EnergiaLivre */}
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="flex items-center gap-2 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Com EnergiaLivre
            </span>
            <span className="font-bold text-emerald-300 tabular-nums">
              R$ {formatBRL(contaComEnergiaLivre)}
            </span>
          </div>
          <div className="relative h-3 rounded-full bg-slate-800/70 overflow-visible">
            {/* Track "fantasma" tracejado mostrando quanto foi economizado */}
            <div
              className="absolute inset-y-0 left-0 rounded-full border border-dashed border-emerald-500/20"
              style={{ width: '100%' }}
              aria-hidden
            />
            {/* Preenchimento real */}
            <div
              className="relative h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${Math.max(8, 100 - reducaoPct)}%`,
                background:
                  'linear-gradient(90deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)',
                boxShadow: '0 0 16px rgba(16, 185, 129, 0.5)',
              }}
            >
              <span
                className="absolute inset-0 rounded-full opacity-60"
                style={{
                  background:
                    'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 2.4s linear infinite',
                }}
                aria-hidden
              />
            </div>

            {/* Marcador no final da barra */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-500 ease-out"
              style={{ left: `${Math.max(8, 100 - reducaoPct)}%` }}
            >
              <div className="relative">
                <Zap className="w-5 h-5 text-emerald-300 drop-shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer com seta de tendência */}
      <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">
        <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
        <span>
          Você deixa de pagar{' '}
          <strong className="text-emerald-300">
            R$ {formatBRL(gasto - contaComEnergiaLivre)}
          </strong>{' '}
          por mês — quase{' '}
          <strong className="text-emerald-300">
            {Math.round(reducaoPct / 12)} meses grátis/ano
          </strong>
          .
        </span>
      </div>
    </div>
  )
}
