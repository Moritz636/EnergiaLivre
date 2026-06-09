'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/app/hooks/useAuth'
import { getSupabase } from '@/lib/supabase/singleton'
import InvoiceAnalysis from '@/components/Invoice/InvoiceAnalysis'
import { ArrowLeft, FileText, Loader2, ExternalLink, MapPin, Zap, DollarSign } from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function FaturaDetailPage({ params }: PageProps) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const supabase = getSupabase()
  const [invoiceId, setInvoiceId] = useState<string | null>(null)
  const [invoice, setInvoice] = useState<any>(null)
  const [loadingInv, setLoadingInv] = useState(true)

  useEffect(() => {
    params.then((p) => setInvoiceId(p.id))
  }, [params])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?from=' + (profile?.tipo ?? 'consumidor'))
    }
  }, [user, loading, profile, router])

  useEffect(() => {
    if (!invoiceId || !user) return
    let mounted = true
    setLoadingInv(true)
    supabase
      .from('invoice_uploads')
      .select('*')
      .eq('id', invoiceId)
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (mounted) setInvoice(data)
        if (mounted) setLoadingInv(false)
      })
    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceId, user?.id])

  if (loading || !user || !invoiceId || loadingInv) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-200 p-6">
        <div className="max-w-2xl mx-auto pt-12 text-center">
          <p className="text-slate-300">Fatura não encontrada</p>
          <Link href="/dashboard/faturas" className="text-emerald-400 hover:underline mt-2 inline-block">
            Voltar para faturas
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
      <nav className="fixed top-0 left-0 right-0 z-40 bg-[#020617]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-2xl mx-auto px-6 py-3 flex items-center gap-3">
          <Link
            href="/dashboard/faturas"
            className="p-1.5 rounded-lg hover:bg-white/10 transition"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5 text-slate-300" />
          </Link>
          <div className="w-9 h-9 rounded-lg bg-cyan-500/20 flex items-center justify-center">
            <FileText className="text-cyan-400 w-4 h-4" />
          </div>
          <span className="text-sm font-bold text-white truncate">{invoice.file_name}</span>
        </div>
      </nav>

      <main className="pt-20 pb-8 px-4 md:px-6 max-w-2xl mx-auto space-y-4">
        {/* Preview do arquivo */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-sm font-bold text-white mb-2">Arquivo enviado</h3>
          {invoice.file_type?.startsWith('image/') ? (
            <a href={`/api/invoices/file/${invoice.id}`} target="_blank" rel="noopener noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/invoices/file/${invoice.id}`}
                alt={invoice.file_name}
                className="w-full rounded-lg border border-white/10"
              />
            </a>
          ) : (
            <a
              href={`/api/invoices/file/${invoice.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition"
            >
              <FileText className="w-5 h-5 text-emerald-400" />
              <span className="text-sm text-white flex-1 truncate">{invoice.file_name}</span>
              <ExternalLink className="w-4 h-4 text-slate-400" />
            </a>
          )}
          <p className="text-[10px] text-slate-500 mt-2">
            Enviado em {new Date(invoice.created_at).toLocaleString('pt-BR')}
          </p>
        </div>

        {/* Dados extraídos */}
        <InvoiceAnalysis
          invoiceId={invoiceId}
          initialEstado={invoice.estado}
          initialConcessionaria={invoice.concessionaria}
          initialValorTotal={invoice.valor_total}
          initialKwhMensal={invoice.kwh_mensal}
          initialVencimento={invoice.vencimento}
          onAnalyzed={async () => {
            const { data } = await supabase
              .from('invoice_uploads')
              .select('*')
              .eq('id', invoiceId)
              .single()
            setInvoice(data)
          }}
          onMatched={async (count) => {
            const { data } = await supabase
              .from('invoice_uploads')
              .select('*')
              .eq('id', invoiceId)
              .single()
            setInvoice(data)
            if (count > 0) {
              setTimeout(() => router.push('/dashboard/propostas'), 2500)
            }
          }}
        />

        {invoice.status === 'matched' && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
            <p className="text-sm text-emerald-300 font-bold">
              ✓ {invoice.match_count} proposta{invoice.match_count === 1 ? '' : 's'} enviada{invoice.match_count === 1 ? '' : 's'} para geradores
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Acompanhe em <Link href="/dashboard/propostas" className="text-emerald-400 hover:underline">Propostas</Link>
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
