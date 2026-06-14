'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Zap, ShieldCheck, ArrowRight, CheckCircle2, Clock,
  TrendingUp, Globe, Gift,
  Loader2, Menu, X, AlertTriangle, Mail, ChevronDown, ChevronUp,
  Sparkles, BookOpen, Copy, Check,
  Coins, CreditCard, Info, Shield, Activity, Lock,
} from 'lucide-react';
import {
  TOKEN_LAUNCH_DATE, formatBRL,
  KWATT_CONTRACT_ADDRESS, KWATT_DEPLOY_STATUS,
} from '@/lib/tokenomics';

type Countdown = { days: number; hours: number; minutes: number; seconds: number }

function getCountdown(target: Date): Countdown {
  const diff = target.getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  }
}

const bgAccent: Record<string, string> = {
  emerald: 'bg-emerald-500/10',
  amber: 'bg-amber-500/10',
  pink: 'bg-pink-500/10',
  cyan: 'bg-cyan-500/10',
}
const textAccent: Record<string, string> = {
  emerald: 'text-emerald-400',
  amber: 'text-amber-400',
  pink: 'text-pink-400',
  cyan: 'text-cyan-400',
}
const borderAccent: Record<string, string> = {
  emerald: 'border-emerald-500/20',
  amber: 'border-amber-500/20',
  pink: 'border-pink-500/20',
  cyan: 'border-cyan-500/20',
}

const USE_CASES = [
  { icon: 'Zap', title: 'Abater sua conta de energia', desc: 'Converta Moeda Energia em descontos diretos na sua fatura de luz. Cada crédito vale R$ 0,95 de abatimento.', color: 'emerald' },
  { icon: 'TrendingUp', title: 'Cashback de até 12%', desc: 'Quanto mais usa a plataforma, mais Moeda Energia acumula de volta como cashback sobre o valor pago.', color: 'amber' },
  { icon: 'Gift', title: 'Indique amigos e ganhe', desc: 'Compartilhe seu link. Cada amigo que comprar Moeda Energia rende bônus para os dois. Sem limite.', color: 'pink' },
  { icon: 'Globe', title: 'Marketplace EnergiaLivre', desc: 'Use créditos para comprar equipamentos, assinar planos de energia solar e contratar serviços.', color: 'cyan' },
]

const USE_CASE_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap, TrendingUp, Gift, Globe,
}

const STEPS = [
  { step: '01', icon: <CreditCard className="w-5 h-5" />, title: 'Compre créditos', desc: 'Escolha o valor e pague com Stripe. Aceitamos cartão de crédito e boleto.', color: 'amber' },
  { step: '02', icon: <Zap className="w-5 h-5" />, title: 'Receba na hora', desc: 'Saldo creditado automaticamente na sua conta. Use imediatamente sem burocracia.', color: 'emerald' },
  { step: '03', icon: <Coins className="w-5 h-5" />, title: 'Use e economize', desc: 'Abata faturas, acumule cashback e compre no marketplace. Tudo com Moeda Energia.', color: 'cyan' },
]

const FAQS = [
  { q: 'O que é Moeda Energia?', a: 'Moeda Energia é um crédito interno do ecossistema EnergiaLivre. Você compra com dinheiro via Stripe e usa para abater faturas de energia, acumular cashback e comprar no marketplace. Não é criptomoeda nem investimento.' },
  { q: 'Qual a diferença entre Moeda Energia e KWATT Token?', a: `Moeda Energia é o crédito interno que funciona hoje, comprado com cartão via Stripe e usado imediatamente. O KWATT é a versão blockchain desse crédito, com lançamento previsto para ${TOKEN_LAUNCH_DATE.toLocaleDateString('pt-BR')}. Até lá, a Moeda Energia já está disponível.` },
  { q: 'Como comprar Moeda Energia?', a: 'Acesse a seção "Comprar" nesta página. O pagamento é processado pela Stripe (cartão ou boleto). Os créditos são liberados na hora na sua conta EnergiaLivre.' },
  { q: 'Como usar para pagar minha fatura?', a: 'Na plataforma EnergiaLivre, selecione "Pagar com Moeda Energia" ao visualizar sua fatura. 1 Moeda Energia = R$ 0,95 de abatimento.' },
  { q: 'Preciso de carteira blockchain?', a: 'Não. Moeda Energia é crédito interno da plataforma. Você só precisa de uma conta EnergiaLivre. Carteira EVM será necessária apenas para o KWATT on-chain futuramente.' },
  { q: 'E se eu me arrepender da compra?', a: 'Conforme CDC art. 49, você tem 7 dias para solicitar reembolso integral. Basta abrir ticket em suporte@energialivre.dev.br com o e-mail da compra.' },
]

