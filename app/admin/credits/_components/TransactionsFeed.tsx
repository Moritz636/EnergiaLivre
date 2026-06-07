'use client'

// ============================================================
// TransactionsFeed — Feed das últimas transações (admin)
// ============================================================

import { Activity } from 'lucide-react'
import { formatBRL, formatDateTime } from '../_utils/format'

export interface TransactionRow {
  id: string
  amount: number
  type: string
  status: string
  description: string | null
  created_at: string
  profiles?: { nome?: string; email?: string } | null
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  purchase: { label: 'Compra', color: 'text-emerald-400 bg-emerald-500/10' },
  commission: { label: 'Comissão', color: 'text-yellow-400 bg-yellow-500/10' },
  refund: { label: 'Estorno', color: 'text-cyan-400 bg-cyan-500/10' },
  admin_credit: { label: 'Admin +', color: 'text-emerald-400 bg-emerald-500/10' },
  admin_debit: { label: 'Admin -', color: 'text-red-400 bg-red-500/10' },
  payment: { label: 'Pagamento', color: 'text-slate-300 bg-slate-500/10' },
  transfer_in: { label: 'Transf. in', color: 'text-cyan-400 bg-cyan-500/10' },
  transfer_out: { label: 'Transf. out', color: 'text-orange-400 bg-orange-500/10' },
  bonus: { label: 'Bônus', color: 'text-purple-400 bg-purple-500/10' },
  cashback: { label: 'Cashback', color: 'text-pink-400 bg-pink-500/10' },
}

interface TransactionsFeedProps {
  transactions: TransactionRow[]
  loading: boolean
}

export function TransactionsFeed({ transactions, loading }: TransactionsFeedProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-white/10 flex items-center gap-2">
        <Activity className="w-4 h-4 text-emerald-400" />
        <h3 className="text-sm font-bold text-white">Últimas transações</h3>
        <span className="ml-auto text-xs text-slate-400">{transactions.length}</span>
      </div>

      <div className="max-h-[480px] overflow-y-auto">
        {loading ? (
          <div className="p-6 text-center text-slate-500 text-sm">Carregando...</div>
        ) : transactions.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-sm">
            Nenhuma transação ainda
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            {transactions.map((t) => {
              const meta = TYPE_LABELS[t.type] ?? {
                label: t.type,
                color: 'text-slate-300 bg-slate-500/10',
              }
              const positive = t.amount > 0
              return (
                <li key={t.id} className="p-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${meta.color}`}
                      >
                        {meta.label}
                      </span>
                      {t.profiles?.nome && (
                        <span className="text-xs text-slate-300 truncate">
                          {t.profiles.nome}
                        </span>
                      )}
                    </div>
                    {t.description && (
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">
                        {t.description}
                      </p>
                    )}
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {formatDateTime(t.created_at)}
                    </p>
                  </div>
                  <span
                    className={`font-black text-sm ${
                      positive ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {positive ? '+' : ''}R$ {formatBRL(Math.abs(t.amount))}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
