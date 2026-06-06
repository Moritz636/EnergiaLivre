'use client';

import { useEffect, useState } from 'react';
import {
  Zap, TrendingUp, Users, Shield, Award,
  ArrowRight, MapPin,
  DollarSign, Heart, Loader2, Send,
  BadgeCheck, Sparkles, Briefcase, Megaphone, CheckCircle2,
  Handshake, Calculator, MessageCircle, AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { saveLead } from '@/app/actions';
import { buildFollowUpUrl, splitCidadeEstado } from '@/lib/leads';
import { useAuth } from '@/app/hooks/useAuth';

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

// ============================================
// GRUPO WHATSAPP
// ============================================
const WHATSAPP_GROUP_URL = 'https://chat.whatsapp.com/GjEnoYUW1kaFjyoPV5g43J'

// ============================================
// COMISSOES REAIS (defaults - sobrescritos pela API)
// ============================================
interface Comissoes {
  signup: number
  recurring: number
  embaixador: number
  ufv: number
}

const DEFAULT_COMISSOES: Comissoes = { signup: 15, recurring: 10, embaixador: 5, ufv: 15 }

// ============================================
// PERSONAS (com disclaimer - ilustrativas)
// ============================================
const PERSONAS = [
  {
    iniciais: 'MR',
    nome: 'Marina R.',
    cidade: 'Florianópolis, SC',
    canal: 'Instagram',
    cor: 'from-emerald-500 to-cyan-500',
    metric: '12 clientes ativos',
    quote:
      'Comecei indicando para amigos próximos no meu bairro. Hoje tenho uma rede orgânica de 12 clientes que se indica entre si. A recorrência é o que faz diferença.',
  },
  {
    iniciais: 'RC',
    nome: 'Rafael C.',
    cidade: 'Curitiba, PR',
    canal: 'YouTube',
    cor: 'from-purple-500 to-pink-500',
    metric: '28 clientes ativos',
    quote:
      'Faço conteúdo sobre transição energética. Quando lancei a parceria com a EnergiaLivre, o KWATT virou um incentivo a mais para minha audiência se cadastrar.',
  },
  {
    iniciais: 'JL',
    nome: 'Juliana L.',
    cidade: 'Porto Alegre, RS',
    canal: 'Indicação direta',
    cor: 'from-amber-500 to-orange-500',
    metric: '6 clientes ativos',
    quote:
      'Sou corretora de imóveis. Cada cliente que fecho um contrato recebe a indicação da EnergiaLivre junto. É um benefício extra que fechou várias vendas.',
  },
] as const

export default function ProgramaEmbaixadores() {
  const [comissoes, setComissoes] = useState<Comissoes>(DEFAULT_COMISSOES)
  const [comissoesLoaded, setComissoesLoaded] = useState(false)

  // Carrega comissões reais do backend (system_settings)
  useEffect(() => {
    fetch('/api/public/commissions')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setComissoes({
            signup: data.signup ?? 15,
            recurring: data.recurring ?? 10,
            embaixador: data.embaixador ?? 5,
            ufv: data.ufv ?? 15,
          })
        }
        setComissoesLoaded(true)
      })
      .catch(() => setComissoesLoaded(true))
  }, [])

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans">
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-[#020617]/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Zap className="text-slate-900 w-4 h-4 fill-current" />
            </div>
            <span className="text-base font-black text-white tracking-tight">EnergiaLivre</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" className="hidden sm:inline text-xs text-slate-300 hover:text-white transition">
              Entrar
            </Link>
            <a
              href={WHATSAPP_GROUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition flex items-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5" /> Grupo
            </a>
            <a
              href="#cadastro"
              className="px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 text-xs font-bold hover:from-emerald-400 hover:to-cyan-400 transition"
            >
              Ser Embaixador
            </a>
          </div>
        </div>
      </nav>

      {/* =================== HERO =================== */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-30">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-black uppercase tracking-widest mb-8">
            <Sparkles className="w-3 h-3" /> Programa de Embaixadores · Lei 14.300/2022
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight">
            Transforme sua rede
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              em renda recorrente.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 mt-8 max-w-2xl mx-auto leading-relaxed">
            Você indica. A plataforma faz o match. A energia flui. Você recebe todo mês.
            <br className="hidden md:block" />
            <span className="text-emerald-300">Sem investimento, sem estoque, sem meta obrigatória.</span>
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={WHATSAPP_GROUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 font-bold hover:from-emerald-400 hover:to-cyan-400 transition flex items-center gap-2 group"
            >
              Entrar no grupo de embaixadores <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#simulador"
              className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition flex items-center gap-2"
            >
              <Calculator className="w-4 h-4" /> Simular ganhos
            </a>
          </div>

          <p className="text-[10px] text-slate-500 mt-4 italic max-w-md mx-auto">
            Programa oficial · LGPD compliant · Compliance ANEEL · Sem promessa de rendimento fixo
          </p>
        </div>
      </section>

      {/* =================== COMO FUNCIONA =================== */}
      <section className="py-20 px-6 border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                n: '01',
                icon: Users,
                titulo: 'Indique',
                desc: 'Compartilhe seu link de embaixador. WhatsApp, Instagram, boca a boca — você escolhe.',
              },
              {
                n: '02',
                icon: Handshake,
                titulo: 'A plataforma faz o resto',
                desc: 'Match Tinder, validação de crédito, integração com a distribuidora. Zero burocracia.',
              },
              {
                n: '03',
                icon: DollarSign,
                titulo: 'Você recebe todo mês',
                desc: 'Comissão na venda + recorrência enquanto o cliente estiver ativo. Pix ou KWATT.',
              },
            ].map((s, i) => {
              const Icon = s.icon
              return (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-emerald-500/30 transition"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-mono text-emerald-300 font-bold uppercase tracking-widest">
                      Passo {s.n}
                    </span>
                    <Icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1.5">{s.titulo}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* =================== SIMULADOR =================== */}
      <Simulador
        comissoes={comissoes}
        comissoesLoaded={comissoesLoaded}
        whatsappGroupUrl={WHATSAPP_GROUP_URL}
      />

      {/* =================== PERSONAS =================== */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-3 text-xs text-emerald-300 uppercase tracking-widest font-bold">
            <Users className="w-3.5 h-3.5" /> Embaixadores
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-3 leading-tight">
            Quem faz parte.
          </h2>
          <p className="text-slate-400 text-base max-w-2xl mb-10">
            Três embaixadores de diferentes regiões do Brasil.
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            {PERSONAS.map((p, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.cor} flex items-center justify-center text-white text-sm font-black shrink-0`}
                  >
                    {p.iniciais}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white truncate">{p.nome}</p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {p.cidade} · {p.canal}
                    </p>
                  </div>
                </div>
                <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider mb-2">
                  {p.metric}
                </p>
                <p className="text-sm text-slate-300 leading-relaxed flex-1">
                  &ldquo;{p.quote}&rdquo;
                </p>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-slate-500 mt-6 italic max-w-3xl flex items-start gap-1.5">
            <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
            <span>
              Personas e depoimentos são <strong>ilustrativos</strong>, baseados em perfis
              representativos de embaixadores. Depoimentos verificados serão coletados
              diretamente dos embaixadores ativos e adicionados ao programa.
            </span>
          </p>
        </div>
      </section>

      {/* =================== POR QUE ENERGIALIVRE =================== */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                icon: Shield,
                titulo: 'Compliance real',
                desc: 'Lei 14.300/2022 (compensação) · Lei 14.478/2022 (cripto) · LGPD · RLS no Supabase',
              },
              {
                icon: TrendingUp,
                titulo: 'Mercado bilionário',
                desc: '3,1 milhões de sistemas de energia distribuída no Brasil (ANEEL jan/2025). Você entra cedo.',
              },
              {
                icon: Award,
                titulo: 'Suporte humano',
                desc: 'Grupo de WhatsApp ativo, materiais de venda prontos, treinamento de 30 min por chamada.',
              },
            ].map((s, i) => {
              const Icon = s.icon
              return (
                <div key={i} className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
                  <Icon className="w-7 h-7 text-emerald-400 mb-3" />
                  <h3 className="text-lg font-bold text-white mb-1.5">{s.titulo}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* =================== WHATSAPP CTA =================== */}
      <section className="py-20 px-6 border-t border-white/5 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-emerald-500/20 items-center justify-center mb-6">
            <MessageCircle className="w-8 h-8 text-emerald-300" />
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
            Entre no grupo de embaixadores.
          </h2>
          <p className="text-lg text-slate-300 mb-8 max-w-xl mx-auto leading-relaxed">
            Network com outros embaixadores, tire dúvidas em tempo real, receba materiais
            exclusivos e fique por dentro das novidades do programa.
          </p>
          <a
            href={WHATSAPP_GROUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 font-bold hover:from-emerald-400 hover:to-cyan-400 transition"
          >
            <MessageCircle className="w-4 h-4" /> Entrar no grupo agora
          </a>
          <p className="text-[10px] text-slate-500 mt-3">
            Grupo oficial · ~100 embaixadores ativos · Moderação diária
          </p>
        </div>
      </section>

      <EmbaixadorLeadForm whatsappGroupUrl={WHATSAPP_GROUP_URL} />

      {/* =================== FAQ =================== */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black text-white text-center mb-10">
            Perguntas frequentes.
          </h2>
          <div className="space-y-3">
            {[
              {
                q: 'Preciso investir alguma coisa pra começar?',
                a: 'Não. Zero investimento, taxa de adesão ou meta obrigatória. Você só avança se fizer sentido.',
              },
              {
                q: 'Quanto posso ganhar?',
                a: 'Depende do seu número de indicações. Use o simulador acima — ele usa os percentuais reais do programa (15% no cadastro, 10% recorrente, 5% bônus embaixador).',
              },
              {
                q: 'Preciso ser CLT ou ter CNPJ?',
                a: 'Atua como autônomo. Sem vínculo empregatício. CNPJ é opcional (recomendado para emissão de NF).',
              },
              {
                q: 'Como recebo?',
                a: 'PIX direto para sua conta ou saldo em KWATT (token utilitário da plataforma, Lei 14.478/2022).',
              },
              {
                q: 'Posso indicar em qualquer estado?',
                a: 'Sim. A plataforma opera em 5 estados piloto (RS, SC, PR, SP, MT) e cresce conforme demanda. Cada estado tem sua própria rede de embaixadores.',
              },
              {
                q: 'Tem materiais de venda prontos?',
                a: 'Sim. Dentro do grupo de WhatsApp você recebe cards, vídeos, calculadora e scripts de abordagem prontos para usar.',
              },
            ].map((f, i) => (
              <details
                key={i}
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 group"
              >
                <summary className="text-base font-bold text-white cursor-pointer list-none flex items-center justify-between gap-3">
                  <span>{f.q}</span>
                  <span className="text-emerald-400 group-open:rotate-45 transition-transform text-2xl leading-none">+</span>
                </summary>
                <p className="text-sm text-slate-300 mt-3 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-10 px-6 border-t border-white/10 text-center text-slate-500 text-xs">
        <p>© 2026 EnergiaLivre · Programa de Embaixadores · Lei 14.300/2022 · LGPD</p>
      </footer>
    </div>
  )
}

// ============================================
// SIMULADOR (com comissões REAIS do backend)
// ============================================

interface SimuladorProps {
  comissoes: Comissoes
  comissoesLoaded: boolean
  whatsappGroupUrl: string
}

function Simulador({ comissoes, comissoesLoaded, whatsappGroupUrl }: SimuladorProps) {
  const [clientes, setClientes] = useState(10)
  const [ticketMedio, setTicketMedio] = useState(400)

  // Cálculos baseados nas comissões REAIS do system_settings
  const comissaoPorClienteMes1 = (ticketMedio * comissoes.signup) / 100 // 15% signup
  const comissaoPorClienteRecorrente = (ticketMedio * comissoes.recurring) / 100 // 10% recorrente
  const totalMes1 = clientes * comissaoPorClienteMes1
  const totalRecorrente = clientes * comissaoPorClienteRecorrente
  const total12Meses = totalMes1 + totalRecorrente * 12

  return (
    <section
      id="simulador"
      className="py-20 px-6 border-t border-white/5 bg-gradient-to-b from-transparent via-cyan-500/[0.03] to-transparent"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-3 text-xs text-cyan-300 uppercase tracking-widest font-bold">
          <Calculator className="w-3.5 h-3.5" /> Simulador
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-white mb-3 leading-tight">
          Quanto você pode ganhar.
        </h2>
        <p className="text-slate-400 text-base mb-10 max-w-2xl">
          Cálculo baseado nos <strong className="text-white">percentuais reais do programa</strong>
          {comissoesLoaded && (
            <span className="text-emerald-300"> · {comissoes.signup}% cadastro + {comissoes.recurring}% recorrente</span>
          )}.
        </p>

        <div className="p-6 md:p-8 rounded-2xl bg-white/[0.02] border border-white/10">
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <label className="text-xs text-slate-400 uppercase tracking-wider">
                  Clientes indicados / mês
                </label>
                <span className="text-2xl font-black text-white">{clientes}</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={clientes}
                onChange={(e) => setClientes(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-full cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1.5 font-mono">
                <span>1</span>
                <span>10</span>
                <span>25</span>
                <span>40</span>
                <span>50</span>
              </div>
            </div>
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <label className="text-xs text-slate-400 uppercase tracking-wider">
                  Ticket médio (R$)
                </label>
                <span className="text-2xl font-black text-white">R$ {ticketMedio}</span>
              </div>
              <input
                type="range"
                min="200"
                max="800"
                step="50"
                value={ticketMedio}
                onChange={(e) => setTicketMedio(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-full cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1.5 font-mono">
                <span>200</span>
                <span>400</span>
                <span>600</span>
                <span>800</span>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div className="p-5 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">1º Mês</p>
              <p className="text-2xl md:text-3xl font-black text-emerald-300">
                R$ {totalMes1.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {comissoes.signup}% × {clientes} clientes × R$ {ticketMedio}
              </p>
            </div>
            <div className="p-5 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Recorrente / mês</p>
              <p className="text-2xl md:text-3xl font-black text-cyan-300">
                R$ {totalRecorrente.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {comissoes.recurring}% × {clientes} × R$ {ticketMedio}
              </p>
            </div>
            <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30">
              <p className="text-[10px] text-slate-300 uppercase tracking-wider mb-1">Projeção 12 meses</p>
              <p className="text-2xl md:text-3xl font-black text-white">
                R$ {total12Meses.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
              </p>
              <p className="text-[11px] text-emerald-300 mt-1">
                mês 1 + recorrente × 12
              </p>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 mt-4 italic">
            * Simulação ilustrativa. Os valores reais dependem de quantos clientes indicados
            efetivam a contratação e permanecem ativos. Sem promessa de rendimento fixo.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-2">
            <a
              href={whatsappGroupUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-bold transition flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" /> Tirar dúvidas no grupo
            </a>
            <a
              href="#cadastro"
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 text-sm font-bold hover:from-emerald-400 hover:to-cyan-400 transition flex items-center justify-center gap-2"
            >
              Começar agora <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

// ============================================
// LEAD FORM
// ============================================

function EmbaixadorLeadForm({ whatsappGroupUrl }: { whatsappGroupUrl: string }) {
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

  const phases = [
    { icon: <Sparkles className="w-3.5 h-3.5" />, text: 'Validando seus dados...' },
    { icon: <Users className="w-3.5 h-3.5" />, text: 'Cruzando com a base de embaixadores...' },
    { icon: <Handshake className="w-3.5 h-3.5" />, text: 'Preparando seu contrato de parceria...' },
    { icon: <DollarSign className="w-3.5 h-3.5" />, text: 'Calculando projeção personalizada...' },
  ]

  const handleNext = (e: React.FormEvent) => {
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
      setPhase(phases.length - 1)
      handleSubmitFinal()
    }, 6000)
  }

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

  const isLoggedPartner = !!user && profile?.tipo === 'parceiro'

  return (
    <section id="cadastro" className="py-20 px-6 border-t border-white/5">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-black mb-4 uppercase tracking-widest">
            <Briefcase className="w-3 h-3" /> Cadastro de Embaixador
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
            Comece a <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">ganhar hoje</span>.
          </h2>
          <p className="text-slate-400 text-base max-w-md mx-auto">
            Preencha em 60 segundos. Você recebe o contato do time em até 24h.
          </p>
        </div>

        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 md:p-8">
          {!submitted && step === 1 && (
            <form onSubmit={(e) => { e.preventDefault(); setStep(2) }} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1.5">Nome completo</label>
                  <input
                    required
                    type="text"
                    placeholder="Seu nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1.5">WhatsApp</label>
                  <input
                    required
                    type="tel"
                    placeholder="+55 84 99999-8888"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1.5">Email</label>
                <input
                  required
                  type="email"
                  placeholder="voce@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1.5">Cidade e estado</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                  <input
                    required
                    type="text"
                    placeholder="Ex: Natal - RN"
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
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
          )}

          {!submitted && step === 2 && (
            <form onSubmit={handleNext} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1.5">Nicho de atuação</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                    <select
                      value={formData.nicho}
                      onChange={(e) => setFormData({ ...formData, nicho: e.target.value })}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 outline-none appearance-none"
                    >
                      <option value="">Selecione (opcional)</option>
                      {NICHO_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1.5">Canal principal</label>
                  <div className="relative">
                    <Megaphone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                    <select
                      value={formData.canal}
                      onChange={(e) => setFormData({ ...formData, canal: e.target.value })}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 outline-none appearance-none"
                    >
                      <option value="">Selecione (opcional)</option>
                      {CANAL_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1.5">Audiência estimada (pessoas/mês)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Ex: 5000"
                  value={formData.audiencia}
                  onChange={(e) => setFormData({ ...formData, audiencia: e.target.value })}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 outline-none"
                />
              </div>
              <div className="flex items-center justify-center gap-4 py-1 text-[10px] text-slate-500">
                <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-emerald-500" /> LGPD</span>
                <span className="flex items-center gap-1"><BadgeCheck className="w-3 h-3 text-emerald-500" /> Dados Criptografados</span>
                <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-emerald-500" /> Resposta 24h</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
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
          )}

          {!submitted && step === 3 && (
            <div className="text-center py-10 space-y-6">
              <div className="relative inline-block">
                <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-500 w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">Quase lá...</h3>
                <div className="space-y-1.5 max-w-xs mx-auto">
                  {phases.map((p, i) => (
                    <div key={i} className={`flex items-center gap-2 text-xs transition-all ${i <= phase ? 'text-emerald-400' : 'text-slate-600'}`}>
                      {i < phase ? <CheckCircle2 className="w-3.5 h-3.5" /> : p.icon}
                      {p.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {submitted && (
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
                Nosso time entra em contato em até 24h via WhatsApp. Enquanto isso, entre no
                grupo oficial.
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
          )}
        </div>

        <p className="mt-6 text-center text-[10px] text-slate-600 max-w-md mx-auto leading-relaxed">
          🔒 Dados protegidos pela LGPD. Sem compromisso — você só avança se fizer sentido.
        </p>
      </div>
    </section>
  )
}
