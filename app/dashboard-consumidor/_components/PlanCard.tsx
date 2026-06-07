'use client'

// ============================================================
// PlanCard — Card lateral com status do plano
// ============================================================

import Link from 'next/link'
import { Crown, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react'
import { formatDate } from '../_utils/format'

export interface PlanData {
  planoAtivo: boolean
  nomePlano: string
  proximaFatura: string | null
}

interface PlanCardProps {
  plan: PlanData
}

export function PlanCard({ plan }: PlanCardProps) {
  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Crown className="w-5 h-5 text-yellow-400" />
        Seu Plano
      </h3>

      {plan.planoAtivo ? (
        <ActivePlanBody plan={plan} />
      ) : (
        <EmptyPlanBody />
      )}
    </div>
  )
}

function ActivePlanBody({ plan }: { plan: PlanData }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-slate-400 text-sm">Plano</span>
        <span className="text-white font-bold">{plan.nomePlano}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-slate-400 text-sm">Status</span>
        <span className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
          Ativo
        </span>
      </div>
      {plan.proximaFatura && (
        <div className="flex justify-between items-center">
          <span className="text-slate-400 text-sm">Próxima fatura</span>
          <span className="text-white text-sm">{formatDate(plan.proximaFatura)}</span>
        </div>
      )}
      <Link
        href="/checkout"
        className="w-full mt-3 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition flex items-center justify-center gap-2"
      >
        Mudar Plano <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  )
}

function EmptyPlanBody() {
  return (
    <div className="text-center py-6">
      <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
      <p className="text-slate-300 mb-4">Você ainda não tem um plano ativo</p>
      <Link
        href="/checkout"
        className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-slate-900 rounded-xl font-bold hover:bg-emerald-400 transition"
      >
        <Sparkles className="w-4 h-4" />
        Escolher Plano
      </Link>
    </div>
  )
}
