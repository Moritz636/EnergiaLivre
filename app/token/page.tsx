'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import {
  Zap, ShieldCheck, ArrowRight, CheckCircle2, Clock, Crown,
  Users, TrendingUp, BatteryCharging, Sun, Car, Globe, Wallet,
  Gift, Star, Loader2, Menu, X, ExternalLink, BarChart3, Rocket,
  Lock, Coins, Activity, AlertTriangle, Mail, ChevronDown, ChevronUp,
  Smartphone, Banknote, TrendingDown, Award, Sparkles, BookOpen,
  Repeat, Shield, FileCheck, Calendar, Copy, Check, Info, Flame
} from 'lucide-react';
import {
  TOKEN_PACKAGES, TOKEN_LAUNCH_DATE, PRESALE_END_DATE, KWATT_UNIT_PRICE,
  KWH_REFERENCE_PRICE, KWATT_TO_KWH_RATIO, TOKEN_TOTAL_SUPPLY, TOKEN_DISTRIBUTION,
  TOKEN_USE_CASES, getFinalPrice, getTotalTokens, formatBRL, formatTokens,
  KWATT_CONTRACT_ADDRESS, KWATT_DEPLOY_STATUS, KWATT_EXPLORER_URL
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

const USE_CASE_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap, Smartphone, TrendingUp, Gift, Shield, Globe,
}