export default function TokenPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [submitMessage, setSubmitMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [legalExpanded, setLegalExpanded] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [timeToLaunch, setTimeToLaunch] = useState<Countdown>({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [copied, setCopied] = useState(false)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const update = () => setTimeToLaunch(getCountdown(TOKEN_LAUNCH_DATE))
    update()
    intervalRef.current = setInterval(update, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  const handleInterestSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitMessage(null)
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRe.test(email)) {
      setSubmitMessage({ type: 'err', text: 'E-mail invalido.' })
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/token/pre-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, interest: 'kwatt-future' }),
      })
      const body = await res.json()
      if (!res.ok) {
        setSubmitMessage({ type: 'err', text: body.error || 'Erro ao registrar.' })
      } else {
        setSubmitMessage({ type: 'ok', text: body.message || 'Cadastro confirmado!' })
      }
    } catch {
      setSubmitMessage({ type: 'err', text: 'Erro de rede' })
    } finally {
      setSubmitting(false)
    }
  }

  const copyReferral = async () => {
    try {
      const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/token?ref=ENERGIALIVRE`
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* ignore */ }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans overflow-x-hidden">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent -z-20" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] -z-10" />
      <div className="fixed top-40 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] -z-10" />

      <nav className="border-b border-white/10 bg-[#020617]/80 backdrop-blur-xl fixed top-0 w-full z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-amber-500 to-yellow-400 rounded-lg flex items-center justify-center">
              <Coins className="text-slate-900 w-4 h-4" />
            </div>
            <span className="text-lg font-black text-white">EnergiaLivre</span>
            <span className="hidden sm:inline text-[10px] text-slate-500 ml-1">Moeda Energia</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <a href="#o-que-e" className="text-slate-400 hover:text-white transition">O que é</a>
            <a href="#usos" className="text-slate-400 hover:text-white transition">Usos</a>
            <a href="#comprar" className="text-slate-400 hover:text-white transition">Comprar</a>
            <a href="#roadmap" className="text-slate-400 hover:text-white transition">KWATT</a>
            <a href="#faq" className="text-slate-400 hover:text-white transition">FAQ</a>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden sm:inline text-sm text-slate-300 hover:text-white px-3 py-1.5">Entrar</Link>
            <a href="#comprar" className="text-sm bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-lg px-3 py-1.5 flex items-center gap-1">
              Comprar <ArrowRight className="w-3.5 h-3.5" />
            </a>
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 px-6 py-3 space-y-2">
            <a href="#o-que-e" className="block text-sm text-slate-300">O que é</a>
            <a href="#usos" className="block text-sm text-slate-300">Usos</a>
            <a href="#comprar" className="block text-sm text-slate-300">Comprar</a>
            <a href="#roadmap" className="block text-sm text-slate-300">KWATT</a>
            <a href="#faq" className="block text-sm text-slate-300">FAQ</a>
          </div>
        )}
      </nav>

      {/* Legal Disclaimer Button (floating) */}
      <div className="fixed top-16 right-4 z-30">
        <button
          onClick={() => setLegalExpanded(!legalExpanded)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold hover:bg-amber-500/25 transition shadow-lg backdrop-blur-sm"
        >
          <AlertTriangle className="w-3 h-3" />
          <span className="hidden sm:inline">Legal</span>
        </button>
        {legalExpanded && (
          <div className="absolute top-10 right-0 w-80 p-4 rounded-xl bg-slate-900 border border-amber-500/30 shadow-2xl backdrop-blur-xl z-50">
            <div className="flex items-start gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-200 leading-relaxed">
                <strong>Crédito interno</strong> — Moeda Energia é crédito de uso interno na plataforma EnergiaLivre.
                Não é valor mobiliário, criptomoeda nem investimento.
                {KWATT_DEPLOY_STATUS === 'not_deployed' && (
                  <> · <strong>KWATT on-chain:</strong> token será publicado em {TOKEN_LAUNCH_DATE.toLocaleDateString('pt-BR')}.</>
                )}
              </p>
            </div>
            <button onClick={() => setLegalExpanded(false)} className="mt-2 text-[10px] text-amber-400 hover:underline">
              Fechar
            </button>
          </div>
        )}
      </div>

      <main className="pt-32 pb-12 px-6">
        {/* HERO */}
        <section className="max-w-6xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-black text-emerald-300 uppercase tracking-wider mb-6">
            <Sparkles className="w-3 h-3" /> Disponível agora - pague com Stripe
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.05] mb-4">
            Créditos de energia que<br />
            <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
              cabem no seu bolso
            </span>
          </h1>

          <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto mb-8">
            <strong className="text-white">Moeda Energia</strong> é o crédito interno do ecossistema EnergiaLivre.
            Compre agora com cartão de crédito via <strong className="text-amber-400">Stripe</strong> e use imediatamente
            para abater sua fatura de energia, acumular cashback e muito mais.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap mb-8">
            <Kvp icon={<Zap className="w-4 h-4" />} label="Abate na fatura" accent="emerald" />
            <Kvp icon={<TrendingUp className="w-4 h-4" />} label="Cashback" accent="amber" />
            <Kvp icon={<Gift className="w-4 h-4" />} label="Indique e ganhe" accent="pink" />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a href="#comprar" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-900 font-black transition shadow-lg shadow-amber-500/20">
              <CreditCard className="w-4 h-4" /> Comprar Moeda Energia
            </a>
            <a href="#o-que-e" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition">
              <BookOpen className="w-4 h-4" /> Entender melhor
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] text-slate-500">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> LGPD compliant</span>
            <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Stripe secure</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Uso imediato</span>
            <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> Lei 14.478/2022</span>
          </div>
        </section>

        {/* O QUE E MOEDA ENERGIA */}
        <section id="o-que-e" className="max-w-4xl mx-auto mt-24">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3">O que é Moeda Energia?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Um crédito interno que você compra com dinheiro de verdade e usa para economizar na conta de luz.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center">
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 flex items-center justify-center mx-auto mb-3">
                <CreditCard className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Compra simples</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pague com cartão de crédito ou boleto via Stripe. Sem burocracia, sem blockchain.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Uso imediato</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Créditos liberados na hora. Use para abater faturas, acumular cashback e comprar no marketplace.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/15 flex items-center justify-center mx-auto mb-3">
                <Coins className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Preço justo</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                1 Moeda Energia = R$ 0,95 de abatimento na fatura. Sem taxas escondidas, sem surpresas.
              </p>
            </div>
          </div>
        </section>

        {/* USE CASES */}
        <section id="usos" className="max-w-6xl mx-auto mt-24">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3">O que você pode fazer hoje</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Utilidade real desde o primeiro crédito. Moeda Energia funciona agora, sem esperar.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {USE_CASES.map((uc) => {
              const Icon = USE_CASE_ICON_MAP[uc.icon] ?? Zap
              const bg = bgAccent[uc.color] || 'bg-amber-500/10'
              const text = textAccent[uc.color] || 'text-amber-400'
              return (
                <div
                  key={uc.title}
                  className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition"
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${bg}`}>
                    <Icon className={`w-5 h-5 ${text}`} />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">{uc.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{uc.desc}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* COMO FUNCIONA */}
        <section className="max-w-6xl mx-auto mt-24">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3">Como funciona</h2>
            <p className="text-slate-400">3 passos simples. Sem instalação, sem complicação.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {STEPS.map((s) => {
              const bg = bgAccent[s.color] || 'bg-amber-500/10'
              const text = textAccent[s.color] || 'text-amber-400'
              return (
                <div key={s.step} className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bg}`}>
                      <span className={text}>{s.icon}</span>
                    </div>
                    <span className={`text-[10px] font-black ${text} uppercase`}>Passo {s.step}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{s.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* BUY CTA */}
        <section id="comprar" className="max-w-3xl mx-auto mt-24">
          <div className="p-8 rounded-2xl bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-amber-500/5 border border-amber-500/20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-7 h-7 text-amber-400" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-2">Comprar Moeda Energia</h2>
            <p className="text-sm text-slate-300 mb-6 max-w-md mx-auto">
               Pague com cartão de crédito ou boleto via Stripe. Créditos liberados na hora, sem taxa de adesão.
            </p>
            <a
              href="/checkout/moeda-energia"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-900 font-black text-lg transition shadow-lg shadow-amber-500/20"
            >
              <CreditCard className="w-5 h-5" /> Comprar agora
            </a>
            <p className="text-[10px] text-slate-500 mt-3">
              Pagamento processado por Stripe. Ambiente seguro e criptografado.
            </p>
          </div>
        </section>

        {/* REFERRAL */}
        <section className="max-w-3xl mx-auto mt-16">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-pink-500/10 to-amber-500/10 border border-pink-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-5 h-5 text-pink-400" />
              <h3 className="text-lg font-bold text-white">Indique e ganhe Moeda Energia</h3>
            </div>
            <p className="text-sm text-slate-300 mb-4">
              Compartilhe seu link de indicação. Cada amigo que comprar Moeda Energia rende um bonus para vocês dois.
              Sem limite de indicações.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={`https://energialivre.dev.br/token?ref=ENERGIALIVRE`}
                className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white font-mono"
              />
              <button
                onClick={copyReferral}
                className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          </div>
        </section>

        {/* KWATT TOKEN ROADMAP */}
        <section id="roadmap" className="max-w-4xl mx-auto mt-24">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-black text-cyan-300 uppercase tracking-wider mb-4">
              <Clock className="w-3 h-3" /> Roadmap
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3">KWATT Token - versão on-chain</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              O KWATT é a versão blockchain da Moeda Energia. Enquanto isso, a Moeda Energia já funciona como crédito interno.
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 mb-10">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mr-2">Lançamento KWATT:</div>
            <CountdownBox value={timeToLaunch.days} label="dias" />
            <span className="text-cyan-400">:</span>
            <CountdownBox value={timeToLaunch.hours} label="h" />
            <span className="text-cyan-400">:</span>
            <CountdownBox value={timeToLaunch.minutes} label="min" />
            <span className="text-cyan-400">:</span>
            <CountdownBox value={timeToLaunch.seconds} label="seg" />
          </div>

          <div className="space-y-3">
            {[
              { icon: <Activity className="w-4 h-4" />, label: 'Desenvolvimento do contrato', date: 'Q2 2026', desc: 'Contrato inteligente ERC-20 com funcionalidades de utilidade.', status: 'active' },
              { icon: <CheckCircle2 className="w-4 h-4" />, label: 'Auditoria externa', date: 'Q3-Q4 2026', desc: 'Revisão por empresa independente de segurança blockchain.', status: 'done' },
              { icon: <Clock className="w-4 h-4" />, label: 'Lançamento oficial', date: '25/01/2027', desc: 'Tokens liberados na rede Polygon. Integração com a plataforma EnergiaLivre.', status: 'next' },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  step.status === 'active' ? 'bg-amber-500/20 text-amber-400' :
                  step.status === 'done' ? 'bg-emerald-500/20 text-emerald-400' :
                  'bg-white/5 text-slate-500'
                }`}>
                  {step.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-sm font-bold text-white">{step.label}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{step.date}</span>
                  </div>
                  <p className="text-xs text-slate-400">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <details className="mt-6 group">
            <summary className="text-xs text-slate-500 hover:text-slate-300 cursor-pointer flex items-center gap-1">
              <Info className="w-3 h-3" /> Detalhes do contrato inteligente
            </summary>
            <div className="mt-3 p-4 rounded-xl bg-slate-900 border border-white/10">
              <p className="text-[11px] text-slate-400 mb-2">Endereço do futuro contrato (placeholder):</p>
              <code className="text-[11px] text-cyan-300 font-mono break-all block bg-slate-950 p-2 rounded border border-white/5">
                {KWATT_CONTRACT_ADDRESS}
              </code>
              <p className="text-[10px] text-slate-500 mt-2">
                Token ERC-20 na rede Polygon PoS (Chain ID 137). Contrato será auditado antes do lançamento.
              </p>
            </div>
          </details>

          <div className="mt-6 p-5 rounded-xl bg-white/5 border border-white/10">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4 text-cyan-400" /> Quer saber quando o KWATT lançar?
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              Cadastre-se para receber novidades sobre o token on-chain KWATT.
            </p>
            <form onSubmit={handleInterestSubmit} className="flex items-center gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
              />
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold text-xs flex items-center gap-1 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <ArrowRight className="w-3 h-3" />}
                {submitting ? 'Enviando' : 'Cadastrar'}
              </button>
            </form>
            {submitMessage && (
              <div className={`mt-2 p-2 rounded text-[11px] ${
                submitMessage.type === 'ok'
                  ? 'bg-emerald-500/10 text-emerald-200'
                  : 'bg-red-500/10 text-red-200'
              }`}>
                {submitMessage.text}
              </div>
            )}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="max-w-3xl mx-auto mt-24">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3">Perguntas frequentes</h2>
          </div>

          <div className="space-y-2">
            {FAQS.map((item, i) => (
              <button
                key={i}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full text-left p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-bold text-white">{item.q}</span>
                  {openFaq === i ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                </div>
                {openFaq === i && (
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{item.a}</p>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* LEGAL DISCLAIMER */}
        <section className="max-w-4xl mx-auto mt-16">
          <div className="rounded-2xl bg-amber-500/5 border border-amber-500/20 overflow-hidden">
            <button
              onClick={() => setLegalExpanded(!legalExpanded)}
              className="w-full px-5 py-3 flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-bold text-amber-100">Disclaimers legais</span>
              </div>
              {legalExpanded ? <ChevronUp className="w-4 h-4 text-amber-400" /> : <ChevronDown className="w-4 h-4 text-amber-400" />}
            </button>
            {legalExpanded && (
              <div className="px-5 pb-5 space-y-3 text-[11px] text-amber-100/80 leading-relaxed">
                <p>
                  <strong>1. Natureza do crédito.</strong> Moeda Energia é um crédito interno de uso exclusivo na plataforma
                  EnergiaLivre. NÃO é valor mobiliário, NÃO é criptomoeda, NÃO é investimento. Não confere direitos de
                  participação societária, voto ou distribuição de lucros.
                </p>
                <p>
                  <strong>2. Sem promessa de valorização.</strong> Moeda Energia não se valoriza com o tempo. Seu valor
                  é fixo: 1 Moeda Energia = R$ 0,95 em créditos na plataforma. Não há expectativa de retorno financeiro.
                </p>
                <p>
                  <strong>3. Riscos.</strong> Créditos internos estão sujeitos a continuidade operacional da plataforma.
                  Consulte os termos de uso para detalhes sobre limitações e condições.
                </p>
                <p>
                  <strong>4. Direito de arrependimento.</strong> Conforme CDC art. 49, você pode cancelar a compra em
                  até 7 dias corridos a partir do pagamento, com reembolso integral do valor pago.
                </p>
                <p>
                  <strong>5. KWATT Token.</strong> O KWATT on-chain é um token de utilidade nos termos da Lei 14.478/2022.
                  Seu contrato inteligente será auditado antes do lançamento. KYC será exigido conforme regulamentação.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>© 2026 EnergiaLivre · Moeda Energia · Lei 14.478/2022</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/regulamentacao" className="hover:text-white">Regulamentacao</Link>
            <Link href="/termos" className="hover:text-white">Termos</Link>
            <a href="mailto:suporte@energialivre.dev.br" className="hover:text-white flex items-center gap-1">
              <Mail className="w-3 h-3" /> Suporte
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ============================================
// HELPER COMPONENTS
// ============================================

function CountdownBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="min-w-[56px] px-2 py-1.5 rounded-lg bg-slate-900/80 border border-white/10 text-center">
      <div className="text-lg font-black text-white leading-none tabular-nums">{value.toString().padStart(2, '0')}</div>
      <div className="text-[9px] text-slate-500 uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  )
}

function Kvp({ icon, label, accent }: { icon: React.ReactNode; label: string; accent?: string }) {
  const bg = bgAccent[accent ?? ''] || 'bg-amber-500/10'
  const border = borderAccent[accent ?? ''] || 'border-amber-500/20'
  const text = textAccent[accent ?? ''] || 'text-amber-400'
  return (
    <div className={`p-3 rounded-xl ${bg} ${border} flex items-center gap-2`}>
      <span className={text}>{icon}</span>
      <span className="text-xs font-bold text-white">{label}</span>
    </div>
  )
}
