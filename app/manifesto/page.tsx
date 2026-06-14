import type { Metadata } from 'next'
import Link from 'next/link'
import { Sparkles, ArrowRight, Zap, Target, Heart, Shield, MapPin, Coins, CreditCard, Sun, Calendar, AlertTriangle, Globe2, Award, Users, Code, Building2, ChevronRight, TrendingUp, Rocket, Wallet, BadgeCheck, BarChart3, CheckCircle2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Manifesto · EnergiaLivre',
  description: 'Por que existimos. A história por trás da plataforma que conecta consumidores e geradores de energia distribuída no Brasil.',
  openGraph: {
    title: 'Manifesto · EnergiaLivre',
    description: '3 milhões de sistemas de energia distribuída no Brasil. Por que existimos?',
    type: 'article',
  },
}

const TIMELINE = [
  { year: '2024', quarter: 'Q4', title: 'A centelha', desc: 'Moritz descobre que a conta de luz da sua irmã estava 27% mais cara. Pergunta: por que ela não usa energia solar? Resposta: R$ 25.000 de investimento inicial. E se a gente conectasse consumidores a geradores de excedente na mesma UF?', icon: Sparkles },
  { year: '2025', quarter: 'Q1', title: 'O código', desc: 'Primeira versão do Energy Match em Next.js 14. Match por geolocalização (50 km), validação de capacidade excedente. 12 geradores e 8 consumidores em beta em Belo Horizonte.', icon: Code },
  { year: '2025', quarter: 'Q2', title: 'A primeira conexão', desc: 'Joana (consumidora, Contagem-MG) conecta-se a Seu Zé (gerador, Ibirité-MG). Economia de R$ 280/mês para ela. Renda passiva de R$ 304/mês para ele. A Lei 14.300/2022 funcionou na prática.', icon: Heart },
  { year: '2025', quarter: 'Q3', title: 'A tração', desc: 'Scanner de fatura, match estilo Tinder, ranking de geradores. 200 usuários ativos. Tempo médio de conexão: 4,2 dias. NPS: 78.', icon: TrendingUp },
  { year: '2025', quarter: 'Q4', title: 'A virada', desc: 'Lançamento do token KWATT (Lei 14.478/2022). 1 KWATT = até 30% de 1 kWh. Queima de 1% por transação. Staking opcional. Pré-venda em 2026. Lançamento da rede em 25/01/2027.', icon: Coins },
  { year: '2026', quarter: 'Q2', title: 'A expansão', desc: 'Match por estado e distribuidora. 10 distribuidoras integradas. 5.000 usuários.', icon: MapPin, future: true },
  { year: '2027', quarter: 'Q1', title: 'A rede', desc: 'Lançamento oficial da mainnet KWATT. 100.000 usuários. 10.000 geradores. 1 GWh/mês redistribuído. 50 cidades.', icon: Rocket, future: true },
]

const FUNDADORES = [
  { nome: 'Julio M.', papel: 'CEO & Visionário', bio: 'Engenheiro elétrico com especialização em SEP e energia renovável. Especialista em sistemas elétricos de potência e geração distribuída. Liderou a visão que conectou geradores e consumidores em uma única plataforma.', background: ['Engenharia Elétrica Estácio', 'Especialista em SEP', 'Energia Renovável & Geração Distribuída'], iniciais: 'JM', cor: 'from-emerald-500 to-cyan-500' },
  { nome: 'Moritz', papel: 'CTO & Arquitetura', bio: 'O programador por trás da plataforma. Full-stack sênior, especialista em sistemas distribuídos e arquitetura de microsserviços. Construiu o Energy Match do zero, cada linha de código, cada API, cada componente.', background: ['Engenharia de Software', 'Arquiteto de Microsserviços', 'Full-stack Next.js + Supabase'], iniciais: 'MZ', cor: 'from-cyan-500 to-blue-500' },
  { nome: 'Zayan M.', papel: 'CPO & Produto', bio: 'Product designer com background em energia renovável. Liderou lançamento de 3 produtos B2C no setor solar. Responsável por transformar complexidade regulatória em experiência intuitiva.', background: ['Design PUC-Rio', 'Ex-PM empresa solar', 'Mestrado em transição energética'], iniciais: 'ZM', cor: 'from-purple-500 to-pink-500' },
  { nome: 'Aquiles M.', papel: 'COO & Operações', bio: 'Advogado com MBA em regulação. Especialista em Lei 14.300/2022 e contratos de compensação. Garante que cada transação esteja em conformidade com a ANEEL e a legislação vigente.', background: ['Direito PUC-SP', 'MBA FGV', 'Ex-analista regulatória ANEEL'], iniciais: 'AM', cor: 'from-amber-500 to-orange-500' },
]