export default function TokenPresalePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [buyPackage, setBuyPackage] = useState<typeof TOKEN_PACKAGES[number] | null>(null)
  const [email, setEmail] = useState('')
  const [walletAddress, setWalletAddress] = useState('')
  const [acceptedLgpd, setAcceptedLgpd] = useState(false)
  const [acceptedRisk, setAcceptedRisk] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [legalExpanded, setLegalExpanded] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [timeToLaunch, setTimeToLaunch] = useState<Countdown>({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [timeToPresaleEnd, setTimeToPresaleEnd] = useState<Countdown>({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [copied, setCopied] = useState(false)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const referralCode = 'KWATT-LAUNCH' // pode ser dinâmico via query param

  useEffect(() => {
    const update = () => {
      setTimeToLaunch(getCountdown(TOKEN_LAUNCH_DATE))
      setTimeToPresaleEnd(getCountdown(PRESALE_END_DATE))
    }
    update()
    intervalRef.current = setInterval(update, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const handleBuy = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitMessage(null)
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRe.test(email)) {
      setSubmitMessage({ type: 'err', text: 'E-mail inválido.' })
      return
    }
    if (!acceptedLgpd) {
      setSubmitMessage({ type: 'err', text: 'É necessário aceitar os termos de privacidade.' })
      return
    }
    if (!acceptedRisk) {
      setSubmitMessage({ type: 'err', text: 'É necessário confirmar ciência dos riscos.' })
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/token/pre-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          walletAddress: walletAddress || undefined,
          packageCode: buyPackage?.code,
          referredByCode: referralCode,
          utmSource: 'landing',
          utmMedium: 'organic',
          utmCampaign: 'token-presale',
        }),
      })
      const body = await res.json()
      if (!res.ok) {
        setSubmitMessage({ type: 'err', text: body.error || 'Erro ao registrar.' })
      } else {
        setSubmitMessage({ type: 'ok', text: body.message || 'Pré-registro confirmado!' })
      }
    } catch (err: any) {
      setSubmitMessage({ type: 'err', text: err?.message || 'Erro de rede' })
    } finally {
      setSubmitting(false)
    }
  }

  const copyReferral = async () => {
    try {
      const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/token?ref=${referralCode}`
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans overflow-x-hidden">
      {/* BG Decorations */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent -z-20" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] -z-10" />
      <div className="fixed top-40 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] -z-10" />

      {/* Header */}
      <nav className="border-b border-white/10 bg-[#020617]/80 backdrop-blur-xl fixed top-0 w-full z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-amber-500 to-yellow-400 rounded-lg flex items-center justify-center">
              <Coins className="text-slate-900 w-4 h-4" />
            </div>
            <span className="text-lg font-black text-white">KWATT</span>
            <span className="hidden sm:inline text-[10px] text-slate-500 ml-1">Token de Utilidade</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <a href="#use-cases" className="text-slate-400 hover:text-white transition">Usos</a>
            <a href="#tokenomics" className="text-slate-400 hover:text-white transition">Tokenomics</a>
            <a href="#packages" className="text-slate-400 hover:text-white transition">Pacotes</a>
            <a href="#roadmap" className="text-slate-400 hover:text-white transition">Roadmap</a>
            <a href="#faq" className="text-slate-400 hover:text-white transition">FAQ</a>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden sm:inline text-sm text-slate-300 hover:text-white px-3 py-1.5">Entrar</Link>
            <a href="#packages" className="text-sm bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-lg px-3 py-1.5 flex items-center gap-1">
              Reservar <ArrowRight className="w-3.5 h-3.5" />
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
            <a href="#use-cases" className="block text-sm text-slate-300">Usos</a>
            <a href="#tokenomics" className="block text-sm text-slate-300">Tokenomics</a>
            <a href="#packages" className="block text-sm text-slate-300">Pacotes</a>
            <a href="#roadmap" className="block text-sm text-slate-300">Roadmap</a>
            <a href="#faq" className="block text-sm text-slate-300">FAQ</a>
          </div>
        )}
      </nav>

      {/* Legal Disclaimer Banner */}
      <div className="fixed top-16 inset-x-0 z-30 bg-amber-500/10 border-b border-amber-500/20">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <p className="text-[11px] text-amber-200 leading-tight">
            <strong>Token de utilidade</strong> — Não é valor mobiliário. Não há promessa de valorização. Lei 14.478/2022.
            {KWATT_DEPLOY_STATUS === 'not_deployed' && (
              <> · <strong>Status on-chain:</strong> pre-deploy (contrato sera publicado em 05/01/2027).</>
            )}
          </p>
        </div>
      </div>

      <main className="pt-32 pb-12 px-6">
        {/* HERO */}
        <section className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-black text-amber-300 uppercase tracking-wider mb-6">
            <Sparkles className="w-3 h-3" /> Pré-venda aberta até {PRESALE_END_DATE.toLocaleDateString('pt-BR')}
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.05] mb-4">
            A moeda digital da<br />
            <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
              sua conta de luz
            </span>
          </h1>

          <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto mb-8">
            <strong className="text-white">KWATT</strong> é o token utilitário que paga sua fatura de energia,
            recarrega seu celular, dá cashback e ainda financia a transição energética.
            1 KWATT = 30% de 1 kWh. <span className="text-amber-400 font-bold">Use onde quiser.</span>
          </p>

          {/* Countdown */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mr-2">Lançamento:</div>
            <CountdownBox value={timeToLaunch.days} label="dias" />
            <span className="text-amber-400">:</span>
            <CountdownBox value={timeToLaunch.hours} label="h" />
            <span className="text-amber-400">:</span>
            <CountdownBox value={timeToLaunch.minutes} label="min" />
            <span className="text-amber-400">:</span>
            <CountdownBox value={timeToLaunch.seconds} label="seg" />
          </div>

          {/* KVPs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto mb-8">
            <Kvp icon={<Zap className="w-4 h-4" />} label="Paga fatura" accent="emerald" />
            <Kvp icon={<Smartphone className="w-4 h-4" />} label="Recarga celular" accent="cyan" />
            <Kvp icon={<TrendingDown className="w-4 h-4" />} label="Até 12% cashback" accent="amber" />
            <Kvp icon={<Gift className="w-4 h-4" />} label="Indicação KWATT" accent="pink" />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a href="#packages" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-900 font-black transition shadow-lg shadow-amber-500/20">
              <Rocket className="w-4 h-4" /> Reservar pacote
            </a>
            <a href="#use-cases" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition">
              <BookOpen className="w-4 h-4" /> Ver utilidades
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] text-slate-500">
            <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> LGPD compliant</span>
            <span className="flex items-center gap-1"><FileCheck className="w-3 h-3" /> KYC leve</span>
            <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Carteira 0x (EVM)</span>
            <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> Lei 14.478/2022</span>
          </div>
        </section>

        {/* USE CASES */}
        <section id="use-cases" className="max-w-6xl mx-auto mt-24">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
              O que o KWATT faz por você
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Utilidade real desde o dia 1. Cada KWATT tem função concreta na plataforma EnergiaLivre.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TOKEN_USE_CASES.map((uc) => {
              const Icon = USE_CASE_ICON_MAP[uc.icon] ?? Zap
              return (
                <div
                  key={uc.title}
                  className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition"
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 bg-${uc.color}-500/15`}>
                    <Icon className={`w-5 h-5 text-${uc.color}-400`} />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">{uc.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{uc.description}</p>
                </div>
              )
            })}
          </div>

          <div className="mt-8 p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20 text-center">
            <p className="text-sm text-amber-100">
              <Sparkles className="w-4 h-4 inline" /> <strong>Conversão fixa:</strong> 1 KWATT = {(KWATT_TO_KWH_RATIO * 100).toFixed(0)}% de 1 kWh (R$ {KWH_REFERENCE_PRICE.toFixed(2)}/kWh ANEEL).
              <br />
              <span className="text-[11px] text-amber-200/70">Preço unitário base: R$ {KWATT_UNIT_PRICE.toFixed(3)} por KWATT. Use no app para abater consumo real.</span>
            </p>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="max-w-6xl mx-auto mt-24">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
              Como funciona
            </h2>
            <p className="text-slate-400">3 passos simples. Sem instalação, sem complicação.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              { step: '01', icon: <Coins className="w-5 h-5" />, title: 'Reserve KWATT', desc: 'Escolha um pacote e confirme seu pré-registro. Seu saldo fica travado até o lançamento.', color: 'amber' },
              { step: '02', icon: <Rocket className="w-5 h-5" />, title: 'Receba em 05/01/2027', desc: 'Tokens são liberados na sua carteira EVM (MetaMask, Rabby, etc) no dia do lançamento.', color: 'emerald' },
              { step: '03', icon: <Zap className="w-5 h-5" />, title: 'Use no ecossistema', desc: 'Pague fatura, faça recargas, ganhe cashback, indique amigos. Quanto mais usa, mais ganha.', color: 'cyan' },
            ].map((s) => (
              <div key={s.step} className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-${s.color}-500/15`}>
                    <span className={`text-${s.color}-400`}>{s.icon}</span>
                  </div>
                  <span className={`text-[10px] font-black text-${s.color}-400 uppercase`}>Passo {s.step}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{s.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* TOKENOMICS */}
        <section id="tokenomics" className="max-w-6xl mx-auto mt-24">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3">Tokenomics</h2>
            <p className="text-slate-400">Supply fixo de {formatTokens(TOKEN_TOTAL_SUPPLY)} KWATT. Sem emissão extra. Sem mint surpresa.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-400" /> Distribuição
              </h3>
              <div className="space-y-2">
                {TOKEN_DISTRIBUTION.map((d) => (
                  <div key={d.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">{d.label}</span>
                      <span className={`font-bold text-${d.color}-400`}>{d.percent.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r from-${d.color}-500 to-${d.color}-400`}
                        style={{ width: `${d.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 mt-4">
                * Valores de alocação preliminares. Contrato inteligente auditado antes do lançamento.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" /> Mecanismos
              </h3>
              <MechanismRow
                icon={<Flame className="w-4 h-4" />}
                title="Queima deflationária"
                desc="1% de toda transação é queimada. Quanto mais uso, menor o supply circulante."
              />
              <MechanismRow
                icon={<Repeat className="w-4 h-4" />}
                title="Staking 8-15% a.a."
                desc="Trave tokens de 30-365 dias e receba rewards em KWATT + parte das fees."
              />
              <MechanismRow
                icon={<Vote className="w-4 h-4" />}
                title="Governança DAO"
                desc="1 KWATT = 1 voto. Decida ajustes de fees, novos casos de uso e parcerias."
              />
              <MechanismRow
                icon={<ShieldCheck className="w-4 h-4" />}
                title="Auditoria on-chain"
                desc="Contrato open-source, auditoria externa antes do mainnet, multisig de 5/9 para mudanças críticas."
              />
            </div>
          </div>
        </section>

        {/* PACKAGES */}
        <section id="packages" className="max-w-6xl mx-auto mt-24">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3">Escolha seu pacote</h2>
            <p className="text-slate-400">Descontos progressivos + bônus de pré-venda + bônus por indicação.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {TOKEN_PACKAGES.map((pkg) => {
              const finalPrice = getFinalPrice(pkg)
              const totalTokens = getTotalTokens(pkg)
              return (
                <div
                  key={pkg.code}
                  className={`relative p-5 rounded-2xl border ${
                    pkg.popular
                      ? 'bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border-amber-500/40'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-amber-500 text-slate-900 text-[9px] font-black uppercase">
                      Mais popular
                    </div>
                  )}
                  <h3 className="text-sm font-black text-white uppercase mb-1">{pkg.code}</h3>
                  <p className="text-[10px] text-slate-500 mb-3">{pkg.description}</p>
                  <div className="mb-3">
                    <div className="text-3xl font-black text-white">
                      {formatTokens(pkg.tokens)}
                      <span className="text-xs text-slate-500 ml-1">KWATT</span>
                    </div>
                    {pkg.bonus > 0 && (
                      <div className="text-[10px] text-emerald-400 font-bold">+ {formatTokens(pkg.bonus)} bônus</div>
                    )}
                  </div>
                  <div className="mb-3 text-xs">
                    <div className="text-slate-500 line-through">{formatBRL(pkg.basePrice)}</div>
                    <div className="text-lg font-black text-amber-400">{formatBRL(finalPrice)}</div>
                    {pkg.discount > 0 && (
                      <div className="text-[10px] text-emerald-400 font-bold">-{pkg.discount}% off</div>
                    )}
                  </div>
                  {pkg.referralBonus > 0 && (
                    <div className="text-[10px] text-pink-300 mb-3 flex items-center gap-1">
                      <Gift className="w-3 h-3" /> +{pkg.referralBonus} KWATT por indicação
                    </div>
                  )}
                  <button
                    onClick={() => setBuyPackage(pkg)}
                    className={`w-full py-2.5 rounded-lg text-sm font-bold transition ${
                      pkg.popular
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-slate-900'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    Reservar
                  </button>
                </div>
              )
            })}
          </div>

          <p className="text-center text-[11px] text-slate-500 mt-4">
            Total de tokens com bônus: <strong className="text-white">{formatTokens(TOKEN_PACKAGES.reduce((s, p) => s + p.tokens + p.bonus, 0))} KWATT</strong> disponíveis na pré-venda.
          </p>
        </section>

        {/* REFERRAL */}
        <section className="max-w-3xl mx-auto mt-16">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-pink-500/10 to-amber-500/10 border border-pink-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-5 h-5 text-pink-400" />
              <h3 className="text-lg font-bold text-white">Programa de indicação KWATT</h3>
            </div>
            <p className="text-sm text-slate-300 mb-4">
              Indique amigos e ganhe tokens extras a cada cadastro confirmado. Limite de 50 indicados/semana, sem teto de ganhos totais.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={`https://energialivre.dev.br/token?ref=${referralCode}`}
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

        {/* ROADMAP */}
        <section id="roadmap" className="max-w-4xl mx-auto mt-24">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3">Roadmap</h2>
            <p className="text-slate-400">Construção contínua, marcos públicos, sem promessas vagas.</p>
          </div>

          <div className="space-y-3">
            {[
              { date: 'Q2 2026', label: 'Pré-venda + auditoria', status: 'active', desc: 'Captação pública, smart contract auditado por empresa independente' },
              { date: 'Q3 2026', label: 'Listagem pré-venda', status: 'done', desc: 'DEX listing com liquidez travada, KYC opcional para lifts' },
              { date: 'Q4 2026', label: 'Staking v1', status: 'done', desc: 'Pools de 30/90/180/365 dias com rewards 8-15% a.a.' },
              { date: '05/01/2027', label: 'Lançamento oficial + airdrop', status: 'next', desc: 'Tokens liberados para carteiras de pré-registro. Mainnet público.' },
              { date: 'Q1 2027', label: 'Pagamento de faturas on-chain', status: 'next', desc: 'Smart contract integrado com a plataforma EnergiaLivre' },
              { date: 'Q2 2027', label: 'Recargas de celular via token', status: 'next', desc: 'Integração com provedor + cashback em KWATT' },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  step.status === 'active' ? 'bg-amber-500/20 text-amber-400' :
                  step.status === 'done' ? 'bg-emerald-500/20 text-emerald-400' :
                  'bg-white/5 text-slate-500'
                }`}>
                  {step.status === 'active' ? <Activity className="w-4 h-4" /> :
                   step.status === 'done' ? <CheckCircle2 className="w-4 h-4" /> :
                   <Clock className="w-4 h-4" />}
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
        </section>

        {/* ON-CHAIN STATUS */}
        <section id="onchain" className="max-w-6xl mx-auto mt-24">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-black text-cyan-300 uppercase tracking-wider mb-4">
              <Activity className="w-3 h-3" /> On-chain transparente
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3">Contrato inteligente KWATT</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Token ERC-20 (Polygon PoS) com Burnable, Pausable, Permit e Votes. Open source, auditado, multisig.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-slate-900 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Status do deploy</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-[10px] font-black uppercase">
                  <Clock className="w-3 h-3" /> Pre-launch
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Network</span>
                <span className="text-sm font-bold text-white">Polygon PoS</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Chain ID</span>
                <span className="text-sm font-bold text-white">137</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Padrao</span>
                <span className="text-sm font-bold text-white">ERC-20 + EIP-2612 + EIP-5805</span>
              </div>
              <div className="pt-2 border-t border-white/10">
                <p className="text-xs text-slate-400 mb-1">Endereco do contrato</p>
                <code className="text-[11px] text-amber-300 font-mono break-all block bg-slate-950 p-2 rounded border border-white/5">
                  {KWATT_CONTRACT_ADDRESS}
                </code>
                <p className="text-[10px] text-slate-500 mt-1">
                  Endereco placeholder. O contrato sera publicado em 05/01/2027 no bloco ~75.500.000.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-white/10 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Recursos on-chain
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span><strong className="text-white">ERC-20 Burnable:</strong> supply reduz com uso real</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span><strong className="text-white">Pausable:</strong> circuit-breaker de emergencia (multisig 5/9)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span><strong className="text-white">Permit (EIP-2612):</strong> approve sem gas via signature</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span><strong className="text-white">Votes (EIP-5805):</strong> governanca on-chain para holders</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span><strong className="text-white">AccessControl:</strong> roles MINTER/PAUSER com multisig</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span><strong className="text-white">MAX_SUPPLY guard:</strong> impossivel ultrapassar 1B tokens</span>
                </li>
              </ul>
              <Link
                href="/dashboard/token"
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-xs"
              >
                <Coins className="w-3.5 h-3.5" /> Acompanhar minha carteira
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="max-w-3xl mx-auto mt-24">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3">Perguntas frequentes</h2>
          </div>

          <div className="space-y-2">
            {[
              { q: 'O KWATT é um valor mobiliário?', a: 'Não. O KWATT é um token de utilidade emitido nos termos da Lei 14.478/2022. Ele dá acesso a funcionalidades da plataforma EnergiaLivre (pagamento de faturas, recargas, cashback) e não representa participação societária, direito a dividendos ou qualquer expectativa de retorno financeiro.' },
              { q: 'Quando recebo meus tokens?', a: 'Os tokens são liberados na sua carteira EVM no dia 05/01/2027. Você pode usar imediatamente para pagar faturas, fazer recargas e acumular cashback dentro da plataforma EnergiaLivre.' },
              { q: 'Posso vender depois?', a: 'Sim. Após o lançamento, haverá liquidez em DEX (pools automatizadas). A possibilidade de venda, no entanto, depende das condições de mercado. Não garantimos preço mínimo nem demanda garantida.' },
              { q: 'Como funciona o pagamento de fatura?', a: 'Cada 1 KWATT = 30% de 1 kWh (equivalente a R$ 0,285). Você converte KWATT em saldo na plataforma e usa para abater do consumo real. O desconto é aplicado na fatura emitida pela concessionária parceira.' },
              { q: 'Preciso de KYC?', a: 'Para participar da pré-venda, basta e-mail válido. Para lifts acima de R$ 5.000 e para usar a exchange descentralizada, solicitaremos KYC leve (CPF + selfie) conforme exigido pelo Banco Central.' },
              { q: 'E se eu me arrepender?', a: 'Conforme CDC, você tem 7 dias para solicitar reembolso integral. Basta abrir ticket em suporte@energialivre.dev.br com o e-mail da compra.' },
            ].map((item, i) => (
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

        {/* LEGAL DISCLAIMER (collapsible) */}
        <section className="max-w-4xl mx-auto mt-16">
          <div className="rounded-2xl bg-amber-500/5 border border-amber-500/20 overflow-hidden">
            <button
              onClick={() => setLegalExpanded(!legalExpanded)}
              className="w-full px-5 py-3 flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-bold text-amber-100">Disclaimers legais e de risco</span>
              </div>
              {legalExpanded ? <ChevronUp className="w-4 h-4 text-amber-400" /> : <ChevronDown className="w-4 h-4 text-amber-400" />}
            </button>
            {legalExpanded && (
              <div className="px-5 pb-5 space-y-3 text-[11px] text-amber-100/80 leading-relaxed">
                <p>
                  <strong>1. Natureza do token.</strong> KWATT é token de utilidade emitido nos termos da Lei 14.478/2022.
                  NÃO é valor mobiliário, NÃO é investimento, NÃO confere direitos de participação, voto em assembleia
                  societária ou distribuição de lucros. Sua função é exclusivamente utilitária dentro do ecossistema
                  EnergiaLivre.
                </p>
                <p>
                  <strong>2. Sem promessa de valorização.</strong> O valor de mercado do token após o lançamento depende
                  exclusivamente de oferta e demanda. NÃO garantimos preço mínimo, rentabilidade, valorização ou
                  qualquer forma de retorno financeiro.
                </p>
                <p>
                  <strong>3. Riscos.</strong> Tokens digitais envolvem riscos tecnológicos (bugs em smart contract),
                  regulatórios (mudanças na legislação), de mercado (volatilidade) e de liquidez (dificuldade de venda).
                  Invista apenas o que você está disposto a perder.
                </p>
                <p>
                  <strong>4. Direito de arrependimento.</strong> Conforme CDC art. 49, você pode cancelar a compra em
                  até 7 dias corridos a partir do pagamento, com reembolso integral do valor pago.
                </p>
                <p>
                  <strong>5. Compliance.</strong> A oferta cumpre as diretrizes da CVM, ANBIMA e Banco Central para
                  tokens de utilidade. Auditores independentes revisarão o smart contract antes do lançamento. KYC será
                  exigido para lifts &gt; R$ 5.000.
                </p>
                <p>
                  <strong>6. Jurisdição.</strong> Esta oferta é válida para residentes no Brasil. Outras jurisdições
                  podem ter restrições adicionais.
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
            <span>© 2026 EnergiaLivre · KWATT Token · Lei 14.478/2022</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/regulamentacao" className="hover:text-white">Regulamentação</Link>
            <Link href="/termos" className="hover:text-white">Termos</Link>
            <a href="mailto:suporte@energialivre.dev.br" className="hover:text-white flex items-center gap-1">
              <Mail className="w-3 h-3" /> Suporte
            </a>
          </div>
        </div>
      </footer>

      {/* Buy Modal */}
      {buyPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-2xl border border-white/10 w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Reservar pacote {buyPackage.code.toUpperCase()}</h2>
              <button onClick={() => setBuyPackage(null)} className="p-1.5 rounded-lg hover:bg-white/10">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <p className="text-[10px] text-amber-300 font-bold uppercase">Você está reservando</p>
              <p className="text-2xl font-black text-white">{formatTokens(buyPackage.tokens + buyPackage.bonus)} <span className="text-sm text-slate-500">KWATT</span></p>
              <p className="text-sm text-amber-200 mt-1">
                {formatBRL(getFinalPrice(buyPackage))} <span className="text-[10px] text-slate-500 line-through ml-1">{formatBRL(buyPackage.basePrice)}</span>
              </p>
            </div>

            <form onSubmit={handleBuy} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Carteira EVM <span className="text-slate-500">(opcional — pode adicionar depois)</span>
                </label>
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="0x…"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 font-mono"
                />
              </div>

              <label className="flex items-start gap-2 text-[11px] text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedLgpd}
                  onChange={(e) => setAcceptedLgpd(e.target.checked)}
                  className="mt-0.5"
                />
                <span>
                  Aceito a <Link href="/termos" className="text-amber-400 hover:underline">Política de Privacidade</Link> e autorizo o uso do meu e-mail para comunicações sobre o KWATT.
                </span>
              </label>
              <label className="flex items-start gap-2 text-[11px] text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedRisk}
                  onChange={(e) => setAcceptedRisk(e.target.checked)}
                  className="mt-0.5"
                />
                <span>
                  Estou ciente dos <button type="button" onClick={() => setLegalExpanded(true)} className="text-amber-400 hover:underline">riscos</button> e que KWATT é token de utilidade, sem promessa de valorização.
                </span>
              </label>

              {submitMessage && (
                <div className={`p-3 rounded-lg text-xs ${
                  submitMessage.type === 'ok'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-200'
                    : 'bg-red-500/10 border border-red-500/30 text-red-200'
                }`}>
                  {submitMessage.text}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !acceptedLgpd || !acceptedRisk}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-slate-900 font-black transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                {submitting ? 'Reservando...' : `Reservar por ${formatBRL(getFinalPrice(buyPackage))}`}
              </button>
            </form>
          </div>
        </div>
      )}
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

function Kvp({ icon, label, accent }: { icon: React.ReactNode; label: string; accent: string }) {
  return (
    <div className={`p-3 rounded-xl bg-${accent}-500/10 border border-${accent}-500/20 flex items-center gap-2`}>
      <span className={`text-${accent}-400`}>{icon}</span>
      <span className="text-xs font-bold text-white">{label}</span>
    </div>
  )
}

function MechanismRow({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/50">
      <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400 shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-bold text-white">{title}</h4>
        <p className="text-[11px] text-slate-400 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

// Inline vote icon (substitui import ausente)
function Vote(props: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <path d="m9 12 2 2 4-4" />
      <path d="M5 7c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v12H5V7Z" />
      <path d="M22 19H2" />
    </svg>
  )
}
