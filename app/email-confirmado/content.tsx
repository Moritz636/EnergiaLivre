'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import {
  CheckCircle,
  Wallet,
  TrendingUp,
  Shield,
  Clock,
  ArrowRight,
  Zap,
  Globe,
  Lock,
  Users,
  Sparkles,
  ExternalLink,
} from 'lucide-react'

const wallets = [
  { nome: 'MetaMask', icon: '🦊', cor: '#E2761B' },
  { nome: 'Trust Wallet', icon: '💼', cor: '#3375BB' },
  { nome: 'Ledger', icon: '🔒', cor: '#000000' },
  { nome: 'Phantom', icon: '👻', cor: '#AB9FF2' },
  { nome: 'Coinbase Wallet', icon: '🔷', cor: '#0052FF' },
  { nome: 'Rabby', icon: '🦊', cor: '#5D6AFB' },
  { nome: 'OKX Wallet', icon: '🧩', cor: '#191919' },
  { nome: 'Rainbow', icon: '🌈', cor: '#001A4D' },
]

const beneficios = [
  {
    icon: <TrendingUp className="w-5 h-5" />,
    titulo: 'Valorização Antecipada',
    desc: 'Entrar antes de 2027 significa comprar no preço de criação, não no pico da adoção em massa.',
  },
  {
    icon: <Globe className="w-5 h-5" />,
    titulo: 'Lastro Real em Energia',
    desc: 'Cada KWATT representa 1 kWh de energia limpa gerada. Não é papel moeda — é poder elétrico real.',
  },
  {
    icon: <Shield className="w-5 h-5" />,
    titulo: 'Token Utility registrado',
    desc: 'Operação legalizada, compliance ANEEL, LGPD aplicada. O futuro tem regras — estamos dentro delas.',
  },
  {
    icon: <Users className="w-5 h-5" />,
    titulo: 'Network Exclusiva',
    desc: 'Acesso ao grupo de early adopters, prioridade em drops e governança da comunidade.',
  },
]

