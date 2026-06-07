'use client'

// ============================================================
// CommissionsList — Lista compacta das últimas 5 comissões.
// Status coloridos (pago=emerald, pendente=yellow, cancelado=red).
// ============================================================

import Link from 'next/link'
import { DollarSign, Crown, ArrowRight } from 'lucide-react'
import { formatBRLDecimal, formatDate } from '../_utils/format'

export interface ComissaoItem {
  id: number | string
  valor_comissao: number | string | null
  percentual: number | null
  status_pagamento: string
  tipo_comissao: string
  created_at: string
}

interface CommissionsListProps {
  comissoes: ComissaoItem[]
}

const STATUS_STYLES: Record<string, string> = {
  pago: 'text-emerald-400',
  pendente: 'text-yellow-400',
  cancelado: 'text-red-400',
}

const TIPO_LABELS: Record<string, string> = {
  cadastro: 'Comissão de cadastro',
  recorrente: 'Comissão recorrente',
}

export function CommissionsList({ comissoes }: CommissionsListProps) {
  const hasComissoes = comissoes.length > 0

  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-yellow-400" />
        Comissões recentes
      </h3>

      {!hasComissoes ? (
        <div className="text-center py-6">
          <Crown className="w-10 h-10 text-yellow-500 mx-auto mb-2" aria-hidden />
          <p className="text-slate-300 mb-1">Nenhuma comissão ainda</p>
          <p className="text-xs text-slate-500">Compartilhe seu link para começar a ganhar.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {comissoes.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between p-3 rounded-xl bg-white/5"
            >
              <div>
                <p className="text-white text-sm font-medium">
                  {TIPO_LABELS[c.tipo_comissao] ?? c.tipo_comissao}
                </p>
                <p className="text-xs text-slate-500">
                  {c.percentual}% • {formatDate(c.created_at)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-emerald-400 font-bold">
                  R$ {formatBRLDecimal(c.valor_comissao ?? 0)}
                </p>
                <span
                  className={`text-[10px] font-bold uppercase ${
                    STATUS_STYLES[c.status_pagamento] ?? 'text-slate-400'
                  }`}
                >
                  {c.status_pagamento}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/comissoes"
        className="mt-3 inline-flex items-center gap-1 text-xs text-yellow-400 hover:text-yellow-300 transition"
      >
        Ver todas as comissões <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  )
}