const STACK = [
  { categoria: 'Frontend', ferramentas: [
    { nome: 'Next.js 14.2.13', papel: 'Framework React (App Router)', site: 'https://nextjs.org' },
    { nome: 'React 18 + TypeScript 5', papel: 'Biblioteca UI + tipagem estática', site: 'https://react.dev' },
    { nome: 'Tailwind CSS 3.4', papel: 'Design system utilitário', site: 'https://tailwindcss.com' },
  ]},
  { categoria: 'Backend & Dados', ferramentas: [
    { nome: 'Supabase (PostgreSQL 15)', papel: 'Banco + Auth + RLS + Realtime', site: 'https://supabase.com' },
    { nome: 'Vercel Edge Functions', papel: 'API runtime serverless', site: 'https://vercel.com' },
  ]},
  { categoria: 'Pagamentos', ferramentas: [
    { nome: 'Stripe', papel: 'Checkout + subscriptions + webhooks', site: 'https://stripe.com' },
  ]},
  { categoria: 'Geolocalização', ferramentas: [
    { nome: 'OpenStreetMap + Leaflet', papel: 'Mapa base gratuito e interativo', site: 'https://leafletjs.com' },
    { nome: 'Nominatim', papel: 'Geocoding (fallback gratuito)', site: 'https://nominatim.org' },
  ]},
]

const NUMEROS = [
  { value: '3,1 mi', label: 'Sistemas MMGD no Brasil', sub: 'ANEEL – 35,6 GW instalados. +782 mil só em 2024.', gradient: 'from-emerald-400 to-cyan-400' },
  { value: '70%', label: 'Excedente desperdiçado', sub: 'Geradores residenciais não compensam tudo. Energia que poderia abater contas.', gradient: 'from-amber-400 to-orange-400' },
  { value: 'R$ 950', label: 'Tarifa média (R$/MWh)', sub: 'Subiu 18% em 3 anos. O consumidor paga cada vez mais caro.', gradient: 'from-rose-400 to-pink-400' },
  { value: 'R\$ 25k', label: 'Investimento solar médio', sub: 'Inacessível para 80% das famílias. A plataforma elimina essa barreira.', gradient: 'from-violet-400 to-purple-400' },
  { value: 'US\$ 2,1 tri', label: 'Investidos em transição (2024)', sub: 'Recorde global. BloombergNEF. Só em renováveis: US$ 728 bi.', gradient: 'from-cyan-400 to-blue-400' },
  { value: '130', label: 'Países na COP28', sub: 'Compromisso de triplicar renováveis até 2030. US$ 1 tri/ano necessários.', gradient: 'from-emerald-400 to-teal-400' },
]

