'use client'

// ============================================================
// SendProposalModal — Modal premium "Enviar PDF por e-mail"
// ------------------------------------------------------------
// Aparece no /simulador como uma alternativa à captura de lead.
// Quando aberto, o cliente preenche apenas nome + e-mail; o
// sistema gera o PDF server-side e dispara o envio.
//
// Fluxo:
//   1) Usuário informa nome + e-mail (gasto já vem do slider).
//   2) Submit → POST /api/embaixador/send-proposal.
//   3) Sucesso: mostra confirmação + protocolo.
//   4) Em paralelo, abre WhatsApp com mensagem pronta.
//
// NOTA: Como o /simulador é público, este endpoint não exige
// sessão (o servidor permite apenas se a rota for acessada
// sem auth — ver route.ts). Para evitar abuso, podemos
// adicionar rate-limit (Upstash) em produção.
// ============================================================

import { useEffect, useId, useState, type FormEvent } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  Mail,
  Send,
  ShieldCheck,
  Sparkles,
  User,
  X,
  Zap,
} from 'lucide-react'
import { formatBRL } from '../_utils/format'

interface SendProposalModalProps {
  open: boolean
  onClose: () => void
  gasto: number
  economiaMensal: number
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function SendProposalModal({
  open,
  onClose,
  gasto,
  economiaMensal,
}: SendProposalModalProps) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sendStatus, setSendStatus] = useState<'sent' | 'queued' | null>(null)
  const [protocolo, setProtocolo] = useState<string | null>(null)
  const titleId = useId()

  // Reset quando reabre
  useEffect(() => {
    if (open) {
      setError(null)
      setSuccess(false)
      setSendStatus(null)
      setProtocolo(null)
    }
  }, [open])

  // Esc fecha
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Trava scroll
  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  if (!open) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!nome.trim()) {
      setError('Informe seu nome.')
      return
    }
    if (!EMAIL_RE.test(email.trim())) {
      setError('E-mail inválido.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/embaixador/send-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: nome.trim(),
          clientEmail: email.trim(),
          gastoMensal: gasto,
          economiaMensal,
          economiaAnual: economiaMensal * 12,
          percentualEconomia: 32,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error ?? 'Falha ao enviar proposta')
      }
      setProtocolo(data.proposalId)
      setSendStatus(data.sendStatus)
      setSuccess(true)
    } catch (err: any) {
      setError(err?.message ?? 'Não conseguimos enviar agora. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar"
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      />
      <div className="relative w-full md:max-w-md max-h-[95vh] overflow-y-auto bg-gradient-to-br from-slate-900 to-slate-950 border border-cyan-500/20 md:rounded-3xl rounded-t-3xl shadow-2xl shadow-cyan-500/10 animate-fade-up">
        <div className="md:hidden flex justify-center pt-2.5 pb-1">
          <span className="w-10 h-1 rounded-full bg-white/15" />
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center transition"
        >
          <X className="w-4 h-4" />
        </button>

        {!success ? (
          <div className="p-6 md:p-7 space-y-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-black uppercase tracking-wider mb-3">
                <FileText className="w-3 h-3" />
                Receba por e-mail
              </div>
              <h2
                id={titleId}
                className="text-2xl md:text-3xl font-black text-white leading-tight"
              >
                Envie sua{' '}
                <span className="text-gradient-cyan">proposta em PDF</span>
              </h2>
              <p className="text-sm text-slate-400 mt-2">
                Documento personalizado com a economia estimada, prazos da
                ANEEL e validade de 48h.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Conta simulada</span>
                <span className="font-bold text-slate-200 tabular-nums">
                  R$ {formatBRL(gasto)}/mês
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Economia prevista</span>
                <span className="font-bold text-emerald-300 tabular-nums">
                  R$ {formatBRL(economiaMensal)}/mês
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
              <div className="space-y-1.5">
                <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-400">
                  Nome completo<span className="text-emerald-400 ml-0.5">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Como devemos te chamar?"
                    required
                    autoComplete="name"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/70 border border-white/10 text-sm text-white placeholder-slate-500 focus:border-cyan-500/60 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-400">
                  E-mail<span className="text-emerald-400 ml-0.5">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seuemail@exemplo.com"
                    required
                    autoComplete="email"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/70 border border-white/10 text-sm text-white placeholder-slate-500 focus:border-cyan-500/60 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  />
                </div>
              </div>

              {error && (
                <div
                  className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-start gap-2 animate-fade-down"
                  role="alert"
                >
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex items-center justify-center gap-3 text-[10px] text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" /> LGPD
                </span>
                <span className="inline-flex items-center gap-1">
                  <Zap className="w-3 h-3 text-emerald-500" /> Imediato
                </span>
                <span className="inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-500" /> 48h válida
                </span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="group w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 font-black text-base transition-all flex items-center justify-center gap-2 shadow-[0_0_25px_-4px_rgba(34,211,238,0.55)] disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Enviando...
                  </>
                ) : (
                  <>
                    Enviar PDF agora
                    <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <SuccessState
            titleId={titleId}
            email={email}
            protocolo={protocolo}
            sendStatus={sendStatus}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  )
}

interface SuccessStateProps {
  titleId: string
  email: string
  protocolo: string | null
  sendStatus: 'sent' | 'queued' | null
  onClose: () => void
}

function SuccessState({ titleId, email, protocolo, sendStatus, onClose }: SuccessStateProps) {
  return (
    <div className="p-6 md:p-7 text-center space-y-5">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-cyan-500/15 border border-cyan-500/30 animate-scale-pop">
        <CheckCircle2 className="w-10 h-10 text-cyan-400" />
      </div>
      <div>
        <h2 id={titleId} className="text-2xl font-black text-white">
          Proposta a caminho! 📄
        </h2>
        <p className="text-sm text-cyan-300 mt-1.5 font-medium">
          {sendStatus === 'sent'
            ? 'E-mail enviado com sucesso'
            : 'Proposta gerada e em fila para envio'}
        </p>
      </div>
      <p className="text-sm text-slate-300 leading-relaxed max-w-sm mx-auto">
        Enviamos o PDF para{' '}
        <strong className="text-white">{email}</strong> com todos os detalhes
        da simulação. O documento é válido por{' '}
        <strong className="text-cyan-300">48 horas</strong>.
      </p>
      {protocolo && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 text-xs">
          <span className="text-slate-500">Protocolo: </span>
          <span className="font-mono text-slate-300">
            #{protocolo.slice(0, 8).toUpperCase()}
          </span>
        </div>
      )}
      <button
        type="button"
        onClick={onClose}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 font-black text-base transition-all flex items-center justify-center gap-2"
      >
        Fechar
      </button>
    </div>
  )
}
