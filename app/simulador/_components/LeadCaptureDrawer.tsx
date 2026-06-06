'use client'

// ============================================================
// LeadCaptureDrawer — Drawer/modal premium de captura de lead
// ------------------------------------------------------------
// - Abre após o CTA "Quero economizar agora".
// - Pré-preenchido com o valor da conta simulada (gasto).
// - Reforça escassez: "Vagas para este valor de conta são limitadas".
// - Validação client + integra com saveLead do projeto.
// - Após sucesso: mostra estado de sucesso + CTA WhatsApp/Login.
// - A11y: role=dialog, focus trap básico, ESC para fechar.
// ============================================================

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
} from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertCircle,
  CheckCircle2,
  Flame,
  Loader2,
  Lock,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  User,
  X,
  Zap,
} from 'lucide-react'
import { saveLead } from '@/app/actions'
import { buildFollowUpUrl, splitCidadeEstado } from '@/lib/leads'
import { formatBRL } from '../_utils/format'

interface LeadCaptureDrawerProps {
  open: boolean
  onClose: () => void
  gasto: number
  economiaMensal: number
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Aceita formatos BR comuns: com/sem DDI, com/sem máscara.
const PHONE_RE = /^\+?\d{10,15}$/

function normalizePhone(raw: string): string {
  const trimmed = raw.trim()
  const plus = trimmed.startsWith('+') ? '+' : ''
  const digits = trimmed.replace(/\D/g, '')
  return `${plus}${digits}`
}

export default function LeadCaptureDrawer({
  open,
  onClose,
  gasto,
  economiaMensal,
}: LeadCaptureDrawerProps) {
  const router = useRouter()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [cidade, setCidade] = useState('')
  const [acceptedLgpd, setAcceptedLgpd] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [leadId, setLeadId] = useState<number | null>(null)

  const dialogRef = useRef<HTMLDivElement | null>(null)
  const firstFieldRef = useRef<HTMLInputElement | null>(null)
  const titleId = useId()

  // Foco inicial + trava scroll do body
  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // Pequeno delay para garantir que a transição começou
    const t = setTimeout(() => firstFieldRef.current?.focus(), 80)
    return () => {
      document.body.style.overflow = previousOverflow
      clearTimeout(t)
    }
  }, [open])

  // ESC fecha
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Reset quando reabre
  useEffect(() => {
    if (open) {
      setError(null)
      setSuccess(false)
      setLeadId(null)
    }
  }, [open])

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      setError(null)

      if (!nome.trim()) {
        setError('Informe seu nome para continuarmos.')
        return
      }
      if (!EMAIL_RE.test(email.trim())) {
        setError('E-mail inválido.')
        return
      }
      if (!PHONE_RE.test(normalizePhone(whatsapp))) {
        setError('WhatsApp inválido. Use DDD + número (ex: 84 98785-8668).')
        return
      }
      if (!cidade.trim()) {
        setError('Informe sua cidade (ex: Natal - RN).')
        return
      }
      if (!acceptedLgpd) {
        setError('É preciso aceitar a política de privacidade.')
        return
      }

      setSubmitting(true)
      try {
        const { cidade: cid, estado } = splitCidadeEstado(cidade)
        const result = await saveLead({
          tipo: 'consumidor',
          nome: nome.trim(),
          email: email.trim(),
          whatsapp: normalizePhone(whatsapp),
          cidade: cid || cidade.trim(),
          estado: estado || 'ND',
          gastoMensal: gasto,
        })
        if (!result.success) {
          throw new Error(result.message || 'Erro ao enviar')
        }
        setLeadId(result.id ?? null)
        setSuccess(true)
      } catch (err: any) {
        setError(err?.message ?? 'Não conseguimos enviar agora. Tente novamente.')
      } finally {
        setSubmitting(false)
      }
    },
    [acceptedLgpd, cidade, email, gasto, nome, whatsapp],
  )

  if (!open) return null

  const reducaoPct = Math.round((economiaMensal / Math.max(gasto, 1)) * 100)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
    >
      {/* Backdrop com blur */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar"
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      />

      {/* Drawer / Modal */}
      <div
        ref={dialogRef}
        className="relative w-full md:max-w-lg max-h-[95vh] overflow-y-auto bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/20 md:rounded-3xl rounded-t-3xl shadow-2xl shadow-emerald-500/10 animate-fade-up"
      >
        {/* Drag handle (mobile) */}
        <div className="md:hidden flex justify-center pt-2.5 pb-1">
          <span className="w-10 h-1 rounded-full bg-white/15" />
        </div>

        {/* Botão fechar */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center transition"
        >
          <X className="w-4 h-4" />
        </button>

        {!success ? (
          <div className="p-6 md:p-8 space-y-6">
            {/* Header com badge de escassez */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/15 to-amber-600/5 border border-amber-500/30 text-amber-300 text-[10px] font-black uppercase tracking-wider mb-3 animate-pulse-soft">
                <Flame className="w-3 h-3" />
                Vagas limitadas para este valor de conta
              </div>
              <h2
                id={titleId}
                className="text-2xl md:text-3xl font-black text-white leading-tight"
              >
                Vamos liberar sua{' '}
                <span className="text-gradient-emerald">
                  economia de R$ {formatBRL(economiaMensal)}/mês
                </span>
                ?
              </h2>
              <p className="text-sm text-slate-400 mt-2">
                Falta pouco. Deixe seus dados e um especialista entra em contato
                em até <strong className="text-emerald-300">24h</strong>.
              </p>
            </div>

            {/* Card de resumo da simulação */}
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Conta simulada</span>
                <span className="font-bold text-slate-200 tabular-nums">
                  R$ {formatBRL(gasto)}/mês
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Economia estimada</span>
                <span className="font-bold text-emerald-300 tabular-nums">
                  R$ {formatBRL(economiaMensal)}/mês (−{reducaoPct}%)
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Em 12 meses</span>
                <span className="font-bold text-emerald-300 tabular-nums">
                  R$ {formatBRL(economiaMensal * 12)}
                </span>
              </div>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
              <Field
                icon={User}
                label="Nome completo"
                type="text"
                value={nome}
                onChange={setNome}
                placeholder="Como podemos te chamar?"
                autoComplete="name"
                inputRef={firstFieldRef}
                required
              />
              <Field
                icon={Mail}
                label="E-mail"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="seuemail@exemplo.com"
                autoComplete="email"
                required
              />
              <Field
                icon={Phone}
                label="WhatsApp (com DDD)"
                type="tel"
                value={whatsapp}
                onChange={setWhatsapp}
                placeholder="(84) 98785-8668"
                autoComplete="tel"
                required
              />
              <Field
                icon={MapPin}
                label="Cidade e estado"
                type="text"
                value={cidade}
                onChange={setCidade}
                placeholder="Ex: Natal - RN"
                autoComplete="address-level2"
                required
              />

              {/* LGPD */}
              <label className="flex items-start gap-2.5 text-[11px] text-slate-400 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={acceptedLgpd}
                  onChange={(e) => setAcceptedLgpd(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-emerald-500 shrink-0"
                />
                <span>
                  Concordo com a{' '}
                  <a
                    href="/termos"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:underline"
                  >
                    Política de Privacidade
                  </a>{' '}
                  e autorizo o contato comercial. Posso revogar a qualquer
                  momento.
                </span>
              </label>

              {error && (
                <div
                  className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-start gap-2 animate-fade-down"
                  role="alert"
                >
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Selos de confiança */}
              <div className="flex items-center justify-center gap-3 py-1 text-[10px] text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" /> LGPD
                </span>
                <span className="inline-flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-500" /> Criptografado
                </span>
                <span className="inline-flex items-center gap-1">
                  <Zap className="w-3 h-3 text-emerald-500" /> Resposta 24h
                </span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="group w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black text-base transition-all flex items-center justify-center gap-2 shadow-glow-emerald disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Enviando...
                  </>
                ) : (
                  <>
                    Quero garantir minha vaga
                    <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform" />
                  </>
                )}
              </button>

              <p className="text-center text-[10px] text-slate-500">
                Sem compromisso. Cancele quando quiser.
              </p>
            </form>
          </div>
        ) : (
          <SuccessState
            titleId={titleId}
            gasto={gasto}
            economiaMensal={economiaMensal}
            nome={nome}
            cidade={cidade}
            leadId={leadId}
            onContinue={() => {
              onClose()
              router.push('/login?from=consumidor')
            }}
          />
        )}
      </div>
    </div>
  )
}

// ============================================================
// Subcomponentes locais
// ============================================================

interface FieldProps {
  icon: typeof Mail
  label: string
  type: 'text' | 'email' | 'tel' | 'number'
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
  autoComplete?: string
  inputRef?: React.Ref<HTMLInputElement>
}

function Field({
  icon: Icon,
  label,
  type,
  value,
  onChange,
  placeholder,
  required,
  autoComplete,
  inputRef,
}: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-400">
        {label}
        {required && <span className="text-emerald-400 ml-0.5">*</span>}
      </label>
      <div className="relative group">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
        <input
          ref={inputRef}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/70 border border-white/10 text-sm text-white placeholder-slate-500 focus:border-emerald-500/60 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
        />
      </div>
    </div>
  )
}

interface SuccessStateProps {
  titleId: string
  gasto: number
  economiaMensal: number
  nome: string
  cidade: string
  leadId: number | null
  onContinue: () => void
}

function SuccessState({
  titleId,
  gasto,
  economiaMensal,
  nome,
  cidade,
  leadId,
  onContinue,
}: SuccessStateProps) {
  return (
    <div className="p-6 md:p-8 text-center space-y-5">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 animate-scale-pop">
        <CheckCircle2 className="w-10 h-10 text-emerald-400" />
      </div>

      <div>
        <h2 id={titleId} className="text-2xl font-black text-white">
          Vaga garantida, {nome.split(' ')[0] || 'amigo(a)'}! 🚀
        </h2>
        <p className="text-sm text-emerald-300 mt-1.5 font-medium">
          Dados recebidos com sucesso
        </p>
      </div>

      <p className="text-sm text-slate-300 leading-relaxed max-w-sm mx-auto">
        Nossa equipe vai priorizar sua análise. Continue para o painel do
        consumidor e{' '}
        <strong className="text-white">acompanhe sua economia em tempo real</strong>.
      </p>

      {/* Resumo */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left space-y-1.5 text-xs">
        <div className="flex justify-between">
          <span className="text-slate-400">Conta simulada</span>
          <span className="font-bold text-slate-200 tabular-nums">
            R$ {formatBRL(gasto)}/mês
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Economia prevista</span>
          <span className="font-bold text-emerald-300 tabular-nums">
            R$ {formatBRL(economiaMensal)}/mês
          </span>
        </div>
        {leadId && (
          <div className="flex justify-between pt-1.5 border-t border-white/5">
            <span className="text-slate-500">Protocolo</span>
            <span className="font-mono text-slate-400">
              #{String(leadId).padStart(6, '0')}
            </span>
          </div>
        )}
      </div>

      {/* CTA WhatsApp (acelera em 50%) */}
      <a
        href={buildFollowUpUrl('consumidor', { nome, cidade })}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-200 font-bold text-sm transition-all"
      >
        <MessageSquare className="w-4 h-4" />
        Enviar fatura pelo WhatsApp (acelera 50%)
        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
      </a>

      {/* CTA Login */}
      <button
        type="button"
        onClick={onContinue}
        className="group w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black text-base transition-all flex items-center justify-center gap-2 shadow-glow-emerald"
      >
        Continuar para o Painel
        <Zap className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
      </button>

      <p className="text-[10px] text-slate-600">
        🔒 Seus dados estão protegidos pela LGPD.
      </p>
    </div>
  )
}
