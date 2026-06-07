'use client'

// ============================================================
// LeadsList — Lista compacta dos últimos 5 leads capturados.
// Status colorido (aprovado=emerald, recusado=red, pendente=yellow).
// ============================================================

import { Users, Target } from 'lucide-react'
import { formatDate } from '../_utils/format'

export interface LeadItem {
  id: number | string
  nome: string
  cidade: string | null
  estado: string | null
  canal: string | null
  status: string
  created_at: string
}

interface LeadsListProps {
  leads: LeadItem[]
}

const STATUS_STYLES: Record<string, string> = {
  aprovado: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  recusado: 'bg-red-500/20 text-red-400 border-red-500/30',
  pendente: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
}

export function LeadsList({ leads }: LeadsListProps) {
  const hasLeads = leads.length > 0

  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Users className="w-5 h-5 text-emerald-400" />
        Leads recentes
      </h3>

      {!hasLeads ? (
        <div className="text-center py-6">
          <Target className="w-10 h-10 text-emerald-500 mx-auto mb-2" aria-hidden />
          <p className="text-slate-300 mb-1">Nenhum lead capturado ainda</p>
          <p className="text-xs text-slate-500">
            Indique pessoas pelo seu link para ver leads aqui.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {leads.map((lead) => (
            <li
              key={lead.id}
              className="flex items-center justify-between p-3 rounded-xl bg-white/5 gap-3"
            >
              <div className="min-w-0">
                <p className="text-white font-medium truncate">{lead.nome}</p>
                <p className="text-xs text-slate-500 truncate">
                  {lead.cidade}/{lead.estado} • {lead.canal || 'sem canal'} •{' '}
                  {formatDate(lead.created_at)}
                </p>
              </div>
              <span
                className={`shrink-0 text-[10px] font-bold uppercase px-2 py-1 rounded-full border ${
                  STATUS_STYLES[lead.status] ??
                  'bg-slate-500/20 text-slate-300 border-slate-500/30'
                }`}
              >
                {lead.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
