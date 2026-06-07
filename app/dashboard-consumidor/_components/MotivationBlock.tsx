'use client'

// ============================================================
// MotivationBlock — Faixa de incentivo (dias conectado + CO2)
// ============================================================

import { Award } from 'lucide-react'
import { formatNumber } from '../_utils/format'

interface MotivationBlockProps {
  diasConectado: number
  co2Total: number
}

export function MotivationBlock({ diasConectado, co2Total }: MotivationBlockProps) {
  return (
    <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-yellow-500/10 border border-emerald-500/20">
      <div className="flex items-center gap-3 mb-3">
        <Award className="w-6 h-6 text-emerald-400" />
        <h3 className="text-lg font-bold text-white">Continue assim!</h3>
      </div>
      <p className="text-slate-300">
        Você está conectado há{' '}
        <strong className="text-emerald-400">{diasConectado} dias</strong> e já evitou a
        emissão de{' '}
        <strong className="text-emerald-400">{formatNumber(co2Total)}kg de CO₂</strong>.
        Cada dia conta para um planeta mais limpo!
      </p>
    </div>
  )
}
