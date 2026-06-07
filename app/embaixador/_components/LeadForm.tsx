'use client'

// ============================================================
// LeadForm — Formulário de cadastro do embaixador (3 passos)
//   1. Dados básicos
//   2. Nicho/canal/audiencia
//   3. Loading animado (4 fases) + tela de sucesso
// ============================================================

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Send,
  Sparkles,
  Users,
  Handshake,
  DollarSign,
  MapPin,
  Briefcase,
  Megaphone,
  Shield,
  BadgeCheck,
  CheckCircle2,
} from 'lucide-react'
import { useAuth } from '@/app/hooks/useAuth'
import { saveLead } from '@/app/actions'
import { splitCidadeEstado } from '@/lib/leads'

const NICHO_OPTIONS = [
  { value: 'imoveis', label: 'Imóveis' },
  { value: 'marketing', label: 'Marketing Digital' },
  { value: 'educacao', label: 'Educação' },
  { value: 'consultoria', label: 'Consultoria' },
  { value: 'vendas', label: 'Vendas' },
  { value: 'outro', label: 'Outro' },
] as const

const CANAL_OPTIONS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'indicacao', label: 'Indicação Direta' },
  { value: 'outro', label: 'Outro' },
] as const

const PHASES = [
  { icon: Sparkles, text: 'Validando seus dados...' },
  { icon: Users, text: 'Cruzando com a base de embaixadores...' },
  { icon: Handshake, text: 'Preparando seu contrato de parceria...' },
  { icon: DollarSign, text: 'Calculando projeção personalizada...' },
]

interface LeadFormProps {
  whatsappGroupUrl: string
}

export function LeadForm({ whatsappGroupUrl }: LeadFormProps) {
  const { user, profile } = useAuth()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [phase, setPhase] = useState(0)
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    whatsapp: '',
    cidade: '',
    nicho: '',
    audiencia: '',
    canal: '',
  })

  const isLoggedPartner = !!user && profile?.tipo === 'parceiro'

  const handleSubmitFinal = async () => {
    const { estado } = splitCidadeEstado(formData.cidade)
    const result = await saveLead({
      tipo: 'parceiro',
      nome: formData.nome,
      email: formData.email,
      whatsapp: formData.whatsapp,
      cidade: formData.cidade,
      estado: estado || 'ND',
      nicho: formData.nicho || undefined,
      audienciaEstimada: formData.audiencia ? Number(formData.audiencia) : undefined,
      canal: formData.canal || undefined,
    })
    setIsLoading(false)
    if (!result.success) {
      alert(`Erro ao enviar: ${result.message}`)
      setStep(1)
      return
    }
    setSubmitted(true)
  }

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setStep(3)
    let p = 0
    const interval = setInterval(() => {
      p += 1
      setPhase(p)
    }, 1400)
    setTimeout(() => {
      clearInterval(interval)
      setPhase(PHASES.length - 1)
      handleSubmitFinal()
    }, 6000)
  }

  return (
    <section id="cadastro" className="py-20 px-6 border-t border-white/5">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-black mb-4 uppercase tracking-widest">
            <Briefcase className="w-3 h-3" /> Cadastro de Embaixador
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
            Comece a{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              ganhar hoje
            </span>
            .
          </h2>
          <p className="text-slate-400 text-base max-w-md mx-auto">
            Preencha em 60 segundos. Você recebe o contato do time em até 24h.
          </p>
        </div>

        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 md:p-8">
          {!submitted && step === 1 && (
            <Step1Form
              formData={formData}
              onChange={setFormData}
              onNext={() => setStep(2)}
            />
          )}

          {!submitted && step === 2 && (
            <Step2Form
              formData={formData}
              onChange={setFormData}
              onBack={() => setStep(1)}
              onSubmit={handleStep2Submit}
            />
          )}

          {!submitted && step === 3 && <Step3Loading phase={phase} />}

          {submitted && (
            <SuccessState
              whatsappGroupUrl={whatsappGroupUrl}
              isLoggedPartner={isLoggedPartner}
            />
          )}
        </div>

        <p className="mt-6 text-center text-[10px] text-slate-600 max-w-md mx-auto leading-relaxed">
          🔒 Dados protegidos pela LGPD. Sem compromisso — você só avança se fizer sentido.
        </p>
      </div>
    </section>
  )
}

// ============================================================
// Subcomponentes internos do LeadForm
// ============================================================

interface FormState {
  nome: string
  email: string
  whatsapp: string
  cidade: string
  nicho: string
  audiencia: string
  canal: string
}

