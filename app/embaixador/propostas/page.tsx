'use client'

// ============================================================
// Parceiro Propostas — Ferramenta de envio de PDF + histórico
// ------------------------------------------------------------
// 1) Formulário minimalista: nome, e-mail, gasto mensal.
//    Cidade/estado opcionais (auto do parceiro).
// 2) Submit → POST /api/embaixador/send-proposal.
// 3) Sucesso: confirmação + protocolo + ações (baixar, copiar).
// 4) Lista histórica das últimas 50 propostas enviadas.
// ============================================================

import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Copy,
  Download,
  FileText,
  Flame,
  Loader2,
  Mail,
  MapPin,
  Send,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  User,
  Zap,
  AlertCircle,
  CalendarClock,
  MessageCircle,
} from 'lucide-react'
import { useAuth } from '@/app/hooks/useAuth'

interface ProposalRow {
  id: string
  client_name: string | null
  client_email: string
  client_whatsapp: string | null
  client_cidade: string | null
  client_estado: string | null
  gasto_mensal: number
  economia_mensal: number
  economia_anual: number
  percentual_economia: number
  send_status: 'pending' | 'sent' | 'failed' | 'queued'
  sent_at: string | null
  valid_until: string
  created_at: string
  pdf_url: string | null
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PERCENTUAL = 0.32

export default function EmbaixadorPropostasPage() {
  const router = useRouter()
  const { user, profile, loading } = useAuth()

  // Form
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientWhatsapp, setClientWhatsapp] = useState('')
  const [clientCidade, setClientCidade] = useState('')
  const [gasto, setGasto] = useState<number>(350)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{
    id: string
    pdfUrl: string | null
    validUntil: string
    sendStatus: 'sent' | 'queued' | 'failed'
  } | null>(null)
  const [copied, setCopied] = useState(false)

  // Histórico
  const [proposals, setProposals] = useState<ProposalRow[]>([])
  const [loadingProposals, setLoadingProposals] = useState(true)

  const economiaMensal = Math.round(gasto * PERCENTUAL)
  const economiaAnual = economiaMensal * 12
  const contaCom = Math.max(0, gasto - economiaMensal)

