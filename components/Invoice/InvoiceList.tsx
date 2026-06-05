'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FileText, Loader2, Calendar, MapPin, Zap, DollarSign, CheckCircle2, XCircle, Search } from 'lucide-react'
import { getSupabase } from '@/lib/supabase/singleton'

interface InvoiceRecord {
  id: string
  file_name: string
  file_url: string
  file_type: string | null
  status: 'pending' | 'analyzing' | 'analyzed' | 'matching' | 'matched' | 'failed'
  estado: string | null
  concessionaria: string | null
  valor_total: number | null
  kwh_mensal: number | null
  vencimento: string | null
  match_count: number | null
  created_at: string
  analyzed_at: string | null
  matched_at: string | null
  cliente_nome: string | null
}

const STATUS_LABEL: Record<InvoiceRecord['status'], { label: string; cls: string }> = {
  pending: { label: 'Pendente', cls: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  analyzing: { label: 'Analisando...', cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  analyzed: { label: 'Analisada', cls: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  matching: { label: 'Buscando geradores...', cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  matched: { label: 'Matches enviados', cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  failed: { label: 'Falhou', cls: 'bg-red-500/20 text-red-400 border-red-500/30' },
}

export default function InvoiceList() {
  const supabase = getSupabase()
  const [items, setItems] = useState<InvoiceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const res = await fetch('/api/invoices')
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Erro ao listar')
      setItems(body.invoices ?? [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="w-6 h-6 text-emerald-500 animate-spin mx-auto" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-300">
        {error}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="p-12 text-center rounded-2xl bg-white/5 border border-white/10">
        <FileText className="w-12 h-12 text-slate-500 mx-auto mb-3" />
        <p className="text-slate-300 font-bold mb-1">Nenhuma fatura enviada ainda</p>
        <p className="text-slate-500 text-sm mb-4">
          Envie sua fatura de energia para identificar estado, concessionária e valor automaticamente.
        </p>
        <Link
          href="/dashboard/faturas/upload"
          className="inline-block px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-[#020617] font-bold text-sm transition"
        >
          Enviar primeira fatura
        </Link>
      </div>
    )
  }

  return (
    <ul className="space-y-3">
      {items.map((inv) => {
        const st = STATUS_LABEL[inv.status]
        return (
          <li
            key={inv.id}
            className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition"
          >
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-emerald-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-white truncate">{inv.file_name}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${st.cls}`}>
                      {st.label}
                    </span>
                  </div>
                  {inv.cliente_nome && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      Cliente: <span className="text-slate-300">{inv.cliente_nome}</span>
                    </p>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-xs">
                    {inv.estado && (
                      <div>
                        <p className="text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> Estado
                        </p>
                        <p className="text-white font-bold">{inv.estado}</p>
                      </div>
                    )}
                    {inv.concessionaria && (
                      <div>
                        <p className="text-slate-500">Concessionária</p>
                        <p className="text-white font-bold truncate">{inv.concessionaria}</p>
                      </div>
                    )}
                    {inv.kwh_mensal != null && (
                      <div>
                        <p className="text-slate-500 flex items-center gap-1">
                          <Zap className="w-3 h-3" /> kWh/mês
                        </p>
                        <p className="text-white font-bold">{inv.kwh_mensal}</p>
                      </div>
                    )}
                    {inv.valor_total != null && (
                      <div>
                        <p className="text-slate-500 flex items-center gap-1">
                          <DollarSign className="w-3 h-3" /> Valor
                        </p>
                        <p className="text-emerald-400 font-bold">
                          R$ {inv.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    )}
                  </div>

                  {inv.status === 'matched' && (inv.match_count ?? 0) > 0 && (
                    <p className="text-[11px] text-emerald-300 mt-2 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {inv.match_count} proposta{inv.match_count === 1 ? '' : 's'} de match enviada{inv.match_count === 1 ? '' : 's'} para geradores
                    </p>
                  )}
                </div>
              </div>

              <Link
                href={`/dashboard/faturas/${inv.id}`}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition shrink-0"
              >
                Ver detalhes
              </Link>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