function Step1Form({
  formData,
  onChange,
  onNext,
}: {
  formData: FormState
  onChange: (s: FormState) => void
  onNext: () => void
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onNext()
      }}
      className="space-y-4"
    >
      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1.5">
            Nome completo
          </label>
          <input
            required
            type="text"
            placeholder="Seu nome"
            value={formData.nome}
            onChange={(e) => onChange({ ...formData, nome: e.target.value })}
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 outline-none"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1.5">
            WhatsApp
          </label>
          <input
            required
            type="tel"
            placeholder="+55 84 99999-8888"
            value={formData.whatsapp}
            onChange={(e) => onChange({ ...formData, whatsapp: e.target.value })}
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 outline-none"
          />
        </div>
      </div>
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1.5">
          Email
        </label>
        <input
          required
          type="email"
          placeholder="voce@email.com"
          value={formData.email}
          onChange={(e) => onChange({ ...formData, email: e.target.value })}
          className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 outline-none"
        />
      </div>
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1.5">
          Cidade e estado
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
          <input
            required
            type="text"
            placeholder="Ex: Natal - RN"
            value={formData.cidade}
            onChange={(e) => onChange({ ...formData, cidade: e.target.value })}
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 outline-none"
          />
        </div>
      </div>
      <button
        type="submit"
        className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-900 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 group"
      >
        Continuar <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </form>
  )
}

function Step2Form({
  formData,
  onChange,
  onBack,
  onSubmit,
}: {
  formData: FormState
  onChange: (s: FormState) => void
  onBack: () => void
  onSubmit: (e: React.FormEvent) => void
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1.5">
            Nicho de atuação
          </label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <select
              value={formData.nicho}
              onChange={(e) => onChange({ ...formData, nicho: e.target.value })}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 outline-none appearance-none"
            >
              <option value="">Selecione (opcional)</option>
              {NICHO_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1.5">
            Canal principal
          </label>
          <div className="relative">
            <Megaphone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <select
              value={formData.canal}
              onChange={(e) => onChange({ ...formData, canal: e.target.value })}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 outline-none appearance-none"
            >
              <option value="">Selecione (opcional)</option>
              {CANAL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1.5">
          Audiência estimada (pessoas/mês)
        </label>
        <input
          type="number"
          min="0"
          placeholder="Ex: 5000"
          value={formData.audiencia}
          onChange={(e) => onChange({ ...formData, audiencia: e.target.value })}
          className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 outline-none"
        />
      </div>
      <div className="flex items-center justify-center gap-4 py-1 text-[10px] text-slate-500">
        <span className="flex items-center gap-1">
          <Shield className="w-3 h-3 text-emerald-500" /> LGPD
        </span>
        <span className="flex items-center gap-1">
          <BadgeCheck className="w-3 h-3 text-emerald-500" /> Dados Criptografados
        </span>
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-emerald-500" /> Resposta 24h
        </span>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-3 bg-slate-800/50 text-slate-300 rounded-xl font-medium text-sm hover:bg-slate-700 transition border border-white/5"
        >
          Voltar
        </button>
        <button
          type="submit"
          className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-900 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 group"
        >
          Quero ser embaixador <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </form>
  )
}

function Step3Loading({ phase }: { phase: number }) {
  return (
    <div className="text-center py-10 space-y-6">
      <div className="relative inline-block">
        <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-500 w-6 h-6 animate-pulse" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-white">Quase lá...</h3>
        <div className="space-y-1.5 max-w-xs mx-auto">
          {PHASES.map((p, i) => {
            const Icon = p.icon
            return (
              <div
                key={i}
                className={`flex items-center gap-2 text-xs transition-all ${
                  i <= phase ? 'text-emerald-400' : 'text-slate-600'
                }`}
              >
                {i < phase ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                {p.text}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function SuccessState({
  whatsappGroupUrl,
  isLoggedPartner,
}: {
  whatsappGroupUrl: string
  isLoggedPartner: boolean
}) {
  return (
    <div className="text-center space-y-4 py-2">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/20 rounded-full text-emerald-500">
        <CheckCircle2 className="w-10 h-10" />
      </div>
      <div>
        <h3 className="text-xl font-black text-white mb-1">Cadastro enviado.</h3>
        <p className="text-emerald-300 text-[10px] font-bold uppercase tracking-widest">
          Análise concluída
        </p>
      </div>
      <p className="text-sm text-slate-400 max-w-md mx-auto">
        Nosso time entra em contato em até 24h via WhatsApp. Enquanto isso, entre no grupo
        oficial.
      </p>

      <a
        href={whatsappGroupUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 rounded-xl font-bold hover:from-emerald-400 hover:to-cyan-400 transition-all"
      >
        Entrar no grupo agora
      </a>

      <div className="flex flex-col sm:flex-row gap-2 pt-2">
        {isLoggedPartner ? (
          <Link
            href="/embaixador/dashboard"
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium text-sm transition"
          >
            Acessar dashboard <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        ) : (
          <Link
            href="/cadastro-embaixador"
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium text-sm transition"
          >
            Criar conta <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
        <a
          href="#simulador"
          className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium text-sm transition"
        >
          Voltar ao simulador
        </a>
      </div>
    </div>
  )
}