export default function EmailConfirmadoContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tipo = searchParams.get('from') || 'consumidor'
  const [tempoLeitura, setTempoLeitura] = useState(0)
  const [showPopup, setShowPopup] = useState(false)
  const [redirectCountdown, setRedirectCountdown] = useState(10)

  useEffect(() => {
    if (tempoLeitura >= 10 && !showPopup) {
      setShowPopup(true)
      const interval = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            const destinos: Record<string, string> = {
              consumidor: '/dashboard',
              gerador: '/dashboard-gerador',
              parceiro: '/embaixador/dashboard',
            }
            router.push(destinos[tipo] || '/dashboard')
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [tempoLeitura, showPopup, router, tipo])

  const tempoDecorrido = useCallback(() => {
    const interval = setInterval(() => {
      setTempoLeitura((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const cleanup = tempoDecorrido()
    return cleanup
  }, [tempoDecorrido])

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden relative">
      <div className="fixed inset-0 -z-10" aria-hidden>
        <Image
          src="/images/hero-parceiros.webp"
          alt=""
          fill
          className="object-cover opacity-10"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/70 to-slate-950/90" />
      </div>

      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20 relative z-10">
        <div className="flex flex-col items-center text-center mb-12 md:mb-16">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.05] mb-4">
            Você está{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              dentro.
            </span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl">
            Seu email foi confirmado. Enquanto milhões ainda hesitam, você acaba de
            garantir seu lugar na virada energética digital.
          </p>
        </div>

        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-8 md:p-10 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-widest mb-6">
            <Zap className="w-3 h-3" /> O Futuro Já Chegou
          </div>
          <h2 className="text-2xl md:text-4xl font-black mb-6 leading-tight">
            Até 2027, todo dinheiro será digital.{' '}
            <span className="text-emerald-400">Você está 2 anos à frente.</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-6 text-slate-300 text-sm md:text-base leading-relaxed">
            <p className="md:border-r border-white/10 md:pr-6">
              Os governos já testam CBDCs. Os bancos já tokenizam ativos. As corretoras
              já vendem frações de imóveis, arte e energia. Quem esperar 2027 para
              entrar vai comprar caro de quem entrou agora.
            </p>
            <p className="md:pl-2">
              O KWATT não é uma promessa distante. É infraestrutura funcionando hoje:
              usinas reais gerando energia real, tokenizada em blockchain, pronta para
              ser negociada entre pares sem burocracia.
            </p>
          </div>
          <div className="mt-8 flex items-center gap-4 text-xs">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-emerald-400 font-bold whitespace-nowrap">2025 — Early Adopters</span>
            <div className="flex-1 h-px bg-gradient-to-r from-emerald-500/50 to-cyan-500/50" />
            <span className="text-slate-500 whitespace-nowrap">2027 — Mass Adoption</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>
        </div>

        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-8 md:p-10 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[10px] font-black uppercase tracking-widest mb-6">
            <Wallet className="w-3 h-3" /> Compatível com as Principais Wallets
          </div>
          <p className="text-slate-400 text-sm mb-6 max-w-2xl">
            Seu token KWATT vive na sua carteira, não no servidor de ninguém. Soberania
            real sobre seu ativo energético.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {wallets.map((w) => (
              <div
                key={w.nome}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/20 transition-colors"
              >
                <span className="text-xl">{w.icon}</span>
                <span className="text-xs md:text-sm font-medium text-slate-200">{w.nome}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[10px] text-slate-500 flex items-center gap-1">
            <Lock className="w-3 h-3" /> Armazenamento auto-custódio · Sem KYC para transferências · Swap disponível em breve
          </p>
        </div>

        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-8 md:p-10 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-widest mb-6">
            <Sparkles className="w-3 h-3" /> Por Que Agora?
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {beneficios.map((b) => (
              <div key={b.titulo} className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0 text-emerald-400">
                  {b.icon}
                </div>
                <div>
                  <p className="text-sm font-bold text-white mb-1">{b.titulo}</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 via-cyan-500/5 to-slate-900 border border-emerald-500/20 p-8 md:p-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-widest mb-6">
            <Clock className="w-3 h-3" /> Oferta Limitada
          </div>
          <h3 className="text-xl md:text-2xl font-black mb-3">
            O presale do KWATT está aberto. Mas não por muito tempo.
          </h3>
          <p className="text-sm text-slate-400 max-w-xl mx-auto mb-6">
            Preço de lançamento exclusivo para quem confirmou o email antes da listagem
            pública. Depois que entrar nas exchanges, o preço será definido pelo mercado.
          </p>
          <a
            href="/token"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 font-bold hover:from-emerald-400 hover:to-cyan-400 transition group text-sm"
          >
            Acessar Presale do KWATT{' '}
            <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        <div className="h-24" />
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-500">
          <div className="max-w-md w-full rounded-2xl bg-slate-900 border border-white/10 p-8 text-center shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 mx-auto mb-5 flex items-center justify-center">
              <ArrowRight className="w-7 h-7 text-slate-900" />
            </div>
            <h3 className="text-xl font-black text-white mb-2">
              Redirecionando em {redirectCountdown}s
            </h3>
            <p className="text-sm text-slate-400 mb-6">
              Você já leu o essencial. Agora é hora de agir.{' '}
              <span className="text-emerald-300 font-bold">Oportunidade não espera.</span>
            </p>
            <div className="relative w-16 h-16 mx-auto mb-6">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                <circle
                  cx="32" cy="32" r="28" fill="none"
                  stroke="url(#countdownGrad)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${(redirectCountdown / 10) * 176} 176`}
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="countdownGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-lg font-black text-white">
                {redirectCountdown}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 italic leading-relaxed">
              &ldquo;Quem hesita perde. Quem age cedo, define o preço.&rdquo;
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
