'use client'

// ============================================================
// ResultCard — Cartão de resultado premium
// ------------------------------------------------------------
// - Hover: lift (-translate-y) + borda iluminada (gradient).
// - Valor: bump animation ao atualizar.
// - Variant: 'primary' (emerald) | 'neutral' (slate) | 'warning' (amber).
// ============================================================

import { useEffect, useState, type ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

export type ResultCardVariant = 'primary' | 'neutral' | 'warning'

interface ResultCardProps {
  label: string
  value: ReactNode
  /** Pequeno texto abaixo do valor */
  caption?: ReactNode
  icon?: LucideIcon
  variant?: ResultCardVariant
  /** Classe extra para customização pontual */
  className?: string
  /** Se true, o valor faz pulse animation a cada update */
  highlightValue?: boolean
}

const variantStyles: Record<
  ResultCardVariant,
  { card: string; value: string; iconBox: string; icon: string }
> = {
  primary: {
    card: 'border-gradient-emerald bg-gradient-to-br from-emerald-500/[0.08] to-emerald-600/[0.02]',
    value: 'text-gradient-emerald glow-text-emerald',
    iconBox: 'bg-emerald-500/10 border-emerald-500/30',
    icon: 'text-emerald-400',
  },
  neutral: {
    card: 'border-gradient-soft bg-white/[0.025]',
    value: 'text-white',
    iconBox: 'bg-white/5 border-white/10',
    icon: 'text-slate-300',
  },
  warning: {
    card: 'border-gradient-soft bg-gradient-to-br from-amber-500/[0.06] to-amber-600/[0.02]',
    value: 'text-amber-300',
    iconBox: 'bg-amber-500/10 border-amber-500/30',
    icon: 'text-amber-400',
  },
}

export default function ResultCard({
  label,
  value,
  caption,
  icon: Icon,
  variant = 'neutral',
  className = '',
  highlightValue = true,
}: ResultCardProps) {
  const [pulse, setPulse] = useState(false)
  const styles = variantStyles[variant]

  // Dispara pulse a cada troca de `value` (string/number)
  useEffect(() => {
    if (!highlightValue) return
    setPulse(true)
    const t = setTimeout(() => setPulse(false), 320)
    return () => clearTimeout(t)
  }, [value, highlightValue])

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl p-5 md:p-6 transition-all duration-300 ease-out will-change-transform hover:-translate-y-1 hover:shadow-glow-emerald ${styles.card} ${className}`}
    >
      {/* Brilho no hover */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background:
            'radial-gradient(ellipse 60% 80% at 50% 0%, rgba(16,185,129,0.12), transparent 70%)',
        }}
        aria-hidden
      />

      <div className="relative flex items-start justify-between gap-3 mb-2">
        <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">
          {label}
        </p>
        {Icon && (
          <div
            className={`w-8 h-8 shrink-0 rounded-lg border flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${styles.iconBox}`}
          >
            <Icon className={`w-4 h-4 ${styles.icon}`} strokeWidth={2.25} />
          </div>
        )}
      </div>

      <p
        className={`relative text-3xl md:text-4xl font-black tabular-nums ${styles.value} ${
          pulse ? 'animate-value-bump' : ''
        }`}
      >
        {value}
      </p>

      {caption && (
        <p className="relative mt-1.5 text-xs text-slate-500 leading-relaxed">
          {caption}
        </p>
      )}
    </div>
  )
}
