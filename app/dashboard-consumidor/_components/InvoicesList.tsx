'use client'

// ============================================================
// InvoicesList — Lista compacta de faturas
// ============================================================

import Link from 'next/link'
import { FileText, MapPin, Plus, Scan, Loader2 } from 'lucide-react'
import { formatNumber, formatBRLDecimal } from '../_utils/format'

export interface InvoiceItem {
  id: number | string
  concessionaria?: string | null
  kwh_mensal?: number | null
  valor_total?: number | string | null
  match_eligible?: boolean | null
}

interface InvoicesListProps {
  invoices: InvoiceItem[]
  loading: boolean
}

export function InvoicesList({ invoices, loading }: InvoicesListProps) {
  const totalKwh = invoices.reduce((s, inv) => s + (inv.kwh_mensal ?? 0), 0)

  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-cyan-400" />
          Suas Faturas
        </h3>
        <Link href="/dashboard/faturas" className="text-xs text-emerald-400 hover:underline">
          Ver todas
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
        </div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-6">
          <Scan className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-400 mb-3">Nenhuma fatura cadastrada</p>
          <Link
            href="/dashboard/faturas/scan"
            className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:underline"
          >
            <Plus className="w-3 h-3" /> Escanear primeira
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {invoices.map((inv) => (
            <li key={inv.id}>
              <Link
                href={`/dashboard/faturas/${inv.id}`}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      inv.match_eligible ? 'bg-emerald-500/20' : 'bg-white/5'
                    }`}
                  >
                    <FileText
                      className={`w-4 h-4 ${
                        inv.match_eligible ? 'text-emerald-300' : 'text-slate-400'
                      }`}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-white font-medium truncate">
                      {inv.concessionaria || 'Fatura'}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {inv.kwh_mensal ? `${inv.kwh_mensal} kWh` : '—'} ·{' '}
                      {inv.valor_total
                        ? `R$ ${formatBRLDecimal(inv.valor_total)}`
                        : '—'}
                    </p>
                  </div>
                </div>
                {inv.match_eligible && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] text-emerald-300 font-bold flex items-center gap-1 shrink-0">
                    <MapPin className="w-2.5 h-2.5" /> Match
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {totalKwh > 0 && (
        <p className="text-[10px] text-slate-500 mt-3">
          Consumo total cadastrado:{' '}
          <strong className="text-white">{formatNumber(totalKwh)} kWh</strong>
        </p>
      )}
    </div>
  )
}
