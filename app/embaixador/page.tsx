'use client';

import { useState } from 'react';
import {
  Zap, TrendingUp, Users, Shield, Award,
  CheckCircle, ArrowRight, Star, MapPin,
  DollarSign, BarChart3, Heart, Globe,
  Loader2, Send, Clock, BadgeCheck, Sparkles, Briefcase, Megaphone, CheckCircle2, Handshake
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

export default function ProgramaEmbaixadores() {
  const [clientes, setClientes] = useState(20);
  const [ticketMedio, setTicketMedio] = useState(400);

  const comissaoPrimeiroMes = clientes * ticketMedio;
  const rendaRecorrente = clientes * (ticketMedio * 0.05);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-slate-950/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-yellow-500 rounded-xl flex items-center justify-center">
              <Zap className="text-slate-900 w-6 h-6 fill-current" />
            </div>
            <span className="text-2xl font-black text-white">
              ENERGIA<span className="text-emerald-500">LIVRE</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/login" className="text-slate-300 hover:text-white transition">Entrar</a>
            <a href="#cadastro" className="bg-gradient-to-r from-emerald-500 to-yellow-500 text-slate-900 px-6 py-2.5 rounded-full font-bold hover:shadow-lg transition-all">
              Ser Embaixador
            </a>
          </div>
        </div>
      </nav>

      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent" />

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-bold mb-8">
            <Star className="w-4 h-4 fill-current" />
            Programa de Embaixadores
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
            Ganhe até <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-yellow-400">R$ 5.000/mês</span>
            <br />indicando energia solar
          </h1>

          <p className="text-xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            Sem investimento, sem estoque, sem complicação.
            Você indica, nós cuidamos de tudo.
            <span className="text-emerald-400 font-semibold"> Comissão de até 100% no primeiro mês</span> + renda recorrente.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <DollarSign className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
              <div className="text-3xl font-black text-white mb-1">+R$ 2M</div>
              <div className="text-sm text-slate-400">Pagos em comissões</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <Users className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
              <div className="text-3xl font-black text-white mb-1">+500</div>
              <div className="text-sm text-slate-400">Embaixadores ativos</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <TrendingUp className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
              <div className="text-3xl font-black text-white mb-1">32%</div>
              <div className="text-sm text-slate-400">Economia média</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <MapPin className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
              <div className="text-3xl font-black text-white mb-1">5</div>
              <div className="text-sm text-slate-400">Estados atendidos</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#cadastro" className="px-10 py-5 bg-gradient-to-r from-emerald-500 to-yellow-500 text-slate-900 rounded-full font-bold text-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group">
              Começar Agora <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a href="#simulador" className="px-10 py-5 bg-white/10 border border-white/20 text-white rounded-full font-bold text-lg hover:bg-white/20 transition-all">
              Simular Ganhos
            </a>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-slate-900/40 border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Energia solar por assinatura
            </h2>
            <p className="text-slate-400 text-lg">O mesmo conceito que revolucionou outros mercados</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-8 rounded-3xl border bg-white/5 border-white/10 text-center">
              <div className="text-5xl mb-4">🚗</div>
              <div className="text-2xl font-bold text-white mb-2">Ter carro</div>
              <div className="text-4xl font-black text-emerald-400 mb-2">→</div>
              <div className="text-2xl font-bold text-white mb-2">Uber</div>
              <div className="text-slate-400">Acesso sem posse</div>
            </div>
            <div className="p-8 rounded-3xl border bg-white/5 border-white/10 text-center">
              <div className="text-5xl mb-4">🏠</div>
              <div className="text-2xl font-bold text-white mb-2">Ter imóvel</div>
              <div className="text-4xl font-black text-emerald-400 mb-2">→</div>
              <div className="text-2xl font-bold text-white mb-2">Airbnb</div>
              <div className="text-slate-400">Uso sob demanda</div>
            </div>
            <div className="p-8 rounded-3xl border bg-gradient-to-br from-emerald-500/20 to-yellow-500/10 border-emerald-500/50 text-center">
              <div className="text-5xl mb-4">⚡</div>
              <div className="text-2xl font-bold text-white mb-2">Placa solar</div>
              <div className="text-4xl font-black text-emerald-400 mb-2">→</div>
              <div className="text-2xl font-bold text-yellow-400 mb-2">EnergiaLivre</div>
              <div className="text-slate-400">Energia sem investimento</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Ganhe em 4 passos simples
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-emerald-500/50 transition-all">
              <Users className="w-12 h-12 text-emerald-400 mb-6" />
              <h3 className="text-xl font-bold text-white mb-3">Indique</h3>
              <p className="text-slate-400">Apresente a EnergiaLivre para amigos, familiares ou clientes</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-emerald-500/50 transition-all">
              <CheckCircle className="w-12 h-12 text-emerald-400 mb-6" />
              <h3 className="text-xl font-bold text-white mb-3">Cadastre</h3>
              <p className="text-slate-400">Faça o cadastro gratuito da pessoa na plataforma</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-emerald-500/50 transition-all">
              <Shield className="w-12 h-12 text-emerald-400 mb-6" />
              <h3 className="text-xl font-bold text-white mb-3">Ative</h3>
              <p className="text-slate-400">Nós cuidamos de toda a parte burocrática e técnica</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-emerald-500/50 transition-all">
              <DollarSign className="w-12 h-12 text-emerald-400 mb-6" />
              <h3 className="text-xl font-bold text-white mb-3">Ganhe</h3>
              <p className="text-slate-400">Receba comissão imediata + renda todo mês</p>
            </div>
          </div>
        </div>
      </section>

      <section id="simulador" className="py-20 px-6 bg-gradient-to-br from-emerald-500/10 to-yellow-500/5 border-y border-white/10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Simule seus ganhos
            </h2>
            <p className="text-slate-400 text-lg">Veja quanto você pode ganhar por mês</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <label className="block text-slate-400 mb-2">Clientes por mês: {clientes}</label>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={clientes}
                  onChange={(e) => setClientes(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg cursor-pointer accent-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-2">Ticket médio: R$ {ticketMedio}</label>
                <input
                  type="range"
                  min="200"
                  max="1000"
                  step="50"
                  value={ticketMedio}
                  onChange={(e) => setTicketMedio(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg cursor-pointer accent-emerald-500"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/5 rounded-2xl p-6 text-center">
                <div className="text-slate-400 mb-2">1º Mês</div>
                <div className="text-3xl font-black text-emerald-400">R$ {comissaoPrimeiroMes.toLocaleString('pt-BR')}</div>
                <div className="text-sm text-slate-500 mt-1">Comissão inicial</div>
              </div>
              <div className="bg-white/5 rounded-2xl p-6 text-center">
                <div className="text-slate-400 mb-2">Recorrente/mês</div>
                <div className="text-3xl font-black text-yellow-400">R$ {rendaRecorrente.toLocaleString('pt-BR')}</div>
                <div className="text-sm text-slate-500 mt-1">Renda passiva</div>
              </div>
              <div className="bg-gradient-to-br from-emerald-500/20 to-yellow-500/20 border border-emerald-500/30 rounded-2xl p-6 text-center">
                <div className="text-slate-300 mb-2">Total 12 meses</div>
                <div className="text-3xl font-black text-white">R$ {(comissaoPrimeiroMes + (rendaRecorrente * 12)).toLocaleString('pt-BR')}</div>
                <div className="text-sm text-emerald-400 mt-1">Projeção anual</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <EmbaixadorLeadForm />

      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Por que ser um embaixador?
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <DollarSign className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">Alta comissão</h3>
                    <p className="text-slate-400">Ganhe até 100% da primeira fatura + 5% recorrente</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <Globe className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">Sem limites geográficos</h3>
                    <p className="text-slate-400">Atue em 5 estados e expanda conforme crescemos</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <Award className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">Suporte completo</h3>
                    <p className="text-slate-400">Treinamento, materiais de venda e suporte dedicado</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <Heart className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">Impacto positivo</h3>
                    <p className="text-slate-400">Ajude o meio ambiente enquanto ganha dinheiro</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-500/20 to-yellow-500/10 border border-emerald-500/30 rounded-3xl p-8">
              <div className="text-center mb-8">
                <BarChart3 className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Renda Recorrente</h3>
                <p className="text-slate-400">Ganhe todo mês enquanto o cliente estiver ativo</p>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                  <span className="text-slate-300">10 clientes</span>
                  <span className="text-emerald-400 font-bold">R$ 500/mês</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                  <span className="text-slate-300">50 clientes</span>
                  <span className="text-emerald-400 font-bold">R$ 2.500/mês</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-emerald-500/20 to-yellow-500/20 rounded-xl border border-emerald-500/30">
                  <span className="text-white font-semibold">100 clientes</span>
                  <span className="text-yellow-400 font-bold">R$ 5.000/mês</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-slate-900/40 border-y border-white/5">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Onde você pode atuar
          </h2>
          <p className="text-slate-400 text-lg mb-12">Presentes nas principais regiões do Brasil</p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {['Rio Grande do Sul', 'Santa Catarina', 'Paraná', 'São Paulo', 'Mato Grosso'].map((state) => (
              <div key={state} className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 font-semibold">
                {state}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-white text-center mb-12">
            Perguntas frequentes
          </h2>

          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-3">Preciso investir alguma coisa pra começar?</h3>
              <p className="text-slate-400">Não. Zero investimento. Você não compra estoque, não paga taxa de adesão e não tem meta obrigatória.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-3">Quando eu recebo a primeira comissão?</h3>
              <p className="text-slate-400">A comissão na venda pode chegar a 100% paga já no cadastro do cliente. Depois, você recebe o bônus de recorrência todo mês.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-3">Preciso ser CLT ou ter CNPJ?</h3>
              <p className="text-slate-400">Você atua como autônomo. Não tem vínculo CLT — você é dono do seu tempo.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-emerald-500/20 to-yellow-500/10 border border-emerald-500/30 rounded-3xl p-12">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Comece a ganhar hoje mesmo
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
              Cadastro gratuito, sem compromisso. Em 5 minutos você já pode começar a indicar.
            </p>
            <a href="#cadastro" className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-emerald-500 to-yellow-500 text-slate-900 rounded-full font-bold text-lg hover:shadow-xl transition-all">
              Quero Ser Embaixador <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      <footer className="py-12 px-6 border-t border-white/10 text-center text-slate-500">
        <p>© 2026 EnergiaLivre. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

function EmbaixadorLeadForm() {
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
    { icon: <Sparkles className="w-4 h-4" />, text: 'Validando seus dados...' },
    { icon: <Users className="w-4 h-4" />, text: 'Cruzando com a base de embaixadores...' },
    { icon: <Handshake className="w-4 h-4" />, text: 'Preparando seu contrato de parceria...' },
    { icon: <DollarSign className="w-4 h-4" />, text: 'Calculando projeção personalizada de ganhos...' },
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
    <section id="cadastro" className="py-20 px-6 bg-gradient-to-b from-transparent to-slate-900/40">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-black mb-4 uppercase tracking-wider">
            <Briefcase className="w-3 h-3" /> Cadastro de Embaixador
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
            Comece a <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-yellow-400">ganhar hoje</span>
          </h2>
          <p className="text-slate-400 text-lg">Preencha em 60 segundos e receba o contato do nosso time.</p>
        </div>

        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-2xl">
          {!submitted && step === 1 && (
            <form onSubmit={(e) => { e.preventDefault(); setStep(2) }} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">Nome completo</label>
                  <input
                    required
                    type="text"
                    placeholder="Seu nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">WhatsApp</label>
                  <input
                    required
                    type="tel"
                    placeholder="+55 84 99999-8888"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">Email</label>
                <input
                  required
                  type="email"
                  placeholder="voce@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">Cidade e estado</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                  <input
                    required
                    type="text"
                    placeholder="Ex: Natal - RN"
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-900 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 group"
              >
                Continuar <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          )}

          {!submitted && step === 2 && (
            <form onSubmit={handleNext} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">Nicho de atuação</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                    <select
                      value={formData.nicho}
                      onChange={(e) => setFormData({ ...formData, nicho: e.target.value })}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 outline-none appearance-none"
                    >
                      <option value="">Selecione (opcional)</option>
                      {NICHO_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">Canal principal</label>
                  <div className="relative">
                    <Megaphone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                    <select
                      value={formData.canal}
                      onChange={(e) => setFormData({ ...formData, canal: e.target.value })}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 outline-none appearance-none"
                    >
                      <option value="">Selecione (opcional)</option>
                      {CANAL_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">Audiência estimada (pessoas/mês)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Ex: 5000"
                  value={formData.audiencia}
                  onChange={(e) => setFormData({ ...formData, audiencia: e.target.value })}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 outline-none"
                />
              </div>

              <div className="flex items-center justify-center gap-4 py-1 text-[10px] text-slate-500">
                <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-emerald-500" /> LGPD</span>
                <span className="flex items-center gap-1"><BadgeCheck className="w-3 h-3 text-emerald-500" /> Dados Criptografados</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-emerald-500" /> Resposta em 24h</span>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-3 bg-slate-800/50 text-slate-300 rounded-xl font-bold hover:bg-slate-700 transition border border-white/5"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-900 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 group"
                >
                  Quero ser embaixador <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </form>
          )}

          {!submitted && step === 3 && (
            <div className="text-center py-12 space-y-8">
              <div className="relative inline-block">
                <div className="w-20 h-20 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-500 w-7 h-7 animate-pulse" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-white">Quase lá...</h3>
                <div className="space-y-2 max-w-xs mx-auto">
                  {phases.map((p, i) => (
                    <div key={i} className={`flex items-center gap-2 text-sm transition-all ${i <= phase ? 'text-emerald-400' : 'text-slate-600'}`}>
                      {i < phase ? <CheckCircle2 className="w-4 h-4" /> : p.icon}
                      {p.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {submitted && (
            <div className="text-center space-y-6 py-4">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/20 rounded-full text-emerald-500 animate-bounce">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white mb-2">Cadastro enviado! 🚀</h3>
                <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Análise concluída com sucesso</p>
              </div>
              <p className="text-slate-400">
                Recebemos seus dados. Nosso time entrará em contato via WhatsApp para validar e liberar seu acesso ao painel de comissões.
              </p>

              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-yellow-500/5 border border-emerald-500/30 space-y-4">
                <p className="text-sm text-emerald-400 font-medium flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" /> Quer acelerar a aprovação?
                </p>
                <p className="text-xs text-slate-500">
                  Fale agora com nosso time no WhatsApp e ganhe prioridade na análise.
                </p>
                <a
                  href={buildFollowUpUrl('parceiro', {
                    nome: formData.nome,
                    ...splitCidadeEstado(formData.cidade),
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-900 rounded-xl font-bold hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-lg"
                >
                  Acelerar via WhatsApp
                </a>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {isLoggedPartner ? (
                  <Link
                    href="/embaixador/dashboard"
                    className="flex-1 inline-flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition"
                  >
                    Acessar meu dashboard <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <Link
                    href="/cadastro-embaixador"
                    className="flex-1 inline-flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-yellow-500 to-yellow-400 text-slate-900 rounded-xl font-bold hover:from-yellow-400 hover:to-yellow-300 transition"
                  >
                    Criar conta de embaixador <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
                <a
                  href="#simulador"
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition"
                >
                  Voltar ao simulador
                </a>
              </div>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-[10px] text-slate-600 max-w-md mx-auto leading-relaxed">
          🔒 Dados protegidos pela LGPD. Sem compromisso — você só avança se fizer sentido para você.
        </p>
      </div>
    </section>
  )
}
