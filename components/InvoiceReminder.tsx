'use client'

import { useState, useEffect } from 'react'
import { getSupabase } from '@/lib/supabase/singleton'
import { Calendar, AlertTriangle, X } from 'lucide-react'
import Link from 'next/link'

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getDate().toString().padStart(2, '0')} de ${MONTHS[d.getMonth()]}`
}

interface InvoiceDue {
  id: number
  valor_total: number
  vencimento: string
}

export default function InvoiceReminder({ userId }: { userId: string }) {
  const [invoices, setInvoices] = useState<InvoiceDue[]>([])
  const [dismissed, setDismissed] = useState(false)
  const supabase = getSupabase()

  useEffect(() => {
    if (!userId) return
    const today = new Date().toISOString().split('T')[0]
    const threeDays = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]

    supabase
      .from('invoice_uploads')
      .select('id, valor_total, vencimento')
      .eq('user_id', userId)
      .eq('status', 'analyzed')
      .gte('vencimento', today)
      .lte('vencimento', threeDays)
      .order('vencimento', { ascending: true })
      .limit(5)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setInvoices(data as InvoiceDue[])
        }
      })
  }, [userId, supabase])

  if (dismissed || invoices.length === 0) return null

  const isUrgent = invoices.some((i) => {
    const diff = new Date(i.vencimento).getTime() - Date.now()
    return diff < 86400000
  })

  return (
    <div className={`mb-6 p-4 rounded-xl border ${
      isUrgent
        ? 'bg-red-500/10 border-red-500/30'
        : 'bg-amber-500/10 border-amber-500/30'
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {isUrgent ? (
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          ) : (
            <Calendar className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          )}
          <div>
            <p className={`text-sm font-semibold ${isUrgent ? 'text-red-300' : 'text-amber-300'}`}>
              {invoices.length === 1
                ? `${isUrgent ? '⚠️ Fatura vence hoje!' : `Fatura vence em breve`}`
                : `${invoices.length} faturas para vencer`}
            </p>
            <div className="mt-1 space-y-1">
              {invoices.map((inv) => (
                <Link
                  key={inv.id}
                  href={`/dashboard/faturas/${inv.id}`}
                  className="block text-xs text-slate-400 hover:text-white transition-colors"
                >
                  R$ {inv.valor_total.toFixed(2)} — vence {formatDate(inv.vencimento)}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded hover:bg-white/10 transition-colors text-slate-500 hover:text-white shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
