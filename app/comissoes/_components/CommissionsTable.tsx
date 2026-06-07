'use client'

// ============================================================
// CommissionsTable — Tabela de comissões com loading/empty
// ============================================================

import { CheckCircle, Clock, XCircle, Eye, Share2, Download, RefreshCw } from 'lucide-react'
import { formatBRLDecimal, formatDate } from '../_utils/format'

export interface ComissaoItem {
  id: number
  valor_comissao: number
  percentual: number
  tipo_comissao: 'cadastro' | 'recorrente'
  status_pagamento: 'pendente' | 'pago' | 'cancelado'
  data_pagamento?: string | null
  profiles: { nome: string; email: string }
}

interface CommissionsTableProps {
  items: ComissaoItem[]
  loading: boolean
  onAction?: (id: number, action: 'view' | 'share' | 'download') => void
}

export function CommissionsTable({ items, loading, onAction }: CommissionsTableProps) {
  if (loading) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-yellow-500" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center text-slate-500">
        Nenhuma comissão encontrada
      </div>
    )
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-white/10 bg-white/5">
            <tr className="text-left text-slate-400 text-sm">
              <th className="p-4">Data</th>
              <th className="p-4">Cliente</th>
              <th className="p-4">Tipo</th>
              <th className="p-4">Valor</th>
              <th className="p-4">Status</th>
              <th className="p-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr
                key={c.id}
                className="border-b border-white/5 hover:bg-white/5 transition"
              >
                <td className="p-4 text-slate-500 text-sm">{formatDate(c.data_pagamento)}</td>
                <td className="p-4">
                  <div>
                    <div className="font-medium text-white">{c.profiles.nome}</div>
                    <div className="text-xs text-slate-400">{c.profiles.email}</div>
                  </div>
                </td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      c.tipo_comissao === 'cadastro'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}
                  >
                    {c.tipo_comissao === 'cadastro' ? '🎯 Cadastro' : '🔄 Recorrente'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="font-bold text-white">
                    R$ {formatBRLDecimal(c.valor_comissao)}
                  </div>
                  <div className="text-xs text-slate-400">{c.percentual}%</div>
                </td>
                <td className="p-4">
                  <StatusBadge status={c.status_pagamento} />
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <ActionButton
                      icon={<Eye className="w-4 h-4" />}
                      title="Detalhes"
                      onClick={() => onAction?.(c.id, 'view')}
                    />
                    <ActionButton
                      icon={<Share2 className="w-4 h-4" />}
                      title="Compartilhar"
                      onClick={() => onAction?.(c.id, 'share')}
                    />
                    <ActionButton
                      icon={<Download className="w-4 h-4" />}
                      title="Baixar extrato"
                      onClick={() => onAction?.(c.id, 'download')}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ============================================================
// Subcomponentes
// ============================================================

const STATUS_STYLES = {
  pago: { bg: 'bg-emerald-500/20 text-emerald-400', icon: <CheckCircle className="w-3 h-3" /> },
  pendente: { bg: 'bg-yellow-500/20 text-yellow-400', icon: <Clock className="w-3 h-3" /> },
  cancelado: { bg: 'bg-red-500/20 text-red-400', icon: <XCircle className="w-3 h-3" /> },
} as const

function StatusBadge({ status }: { status: 'pago' | 'pendente' | 'cancelado' }) {
  const style = STATUS_STYLES[status]
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${style.bg}`}
    >
      {style.icon} {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

function ActionButton({
  icon,
  title,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-lg bg-white/10 text-slate-400 hover:bg-white/20 transition"
      title={title}
      aria-label={title}
    >
      {icon}
    </button>
  )
}
