'use client'

import { useState } from 'react'
import { Loader2, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react'
import { useAuth } from '@/app/hooks/useAuth'

interface InvoiceAnalysisProps {
  invoiceId: string
  initialEstado: string | null
  initialConcessionaria: string | null
  initialValorTotal: number | null
  initialKwhMensal: number | null
  initialVencimento: string | null
  onAnalyzed?: () => void
  onMatched?: (count: number) => void
}

export default function InvoiceAnalysis({
  invoiceId,
  initialEstado,
  initialConcessionaria,
  initialValorTotal,
  initialKwhMensal,
  initialVencimento,
  onAnalyzed,
  onMatched,
}: InvoiceAnalysisProps) {
  const { user } = useAuth()
  const [estado, setEstado] = useState(initialEstado ?? '')
  const [concessionaria, setConcessionaria] = useState(initialConcessionaria ?? '')
  const [valorTotal, setValorTotal] = useState(initialValorTotal?.toString() ?? '')
  const [kwhMensal, setKwhMensal] = useState(initialKwhMensal?.toString() ?? '')
  const [vencimento, setVencimento] = useState(initialVencimento ?? '')
  const [saving, setSaving] = useState(false)
  const [matching, setMatching] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSaveAndAnalyze = async () => {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manual: {
            estado: estado || null,
            concessionaria: concessionaria || null,
            valor_total: valorTotal ? parseFloat(valorTotal) : null,
            kwh_mensal: kwhMensal ? parseInt(kwhMensal, 10) : null,
            vencimento: vencimento || null,
          },
        }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Erro ao analisar')
      setSuccess('Dados salvos com sucesso!')
      if (onAnalyzed) onAnalyzed()
    } catch (err: any) {
      setError(err?.message || 'Erro ao analisar')
    } finally {
      setSaving(false)
    }
  }

  const handleMatch = async () => {
    if (!estado) {
      setError('Preencha o estado antes de buscar geradores')
      return
    }
    setMatching(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/match`, { method: 'POST' })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Erro no match')
      const count = body.matchCount ?? 0
      setSuccess(
        count > 0
          ? `${count} gerador${count === 1 ? '' : 'es'} encontrado${count === 1 ? '' : 's'}! Proposta${count === 1 ? '' : 's'} enviada${count === 1 ? '' : 's'} em Propostas.`
          : 'Nenhum gerador ativo no seu estado ainda.',
      )
      if (onMatched) onMatched(count)
    } catch (err: any) {
      setError(err?.message || 'Erro no match')
    } finally {
      setMatching(false)
    }
  }

  const isComplete = estado && concessionaria && valorTotal

  return (
    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-emerald-400" />
        <h3 className="text-sm font-bold text-white">Dados da fatura</h3>
        <span className="text-[10px] text-slate-500">Preencha ou corrija abaixo</span>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Estado (UF)</label>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-500/50"
          >
            <option value="">Selecione</option>
            {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map((uf) => (
              <option key={uf} value={uf}>{uf}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Concessionária</label>
          <input
            type="text"
            value={concessionaria}
            onChange={(e) => setConcessionaria(e.target.value)}
            placeholder="Ex: Equatorial, Enel, Cemig"
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Valor total (R$)</label>
          <input
            type="number"
            step="0.01"
            value={valorTotal}
            onChange={(e) => setValorTotal(e.target.value)}
            placeholder="Ex: 285.50"
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">kWh consumidos no mês</label>
          <input
            type="number"
            value={kwhMensal}
            onChange={(e) => setKwhMensal(e.target.value)}
            placeholder="Ex: 320"
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs text-slate-400 mb-1">Vencimento (opcional)</label>
          <input
            type="date"
            value={vencimento}
            onChange={(e) => setVencimento(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-500/50"
          />
        </div>
      </div>

      {error && (
        <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </div>
      )}
      {success && (
        <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" /> {success}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleSaveAndAnalyze}
          disabled={saving || !isComplete}
          className="flex-1 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition disabled:opacity-50 flex items-center justify-center gap-1.5"
        >
          {saving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Salvando...
            </>
          ) : (
            'Salvar dados'
          )}
        </button>
        <button
          onClick={handleMatch}
          disabled={matching || !isComplete}
          className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-[#020617] text-sm font-bold transition disabled:opacity-50 flex items-center justify-center gap-1.5"
        >
          {matching ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Buscando...
            </>
          ) : (
            'Buscar geradores'
          )}
        </button>
      </div>
    </div>
  )
}