  // Auth check
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?from=parceiro')
    }
  }, [loading, user, router])

  // Carrega histórico
  const loadProposals = useCallback(async () => {
    if (!user) return
    try {
      setLoadingProposals(true)
      const res = await fetch('/api/embaixador/proposals', {
        cache: 'no-store',
      })
      const data = await res.json()
      if (res.ok) {
        setProposals(data.proposals ?? [])
      }
    } catch {
      /* silencioso */
    } finally {
      setLoadingProposals(false)
    }
  }, [user])

  useEffect(() => {
    loadProposals()
  }, [loadProposals])

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    )
  }

  const isEmbaixador = profile?.tipo === 'parceiro' || profile?.role === 'admin'

  if (!isEmbaixador) {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-200 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white/[0.02] border border-white/10 rounded-2xl p-8 text-center">
          <ShieldCheck className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <h1 className="text-xl font-bold text-white mb-2">
            Acesso restrito a parceiros
          </h1>
          <p className="text-sm text-slate-400">
            Esta ferramenta é exclusiva do programa de parceiros EnergiaLivre.
            Quer participar?{' '}
            <Link
              href="/cadastro-embaixador"
              className="text-emerald-400 hover:underline"
            >
              Cadastre-se como parceiro
            </Link>
            .
          </p>
          <button
            onClick={() => router.push('/dashboard-consumidor')}
            className="mt-5 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition"
          >
            Voltar ao meu painel
          </button>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!clientName.trim()) {
      setError('Informe o nome do cliente.')
      return
    }
    if (!EMAIL_RE.test(clientEmail.trim())) {
      setError('E-mail do cliente inválido.')
      return
    }
    if (gasto < 50) {
      setError('Gasto mensal mínimo: R$ 50.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/embaixador/send-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: clientName.trim(),
          clientEmail: clientEmail.trim(),
          clientWhatsapp: clientWhatsapp.trim() || undefined,
          clientCidade: clientCidade.trim() || undefined,
          clientEstado:
            profile?.cidade && !clientCidade.trim() ? profile.estado : undefined,
          gastoMensal: gasto,
          economiaMensal,
          economiaAnual,
          percentualEconomia: Math.round(PERCENTUAL * 100),
          contaComEnergiaLivre: contaCom,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error ?? 'Falha ao enviar')
      setSuccess({
        id: data.proposalId,
        pdfUrl: data.pdfUrl,
        validUntil: data.validUntil,
        sendStatus: data.sendStatus,
      })
      setClientName('')
      setClientEmail('')
      setClientWhatsapp('')
      setClientCidade('')
      setGasto(350)
      await loadProposals()
    } catch (err: any) {
      setError(err?.message ?? 'Não conseguimos enviar agora.')
    } finally {
      setSubmitting(false)
    }
  }

  const copyPdfLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
      {/* Efeitos de fundo */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent -z-20" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px] -z-10" />

      {/* Nav minimalista */}
      <nav className="border-b border-white/10 bg-[#020617]/85 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/embaixador/dashboard"
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition"
              aria-label="Voltar"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-400 rounded-lg flex items-center justify-center shrink-0">
                <FileText className="text-slate-900 w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-base font-black text-white truncate">
                  Propostas por E-mail
                </p>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                  Ferramenta do Parceiro
                </p>
              </div>
            </div>
          </div>
          <Link
            href="/embaixador/dashboard"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition"
          >
            <Zap className="w-3 h-3 text-emerald-400" />
            Painel
          </Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
        {/* Header */}
        <header>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-wider mb-3">
            <Sparkles className="w-3 h-3" />
            Modelo Hinode · Ferramenta oficial
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white">
            Envie a proposta em PDF para seu cliente
          </h1>
          <p className="text-slate-400 mt-2 max-w-2xl text-sm sm:text-base">
            Insira o e-mail e os dados da conta. O sistema gera o documento
            com a logomarca EnergiaLivre, os prazos regulatórios da ANEEL e
            validade de 48h. A entrega é instantânea.
          </p>
        </header>

        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-6">
          {/* ==========================================================
              FORMULÁRIO — Lado esquerdo
              ========================================================== */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-7 h-fit">
            <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-400" />
              Nova proposta
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              Todos os campos são opcionais, exceto nome e e-mail.
            </p>

            {success ? (
              <SuccessPanel
                success={success}
                onNew={() => setSuccess(null)}
                onCopy={copyPdfLink}
                copied={copied}
              />
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <Field
                  icon={User}
                  label="Nome do cliente"
                  value={clientName}
                  onChange={setClientName}
                  placeholder="Ex: Maria Silva"
                  required
                />
                <Field
                  icon={Mail}
                  label="E-mail (receberá o PDF)"
                  type="email"
                  value={clientEmail}
                  onChange={setClientEmail}
                  placeholder="cliente@exemplo.com"
                  required
                />
                <Field
                  icon={MessageCircle}
                  label="WhatsApp (opcional)"
                  type="tel"
                  value={clientWhatsapp}
                  onChange={setClientWhatsapp}
                  placeholder="(84) 98785-8668"
                />
                <Field
                  icon={MapPin}
                  label="Cidade do cliente (opcional)"
                  value={clientCidade}
                  onChange={setClientCidade}
                  placeholder={
                    profile?.cidade
                      ? `Padrão: ${profile.cidade}/${profile.estado}`
                      : 'Ex: Natal - RN'
                  }
                />

                {/* Slider de gasto */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-400">
                    Conta mensal do cliente (R$)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={50}
                      max={2000}
                      step={10}
                      value={gasto}
                      onChange={(e) => setGasto(Number(e.target.value))}
                      className="el-slider flex-1"
                    />
                    <div className="w-24 px-3 py-2 rounded-xl bg-slate-900/70 border border-white/10 text-right">
                      <span className="text-slate-400 text-xs mr-0.5">R$</span>
                      <span className="text-white font-bold tabular-nums">
                        {gasto.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Resumo instantâneo */}
                <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-3.5 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Conta atual</span>
                    <span className="font-bold text-slate-200 tabular-nums">
                      R$ {gasto.toLocaleString('pt-BR')}/mês
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Com EnergiaLivre</span>
                    <span className="font-bold text-white tabular-nums">
                      R$ {contaCom.toLocaleString('pt-BR')}/mês
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1.5 border-t border-emerald-500/20">
                    <span className="text-slate-300 flex items-center gap-1">
                      <TrendingDown className="w-3 h-3 text-emerald-400" />
                      Economia
                    </span>
                    <span className="font-bold text-emerald-300 tabular-nums">
                      R$ {economiaMensal.toLocaleString('pt-BR')}/mês
                      <span className="text-emerald-400/70 ml-1">−32%</span>
                    </span>
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
                    <Flame className="w-3 h-3 text-amber-500" /> Vagas limitadas
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <CalendarClock className="w-3 h-3 text-cyan-400" /> Válida 48h
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="group w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black text-base transition-all flex items-center justify-center gap-2 shadow-glow-emerald disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Gerando e enviando...
                    </>
                  ) : (
                    <>
                      Gerar e enviar PDF
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            )}
          </section>

          {/* ==========================================================
              HISTÓRICO — Lado direito
              ========================================================== */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                Propostas enviadas
              </h2>
              <span className="text-[10px] font-bold text-slate-500 uppercase">
                {proposals.length} no total
              </span>
            </div>

            {loadingProposals ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
              </div>
            ) : proposals.length === 0 ? (
              <EmptyState />
            ) : (
              <ul className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {proposals.map((p) => (
                  <ProposalCard
                    key={p.id}
                    proposal={p}
                    onCopyLink={() =>
                      p.pdf_url && copyPdfLink(p.pdf_url)
                    }
                  />
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

// ============================================================
// Subcomponentes locais
// ============================================================

interface FieldProps {
  icon: typeof User
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: 'text' | 'email' | 'tel'
  required?: boolean
}

function Field({ icon: Icon, label, value, onChange, placeholder, type = 'text', required }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-400">
        {label}
        {required && <span className="text-emerald-400 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-900/70 border border-white/10 text-sm text-white placeholder-slate-500 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
        />
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-10">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-3">
        <FileText className="w-5 h-5 text-cyan-400" />
      </div>
      <p className="text-slate-300 font-medium text-sm">
        Nenhuma proposta enviada ainda
      </p>
      <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
        Preencha o formulário ao lado. A primeira proposta chega em
        segundos no e-mail do cliente.
      </p>
    </div>
  )
}

function ProposalCard({
  proposal,
  onCopyLink,
}: {
  proposal: ProposalRow
  onCopyLink: () => void
}) {
  const isValid = new Date(proposal.valid_until) > new Date()
  const sentDate = proposal.sent_at
    ? new Date(proposal.sent_at).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—'
  const validDate = new Date(proposal.valid_until).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

  const statusMeta: Record<ProposalRow['send_status'], { label: string; color: string }> = {
    sent: { label: 'Enviado', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
    queued: { label: 'Em fila', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
    failed: { label: 'Falhou', color: 'bg-red-500/15 text-red-300 border-red-500/30' },
    pending: { label: 'Pendente', color: 'bg-slate-500/15 text-slate-300 border-slate-500/30' },
  }
  const status = statusMeta[proposal.send_status]

  return (
    <li className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-cyan-500/30 transition group">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-white truncate">
            {proposal.client_name || proposal.client_email}
          </p>
          <p className="text-[11px] text-slate-500 truncate">
            {proposal.client_email}
          </p>
        </div>
        <span
          className={`shrink-0 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full border ${status.color}`}
        >
          {status.label}
        </span>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2 text-[10px]">
        <div>
          <p className="text-slate-500">Conta</p>
          <p className="font-bold text-slate-200 tabular-nums">
            R$ {proposal.gasto_mensal.toLocaleString('pt-BR')}
          </p>
        </div>
        <div>
          <p className="text-slate-500">Economia</p>
          <p className="font-bold text-emerald-300 tabular-nums">
            R$ {proposal.economia_mensal.toLocaleString('pt-BR')}
          </p>
        </div>
        <div>
          <p className="text-slate-500">Validade</p>
          <p className={`font-bold tabular-nums ${isValid ? 'text-cyan-300' : 'text-slate-500'}`}>
            {validDate}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="text-[10px] text-slate-500">
          Enviado em {sentDate}
        </p>
        <div className="flex items-center gap-1.5">
          {proposal.pdf_url && (
            <button
              type="button"
              onClick={onCopyLink}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
              title="Copiar link público"
              aria-label="Copiar link"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          )}
          <a
            href={`/api/embaixador/proposal-pdf/${proposal.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
            title="Baixar PDF"
            aria-label="Baixar PDF"
          >
            <Download className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </li>
  )
}

function SuccessPanel({
  success,
  onNew,
  onCopy,
  copied,
}: {
  success: { id: string; pdfUrl: string | null; validUntil: string; sendStatus: 'sent' | 'queued' | 'failed' }
  onNew: () => void
  onCopy: (url: string) => void
  copied: boolean
}) {
  const validStr = new Date(success.validUntil).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  return (
    <div className="text-center py-4 space-y-4">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 animate-scale-pop">
        <CheckCircle2 className="w-8 h-8 text-emerald-400" />
      </div>
      <div>
        <h3 className="text-lg font-black text-white">
          {success.sendStatus === 'sent' ? 'Proposta enviada!' : 'Proposta gerada'}
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          {success.sendStatus === 'sent'
            ? 'O cliente recebeu o PDF por e-mail.'
            : 'E-mail entrará em fila automaticamente.'}
        </p>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left text-xs space-y-1">
        <div className="flex justify-between">
          <span className="text-slate-500">Protocolo</span>
          <span className="font-mono text-slate-300">
            #{success.id.slice(0, 8).toUpperCase()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Válida até</span>
          <span className="text-cyan-300 font-bold">{validStr}</span>
        </div>
      </div>
      {success.pdfUrl && (
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onCopy(success.pdfUrl!)}
            className="py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5" />
            {copied ? 'Copiado!' : 'Copiar link'}
          </button>
          <a
            href={success.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Abrir PDF
          </a>
        </div>
      )}
      <button
        type="button"
        onClick={onNew}
        className="w-full py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-200 text-sm font-bold transition border border-emerald-500/30"
      >
        Enviar outra proposta
      </button>
    </div>
  )
}