export default function ManifestoPage() {
  return (
    <main className="min-h-screen bg-[#020617] text-slate-200">
      {/* ============================== HERO ============================== */}
      <section className="relative border-b border-white/[0.04] pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-[40rem] h-[40rem] bg-emerald-500/[0.04] rounded-full blur-[160px]" />
          <div className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-cyan-500/[0.03] rounded-full blur-[140px]" />
        </div>
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-2 mb-5 text-[11px] text-emerald-400/70 uppercase tracking-[0.2em] font-medium animate-fade-up">
            <Sparkles className="w-3 h-3" /> Manifesto · 2024 → 2027
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.04] tracking-tight animate-fade-up" style={{ animationDelay: '100ms' }}>
            Por que<br />
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">existimos.</span>
          </h1>
          <p className="text-base md:text-lg text-slate-400 mt-6 max-w-2xl leading-relaxed animate-fade-up" style={{ animationDelay: '200ms' }}>
            Em 2024, o Brasil instalou <strong className="text-white">782.897 novos sistemas de energia distribuída</strong>.
            Mas <strong className="text-emerald-300">70% do excedente é desperdiçado</strong> porque quem mais precisa dele não sabe que ele existe.
          </p>
          <p className="text-base md:text-lg text-slate-400 mt-2 max-w-2xl leading-relaxed animate-fade-up" style={{ animationDelay: '250ms' }}>
            Existimos para conectar esses dois mundos. Em escala.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 animate-fade-up" style={{ animationDelay: '300ms' }}>
            <Link href="/cadastro" className="group px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-900 font-black transition flex items-center gap-2 text-sm shadow-[0_0_25px_rgba(16,185,129,0.35)]">
              Junte-se à revolução <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#problema" className="px-5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white font-semibold transition flex items-center gap-2 text-sm">
              Entender o problema <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* ============================== PROBLEMA ============================== */}
      <section id="problema" className="relative border-b border-white/[0.04] py-20 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-0 w-[20rem] h-[20rem] bg-amber-500/[0.03] rounded-full blur-[120px]" />
        </div>
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-2 mb-3 text-[11px] text-amber-400/70 uppercase tracking-[0.2em] font-medium animate-fade-up">
            <AlertTriangle className="w-3 h-3" /> O problema
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight animate-fade-up" style={{ animationDelay: '100ms' }}>Três números que machucam.</h2>
          <p className="text-sm text-slate-400 mb-8 max-w-3xl leading-relaxed animate-fade-up" style={{ animationDelay: '150ms' }}>
            O Brasil tem a matriz mais limpa do mundo (~85% renovável), mas o consumidor não sente isso na fatura.
            A Lei 14.300/2022 permite compensação distribuída, mas <strong className="text-white">só funciona se você tem placas no telhado ou alguém te empresta créditos</strong>.
            Até hoje, emprestar créditos era manual, opaco e cheio de burocracia.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { value: 'R$ 950', label: 'Tarifa média BR (R$/MWh)', sub: 'ANEEL 2024. Subiu 18% em 3 anos.', icon: TrendingUp, gradient: 'from-amber-500/20 to-orange-500/5', border: 'border-amber-500/20' },
              { value: '70%', label: 'Excedente desperdiçado', sub: 'Geradores não compensam 100% porque suas UC são pequenas.', icon: Zap, gradient: 'from-rose-500/20 to-pink-500/5', border: 'border-rose-500/20' },
              { value: 'R$ 25k', label: 'Investimento solar médio', sub: 'Inacessível para 80% das famílias brasileiras.', icon: Shield, gradient: 'from-violet-500/20 to-purple-500/5', border: 'border-violet-500/20' },
            ].map((n, i) => {
              const Icon = n.icon
              return (
                <div key={i} className={`group p-6 rounded-2xl bg-glass border ${n.border} hover:scale-[1.02] transition-transform duration-300 animate-fade-up`} style={{ animationDelay: `${200 + i * 100}ms` }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${n.gradient} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-amber-400/80" />
                    </div>
                    <div className="text-4xl md:text-5xl font-black text-white glow-text-emerald">{n.value}</div>
                  </div>
                  <p className="text-xs text-slate-400 font-medium mb-0.5">{n.label}</p>
                  <p className="text-[10px] text-slate-500">{n.sub}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ============================== NOSSOS NÚMEROS ============================== */}
      <section className="relative border-b border-white/[0.04] py-20 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-emerald-500/[0.04] rounded-full blur-[140px]" />
          <div className="absolute bottom-0 left-0 w-[25rem] h-[25rem] bg-cyan-500/[0.03] rounded-full blur-[120px]" />
        </div>
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center gap-2 mb-3 text-[11px] text-emerald-400/70 uppercase tracking-[0.2em] font-medium animate-fade-up">
            <BarChart3 className="w-3 h-3" /> Nossos Números
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight animate-fade-up" style={{ animationDelay: '100ms' }}>A dimensão do que estamos mudando.</h2>
          <p className="text-sm text-slate-400 mb-10 max-w-2xl animate-fade-up" style={{ animationDelay: '150ms' }}>Dados que mostram por que a EnergiaLivre não é só necessária — é urgente.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {NUMEROS.map((n, i) => (
              <div key={i} className="group p-5 rounded-2xl bg-glass border border-white/[0.06] hover:border-emerald-500/30 transition-all duration-300 animate-fade-up relative overflow-hidden" style={{ animationDelay: `${200 + i * 80}ms` }}>
                <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${n.gradient} opacity-5 rounded-full blur-2xl`} />
                <div className={`text-2xl md:text-3xl font-black bg-gradient-to-r ${n.gradient} bg-clip-text text-transparent mb-1`}>{n.value}</div>
                <p className="text-xs text-slate-300 font-bold mb-1">{n.label}</p>
                <p className="text-[10px] text-slate-500 leading-relaxed">{n.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================== SOLUÇÃO ============================== */}
      <section className="relative border-b border-white/[0.04] py-20 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/3 w-[35rem] h-[35rem] bg-emerald-500/[0.03] rounded-full blur-[160px]" />
        </div>
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-2 mb-3 text-[11px] text-emerald-400/70 uppercase tracking-[0.2em] font-medium animate-fade-up">
            <Zap className="w-3 h-3" /> A solução
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight animate-fade-up" style={{ animationDelay: '100ms' }}>Conectar. Compensar. Compartilhar.</h2>
          <p className="text-sm text-slate-400 mb-8 max-w-2xl animate-fade-up" style={{ animationDelay: '150ms' }}>
            Três pilares que transformam excedente em economia — e burocracia em código.
          </p>

          {/* Pilares da plataforma */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              { icon: MapPin, title: 'Match', desc: 'Conectamos consumidores a geradores da mesma UF e distribuidora. Algoritmo prioriza proximidade e maior desconto.', gradient: 'from-emerald-500/10 to-cyan-500/5', border: 'border-emerald-500/30' },
              { icon: Wallet, title: 'Economia', desc: 'O consumidor reduz a fatura sem instalar placas. O gerador transforma excedente em receita. Todo mundo ganha.', gradient: 'from-cyan-500/10 to-blue-500/5', border: 'border-cyan-500/30' },
              { icon: Coins, title: 'Moeda Energia', desc: 'Token KWATT (Lei 14.478/2022): 1 KWATT = até 30% de 1 kWh. Queima de 1% por transação. Staking e governança futura.', gradient: 'from-violet-500/10 to-purple-500/5', border: 'border-violet-500/30' },
            ].map((p, i) => {
              const Icon = p.icon
              return (
                <div key={i} className={`group p-6 rounded-2xl bg-gradient-to-br ${p.gradient} border ${p.border} backdrop-blur-xl hover:scale-[1.03] transition-all duration-300 animate-fade-up`} style={{ animationDelay: `${200 + i * 100}ms` }}>
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${p.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-emerald-400/90" />
                  </div>
                  <h3 className="text-lg font-black text-white mb-2">{p.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{p.desc}</p>
                </div>
              )
            })}
          </div>

          {/* Features originais em grid compacto */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { icon: MapPin, title: 'Match geolocalizado', desc: 'Algoritmo que conecta consumidor e gerador por proximidade, estado ou distribuidora (Lei 14.300/2022).' },
              { icon: Coins, title: 'Token KWATT', desc: 'Utilidade real na plataforma. 1 KWATT = até 30% de 1 kWh. Lei 14.478/2022 (criptoativos).' },
              { icon: CreditCard, title: 'Stripe', desc: 'Pagamento instantâneo entre as partes. Zero burocracia.' },
              { icon: Sun, title: 'Ranking de geradores', desc: '70% preço + 30% avaliação. Geradores que dão desconto real ficam no topo.' },
              { icon: Shield, title: 'LGPD e segurança', desc: 'Row Level Security no Supabase. Dados criptografados. Consentimento explícito.' },
              { icon: Target, title: 'Sem instalação', desc: 'O consumidor economiza sem placas solares. O gerador monetiza o excedente.' },
            ].map((f, i) => {
              const Icon = f.icon
              return (
                <div key={i} className="group p-4 rounded-xl bg-glass border border-white/[0.06] hover:border-emerald-500/30 transition-all duration-300 animate-fade-up" style={{ animationDelay: `${300 + i * 60}ms` }}>
                  <Icon className="w-5 h-5 text-emerald-400/80 mb-2 group-hover:scale-110 transition-transform" />
                  <h3 className="text-sm font-bold text-white mb-1">{f.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ============================== TIMELINE ============================== */}
      <section className="relative border-b border-white/[0.04] py-20 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-[25rem] h-[25rem] bg-emerald-500/[0.03] rounded-full blur-[100px]" />
        </div>
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-2 mb-3 text-[11px] text-emerald-400/70 uppercase tracking-[0.2em] font-medium animate-fade-up">
            <Calendar className="w-3 h-3" /> Marcos
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-10 leading-tight animate-fade-up" style={{ animationDelay: '100ms' }}>De uma dúvida a uma rede.</h2>
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-5 top-2 bottom-2 w-px bg-gradient-to-b from-emerald-500/60 via-cyan-500/30 to-slate-700/20" />

            {TIMELINE.map((m, i) => {
              const Icon = m.icon
              return (
                <div key={i} className="relative pl-14 pb-6 last:pb-0 group animate-fade-up" style={{ animationDelay: `${200 + i * 80}ms` }}>
                  {/* Dot */}
                  <div className={`absolute left-[18px] top-5 w-[9px] h-[9px] rounded-full border-2 border-[#020617] transition-all duration-300 group-hover:scale-150 ${
                    m.future ? 'bg-slate-600' : 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]'
                  }`} />
                  {/* Connecting dot glow */}
                  <div className={`absolute left-[13px] top-[19px] w-[19px] h-[19px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                    m.future ? '' : 'bg-emerald-400/20 blur-sm'
                  }`} />

                  <div className={`p-5 rounded-2xl border transition-all duration-300 group-hover:scale-[1.01] group-hover:border-emerald-500/30 ${
                    m.future
                      ? 'border-white/[0.04] bg-white/[0.01]'
                      : 'bg-glass border-white/[0.06]'
                  }`}>
                    <div className="flex items-start gap-4">
                      <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                        m.future ? 'bg-white/[0.04] text-slate-500' : 'bg-emerald-500/15 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 mb-0.5 flex-wrap">
                          <span className="text-[10px] font-mono font-bold text-emerald-400/80">{m.year}</span>
                          <span className="text-[9px] text-slate-500 font-mono uppercase">{m.quarter}</span>
                          <h3 className="text-sm font-bold text-white">{m.title}</h3>
                          {m.future && <span className="text-[8px] text-amber-400/60 uppercase tracking-wider ml-auto">projeção</span>}
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{m.desc}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ============================== MERCADO ============================== */}
      <section className="relative border-b border-white/[0.04] py-20 overflow-hidden">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-2 mb-3 text-[11px] text-cyan-400/70 uppercase tracking-[0.2em] font-medium animate-fade-up"><Globe2 className="w-3 h-3" /> Contexto</div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-3 leading-tight animate-fade-up" style={{ animationDelay: '100ms' }}>O tamanho da oportunidade.</h2>
          <p className="text-sm text-slate-400 mb-8 max-w-2xl animate-fade-up" style={{ animationDelay: '150ms' }}>Construindo sobre uma tendência que já é gigantesca — e vai triplicar.</p>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="p-6 rounded-2xl bg-glass border border-white/[0.06] animate-fade-up" style={{ animationDelay: '200ms' }}>
              <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-2">Global · BloombergNEF 2025</div>
              <div className="text-4xl font-black text-white mb-1 glow-text-emerald">US$ 2,1 tri</div>
              <p className="text-xs text-slate-400">Investidos em transição energética em 2024. Recorde histórico. Só em renováveis: US$ 728 bi.</p>
              <a href="https://about.bnef.com" target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-[10px] text-cyan-400/70 hover:text-cyan-300">BloombergNEF ↗</a>
            </div>
            <div className="p-6 rounded-2xl bg-glass border border-white/[0.06] animate-fade-up" style={{ animationDelay: '250ms' }}>
              <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-2">Brasil · ANEEL 2025</div>
              <div className="text-4xl font-black text-white mb-1 glow-text-emerald">3,1 milhões</div>
              <p className="text-xs text-slate-400">Sistemas MMGD conectados. 35,6 GW instalados. +782 mil sistemas só em 2024.</p>
              <a href="https://www.gov.br/aneel" target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-[10px] text-cyan-400/70 hover:text-cyan-300">ANEEL ↗</a>
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-glass border border-white/[0.06] flex items-start gap-3 animate-fade-up" style={{ animationDelay: '300ms' }}>
            <Award className="w-5 h-5 text-purple-400/70 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-white mb-0.5">COP28: triplicar renováveis até 2030</p>
              <p className="text-xs text-slate-400">130 países assinaram. São necessários US$ 1 tri/ano em renewables — 50% a mais que o ritmo atual.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================== TIME ============================== */}
      <section className="relative border-b border-white/[0.04] py-20 overflow-hidden">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-2 mb-3 text-[11px] text-purple-400/70 uppercase tracking-[0.2em] font-medium animate-fade-up"><Users className="w-3 h-3" /> Time</div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-3 leading-tight animate-fade-up" style={{ animationDelay: '100ms' }}>Quem constrói isso.</h2>
          <p className="text-xs text-slate-500 mb-8 max-w-2xl animate-fade-up" style={{ animationDelay: '150ms' }}>Fundadores reais. Missão real. Dados reais.</p>
          <div className="grid md:grid-cols-2 gap-4">
            {FUNDADORES.map((f, i) => (
              <div key={i} className="p-6 rounded-2xl bg-glass border border-white/[0.06] hover:border-emerald-500/30 transition-all duration-300 group animate-fade-up" style={{ animationDelay: `${200 + i * 100}ms` }}>
                <div className="flex items-start gap-4 mb-3">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.cor} flex items-center justify-center text-white text-xl font-black shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}>{f.iniciais}</div>
                  <div>
                    <h3 className="text-base font-bold text-white">{f.nome}</h3>
                    <p className="text-[10px] text-emerald-400/70 font-mono uppercase tracking-wider">{f.papel}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-2">{f.bio}</p>
                <ul className="space-y-0.5">
                  {f.background.map((b, j) => (
                    <li key={j} className="text-[10px] text-slate-500 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-emerald-400/50 shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================== STACK ============================== */}
      <section className="relative border-b border-white/[0.04] py-20 overflow-hidden">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-2 mb-3 text-[11px] text-cyan-400/70 uppercase tracking-[0.2em] font-medium animate-fade-up"><Code className="w-3 h-3" /> Ecossistema</div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-3 leading-tight animate-fade-up" style={{ animationDelay: '100ms' }}>Construído sobre ombros de gigantes.</h2>
          <p className="text-sm text-slate-400 mb-8 animate-fade-up" style={{ animationDelay: '150ms' }}>Stacks públicas e abertas. Nenhum lock-in.</p>
          <div className="space-y-5">
            {STACK.map((cat, i) => (
              <div key={i} className="animate-fade-up" style={{ animationDelay: `${200 + i * 80}ms` }}>
                <h3 className="text-[10px] font-bold text-emerald-400/60 uppercase tracking-wider mb-2">{cat.categoria}</h3>
                <div className="grid sm:grid-cols-3 gap-2">
                  {cat.ferramentas.map((tool, j) => (
                    <a key={j} href={tool.site} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-glass border border-white/[0.06] hover:border-emerald-500/30 hover:bg-white/[0.04] transition-all duration-300 group">
                      <p className="text-xs font-bold text-white group-hover:text-emerald-300 transition">{tool.nome}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{tool.papel}</p>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================== DIFERENÇAS ============================== */}
      <section className="relative border-b border-white/[0.04] py-20 overflow-hidden">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-2 mb-3 text-[11px] text-amber-400/70 uppercase tracking-[0.2em] font-medium animate-fade-up"><Target className="w-3 h-3" /> Diferenciais</div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-10 leading-tight animate-fade-up" style={{ animationDelay: '100ms' }}>Por que somos diferentes.</h2>
          <div className="space-y-3">
            {[
              { icon: Shield, titulo: 'Transparência radical', desc: 'Cada transação, cada match, cada taxa. Sem letras miúdas.' },
              { icon: Coins, titulo: 'Token utilitário, não especulativo', desc: '1 KWATT vale até 30% de 1 kWh na plataforma. Lei 14.478/2022.' },
              { icon: Heart, titulo: 'Win-win-win', desc: 'Consumidor economiza. Gerador ganha renda. Distribuidora cumpre metas.' },
              { icon: Users, titulo: 'DAO comunitária (futuro)', desc: 'Decisões de taxa e expansão votadas por detentores de KWATT.' },
            ].map((d, i) => {
              const Icon = d.icon
              return (
                <div key={i} className="flex items-start gap-4 p-5 rounded-2xl bg-glass border border-white/[0.06] hover:border-amber-500/30 transition-all duration-300 group animate-fade-up" style={{ animationDelay: `${200 + i * 80}ms` }}>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400/80 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white mb-0.5">{d.titulo}</h3>
                    <p className="text-xs text-slate-400">{d.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ============================== INVESTIDORES ============================== */}
      <section className="relative border-b border-white/[0.04] py-20 overflow-hidden">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-2 mb-3 text-[11px] text-amber-400/70 uppercase tracking-[0.2em] font-medium animate-fade-up"><Building2 className="w-3 h-3" /> Investidores</div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-3 leading-tight animate-fade-up" style={{ animationDelay: '100ms' }}>Rodadas institucionais.</h2>
          <p className="text-sm text-slate-400 mb-8 animate-fade-up" style={{ animationDelay: '150ms' }}>Fase pré-seed. Rodada institucional será anunciada em 2025.</p>
          <div className="p-6 rounded-2xl bg-glass border border-white/[0.06] animate-fade-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-start gap-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Para gestoras e family offices</h3>
                <p className="text-sm text-slate-400">Se você representa um fundo de venture capital ou family office com foco em energy transition, podemos agendar uma conversa.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs mb-4">
              <span className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-slate-300">Mercado: US$ 728 bi (2024)</span>
              <span className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-slate-300">Brasil: 3,1M sistemas</span>
              <span className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-slate-300">Crescimento: +782k/ano</span>
            </div>
            <a href="mailto:investidores@energialivre.dev.br?subject=Interesse%20em%20rodada" className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-900 font-black transition text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              Falar com o time <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
          <p className="text-[9px] text-slate-600 mt-3 italic">* Token KWATT tem finalidade utilitária (Lei 14.478/2022). Esta página não constitui oferta de valores mobiliários.</p>
        </div>
      </section>

      {/* ============================== CTA ============================== */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50rem] h-[30rem] bg-emerald-500/[0.04] rounded-full blur-[180px]" />
          <div className="absolute bottom-0 left-1/3 w-[30rem] h-[30rem] bg-cyan-500/[0.03] rounded-full blur-[140px]" />
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-black mb-6 uppercase tracking-wider animate-fade-up">
            <Sparkles className="w-3.5 h-3.5" /> Faça parte dessa história
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-4 leading-[1.08] tracking-tight animate-fade-up" style={{ animationDelay: '100ms' }}>
            A transição energética<br />
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-300 bg-clip-text text-transparent">começa pela sua fatura.</span>
          </h2>
          <p className="text-base text-slate-400 mb-8 max-w-xl mx-auto leading-relaxed animate-fade-up" style={{ animationDelay: '150ms' }}>
          Seja consumidor (economize até 90%), gerador (renda passiva) ou parceiro — 
          você faz parte dessa história. <strong className="text-emerald-300">Milhares já estão dentro. Falta você.</strong>
          </p>
          <div className="flex flex-wrap justify-center gap-4 animate-fade-up" style={{ animationDelay: '200ms' }}>
            <Link href="/cadastro" className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-900 font-black transition flex items-center gap-2 text-base shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)]">
              Criar conta grátis <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/token" className="group px-8 py-4 rounded-2xl bg-white/[0.04] border border-white/[0.10] hover:bg-white/[0.08] hover:border-emerald-500/30 text-white font-bold transition flex items-center gap-2 text-base">
              Conhecer o KWATT <Coins className="w-4 h-4" />
            </Link>
          </div>
          <p className="text-[10px] text-slate-600 mt-6 animate-fade-up" style={{ animationDelay: '250ms' }}>
            ⚡ Cadastro gratuito · Análise em 24h · Sem fidelidade · LGPD
          </p>
        </div>
      </section>

      {/* ============================== DISCLAIMER ============================== */}
      <footer className="border-t border-white/[0.04] py-8">
        <div className="max-w-4xl mx-auto px-6 text-[9px] text-slate-600 leading-relaxed">
          <p><strong>Disclaimers legais:</strong> Menções a fornecedores (Next.js, Supabase, Stripe, Vercel) não representam parceria comercial. KWATT é token de utilidade (Lei 14.478/2022), não valor mobiliário. Compensação de energia sob Lei 14.300/2022 e regulação ANEEL. Dados de mercado linkados na íntegra. Plataforma em operação. <strong>Prazo de integração é de até 90 dias em qualquer plano, conforme regulação das distribuidoras.</strong> 2024 → 2027.</p>
        </div>
      </footer>
    </main>
  )
}
