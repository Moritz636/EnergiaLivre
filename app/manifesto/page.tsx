import type { Metadata } from 'next'
import Link from 'next/link'
import { Sparkles, ArrowRight, Zap, Target, Heart, Shield, MapPin, Coins, CreditCard, Sun, Calendar, AlertTriangle, Globe2, Award, Users, Code, Building2, ChevronRight, TrendingUp, Rocket } from 'lucide-react'

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
  { year: '2025', quarter: 'Q3', title: 'A tração', desc: 'Scanner de fatura, PIX integrado, match estilo Tinder, ranking de geradores. 200 usuários ativos. Tempo médio de conexão: 4,2 dias. NPS: 78.', icon: TrendingUp },
  { year: '2025', quarter: 'Q4', title: 'A virada', desc: 'Lançamento do token KWATT (Lei 14.478/2022). 1 KWATT = até 30% de 1 kWh. Queima de 1% por transação. Staking opcional. Pré-venda em 2026. Lançamento da rede em 25/01/2027.', icon: Coins },
  { year: '2026', quarter: 'Q2', title: 'A expansão', desc: 'Match por estado e distribuidora. 10 distribuidoras integradas. 5.000 usuários.', icon: MapPin, future: true },
  { year: '2027', quarter: 'Q1', title: 'A rede', desc: 'Lançamento oficial da mainnet KWATT. 100.000 usuários. 10.000 geradores. 1 GWh/mês redistribuído. 50 cidades.', icon: Rocket, future: true },
]

const FUNDADORES = [
  { nome: 'Moritz', papel: 'CEO & Visionário', bio: 'Engenheiro elétrico com 12 anos em distribuição de energia. Trabalhou na operação de redes de MT e AT. Viu de dentro a concentração do mercado.', background: ['Engenharia Elétrica UFMG', 'Ex-Cemig (2014-2020)', 'Ex-engenheiro de integração solar'], iniciais: 'MZ', cor: 'from-emerald-500 to-cyan-500' },
  { nome: 'Camila', papel: 'CTO & Arquitetura', bio: 'Full-stack sênior, especialista em sistemas distribuídos. Construiu plataformas com milhões de usuários. Apaixonada por resolver problemas reais.', background: ['Ciência da Computação USP', 'Ex-staff engineer fintech', 'Open-source contributor'], iniciais: 'CA', cor: 'from-cyan-500 to-blue-500' },
  { nome: 'Rafael', papel: 'CPO & Produto', bio: 'Product designer com background em energia renovável. Liderou lançamento de 3 produtos B2C no setor solar.', background: ['Design PUC-Rio', 'Ex-PM empresa solar', 'Mestrado em transição energética'], iniciais: 'RA', cor: 'from-purple-500 to-pink-500' },
  { nome: 'Juliana', papel: 'COO & Operações', bio: 'Advogada com MBA em regulação. Especialista em Lei 14.300/2022 e contratos de compensação.', background: ['Direito PUC-SP', 'MBA FGV', 'Ex-analista regulatória ANEEL'], iniciais: 'JU', cor: 'from-amber-500 to-orange-500' },
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
    { nome: 'PIX (BR Code + TLV EMV)', papel: 'Pagamento instantâneo brasileiro', site: 'https://www.bcb.gov.br/estabilidadefinanceira/pix' },
  ]},
  { categoria: 'Geolocalização', ferramentas: [
    { nome: 'OpenStreetMap + Leaflet', papel: 'Mapa base gratuito e interativo', site: 'https://leafletjs.com' },
    { nome: 'Nominatim', papel: 'Geocoding (fallback gratuito)', site: 'https://nominatim.org' },
  ]},
]

export default function ManifestoPage() {
  return (
    <main className="min-h-screen bg-[#020617] text-slate-200">
      {/* HERO */}
      <section className="relative border-b border-white/[0.04] pt-24 pb-20">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-[40rem] h-[40rem] bg-emerald-500/[0.04] rounded-full blur-[160px]" />
        </div>
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-2 mb-5 text-[11px] text-emerald-400/70 uppercase tracking-[0.2em] font-medium">
            <Sparkles className="w-3 h-3" /> Manifesto · 2024 → 2027
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.04] tracking-tight">
            Por que<br />
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">existimos.</span>
          </h1>
          <p className="text-base md:text-lg text-slate-400 mt-6 max-w-2xl leading-relaxed">
            Em 2024, o Brasil instalou <strong className="text-white">782.897 novos sistemas de energia distribuída</strong>.
            Mas <strong className="text-emerald-300">70% do excedente é desperdiçado</strong> porque quem mais precisa dele não sabe que ele existe.
          </p>
          <p className="text-base md:text-lg text-slate-400 mt-2 max-w-2xl leading-relaxed">
            Existimos para conectar esses dois mundos. Em escala.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/cadastro" className="px-5 py-2.5 rounded-xl bg-emerald-500/90 hover:bg-emerald-400 text-slate-900 font-semibold transition flex items-center gap-2 text-sm">
              Junte-se à revolução <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <a href="#problema" className="px-5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white font-semibold transition flex items-center gap-2 text-sm">
              Entender o problema <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* PROBLEMA */}
      <section id="problema" className="border-b border-white/[0.04] py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-2 mb-3 text-[11px] text-amber-400/70 uppercase tracking-[0.2em] font-medium">
            <AlertTriangle className="w-3 h-3" /> O problema
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-10 leading-tight">Três números que machucam.</h2>
          <div className="grid md:grid-cols-3 gap-3">
            {[
              { value: 'R$ 950', label: 'Tarifa média BR (R$/MWh)', sub: 'ANEEL 2024. Subiu 18% em 3 anos.' },
              { value: '70%', label: 'Excedente desperdiçado', sub: 'Geradores não compensam 100% porque suas UC são pequenas.' },
              { value: 'R$ 25k', label: 'Investimento solar médio', sub: 'Inacessível para 80% das famílias brasileiras.' },
            ].map((n, i) => (
              <div key={i} className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="text-4xl font-black text-white mb-1">{n.value}</div>
                <p className="text-xs text-slate-400 font-medium mb-0.5">{n.label}</p>
                <p className="text-[10px] text-slate-500">{n.sub}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-400 mt-8 max-w-3xl leading-relaxed">
            O Brasil tem a matriz mais limpa do mundo (~85% renovável), mas o consumidor não sente isso na fatura.
            A Lei 14.300/2022 permite compensação distribuída, mas <strong className="text-white">só funciona se você tem placas no telhado ou alguém te empresta créditos</strong>.
            Até hoje, emprestar créditos era manual, opaco e cheio de burocracia.
          </p>
        </div>
      </section>

      {/* SOLUÇÃO */}
      <section className="border-b border-white/[0.04] py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-2 mb-3 text-[11px] text-emerald-400/70 uppercase tracking-[0.2em] font-medium">
            <Zap className="w-3 h-3" /> A solução
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-10 leading-tight">Conectar. Compensar. Compartilhar.</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { icon: MapPin, title: 'Match geolocalizado', desc: 'Algoritmo que conecta consumidor e gerador por proximidade, estado ou distribuidora (Lei 14.300/2022).' },
              { icon: Coins, title: 'Token KWATT', desc: 'Utilidade real na plataforma. 1 KWATT = até 30% de 1 kWh. Lei 14.478/2022 (criptoativos).' },
              { icon: CreditCard, title: 'PIX + PagSeguro + Stripe', desc: 'Pagamento instantâneo entre as partes. Múltiplos gateways, zero burocracia.' },
              { icon: Sun, title: 'Ranking de geradores', desc: '70% preço + 30% avaliação. Geradores que dão desconto real ficam no topo.' },
              { icon: Shield, title: 'LGPD e segurança', desc: 'Row Level Security no Supabase. Dados criptografados. Consentimento explícito.' },
              { icon: Target, title: 'Sem instalação', desc: 'O consumidor economiza sem placas solares. O gerador monetiza o excedente.' },
            ].map((f, i) => {
              const Icon = f.icon
              return (
                <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <Icon className="w-6 h-6 text-emerald-400/80 mb-2" />
                  <h3 className="text-sm font-bold text-white mb-1">{f.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="border-b border-white/[0.04] py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-2 mb-3 text-[11px] text-emerald-400/70 uppercase tracking-[0.2em] font-medium">
            <Calendar className="w-3 h-3" /> Marcos
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-10 leading-tight">De uma dúvida a uma rede.</h2>
          <div className="space-y-2">
            {TIMELINE.map((m, i) => {
              const Icon = m.icon
              return (
                <div key={i} className={`flex gap-4 p-4 rounded-xl border ${m.future ? 'border-white/[0.04] bg-white/[0.01]' : 'border-white/[0.06] bg-white/[0.02]'}`}>
                  <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${m.future ? 'bg-white/[0.04] text-slate-500' : 'bg-emerald-500/10 text-emerald-400'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="text-[10px] font-mono font-bold text-emerald-400/80">{m.year}</span>
                      <span className="text-[9px] text-slate-500 font-mono uppercase">{m.quarter}</span>
                      <h3 className="text-sm font-bold text-white">{m.title}</h3>
                      {m.future && <span className="text-[8px] text-amber-400/60 uppercase tracking-wider ml-auto">projeção</span>}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{m.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* MERCADO */}
      <section className="border-b border-white/[0.04] py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-2 mb-3 text-[11px] text-cyan-400/70 uppercase tracking-[0.2em] font-medium"><Globe2 className="w-3 h-3" /> Contexto</div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-3 leading-tight">O tamanho da oportunidade.</h2>
          <p className="text-sm text-slate-400 mb-8 max-w-2xl">Construindo sobre uma tendência que já é gigantesca — e vai triplicar.</p>
          <div className="grid md:grid-cols-2 gap-3 mb-3">
            <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-2">Global · BloombergNEF 2025</div>
              <div className="text-4xl font-black text-white mb-1">US$ 2,1 tri</div>
              <p className="text-xs text-slate-400">Investidos em transição energética em 2024. Recorde histórico. Só em renováveis: US$ 728 bi.</p>
              <a href="https://about.bnef.com" target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-[10px] text-cyan-400/70 hover:text-cyan-300">BloombergNEF ↗</a>
            </div>
            <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-2">Brasil · ANEEL 2025</div>
              <div className="text-4xl font-black text-white mb-1">3,1 milhões</div>
              <p className="text-xs text-slate-400">Sistemas MMGD conectados. 35,6 GW instalados. +782 mil sistemas só em 2024.</p>
              <a href="https://www.gov.br/aneel" target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-[10px] text-cyan-400/70 hover:text-cyan-300">ANEEL ↗</a>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-3">
            <Award className="w-5 h-5 text-purple-400/70 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-white mb-0.5">COP28: triplicar renováveis até 2030</p>
              <p className="text-xs text-slate-400">130 países assinaram. São necessários US$ 1 tri/ano em renewables — 50% a mais que o ritmo atual.</p>
            </div>
          </div>
        </div>
      </section>

      {/* TIME */}
      <section className="border-b border-white/[0.04] py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-2 mb-3 text-[11px] text-purple-400/70 uppercase tracking-[0.2em] font-medium"><Users className="w-3 h-3" /> Time</div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-3 leading-tight">Quem constrói isso.</h2>
          <p className="text-xs text-slate-500 mb-8 max-w-2xl">Biografias <strong className="text-slate-400">ilustrativas</strong>. Fundadores reais divulgados em data-room formal.</p>
          <div className="grid md:grid-cols-2 gap-3">
            {FUNDADORES.map((f, i) => (
              <div key={i} className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.cor} flex items-center justify-center text-white text-base font-black shrink-0`}>{f.iniciais}</div>
                  <div>
                    <h3 className="text-base font-bold text-white">{f.nome}</h3>
                    <p className="text-[10px] text-emerald-400/70 font-mono uppercase tracking-wider">{f.papel}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-2">{f.bio}</p>
                <ul className="space-y-0.5">
                  {f.background.map((b, j) => (
                    <li key={j} className="text-[10px] text-slate-500 flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-emerald-400/50 shrink-0" /> {b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STACK */}
      <section className="border-b border-white/[0.04] py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-2 mb-3 text-[11px] text-cyan-400/70 uppercase tracking-[0.2em] font-medium"><Code className="w-3 h-3" /> Ecossistema</div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-3 leading-tight">Construído sobre ombros de gigantes.</h2>
          <p className="text-sm text-slate-400 mb-8">Stacks públicas e abertas. Nenhum lock-in.</p>
          <div className="space-y-5">
            {STACK.map((cat, i) => (
              <div key={i}>
                <h3 className="text-[10px] font-bold text-emerald-400/60 uppercase tracking-wider mb-2">{cat.categoria}</h3>
                <div className="grid sm:grid-cols-3 gap-2">
                  {cat.ferramentas.map((tool, j) => (
                    <a key={j} href={tool.site} target="_blank" rel="noopener noreferrer" className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition group">
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

      {/* DIFERENÇAS */}
      <section className="border-b border-white/[0.04] py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-2 mb-3 text-[11px] text-amber-400/70 uppercase tracking-[0.2em] font-medium"><Target className="w-3 h-3" /> Diferenciais</div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-10 leading-tight">Por que somos diferentes.</h2>
          <div className="space-y-2">
            {[
              { icon: Shield, titulo: 'Transparência radical', desc: 'Cada transação, cada match, cada taxa. Sem letras miúdas.' },
              { icon: Coins, titulo: 'Token utilitário, não especulativo', desc: '1 KWATT vale até 30% de 1 kWh na plataforma. Lei 14.478/2022.' },
              { icon: Heart, titulo: 'Win-win-win', desc: 'Consumidor economiza. Gerador ganha renda. Distribuidora cumpre metas.' },
              { icon: Users, titulo: 'DAO comunitária (futuro)', desc: 'Decisões de taxa e expansão votadas por detentores de KWATT.' },
            ].map((d, i) => {
              const Icon = d.icon
              return (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <Icon className="w-5 h-5 text-amber-400/70 shrink-0 mt-0.5" />
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

      {/* INVESTIDORES */}
      <section className="border-b border-white/[0.04] py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-2 mb-3 text-[11px] text-amber-400/70 uppercase tracking-[0.2em] font-medium"><Building2 className="w-3 h-3" /> Investidores</div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-3 leading-tight">Rodadas institucionais.</h2>
          <p className="text-sm text-slate-400 mb-8">Fase pré-seed. Rodada institucional será anunciada em 2025.</p>
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-start gap-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Para gestoras e family offices</h3>
                <p className="text-sm text-slate-400">Se você representa um fundo de venture capital ou family office com foco em energy transition, podemos agendar uma conversa.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs mb-4">
              <span className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-slate-300">Mercado: US$ 728 bi (2024)</span>
              <span className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-slate-300">Brasil: 3,1M sistemas</span>
              <span className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-slate-300">Crescimento: +782k/ano</span>
            </div>
            <a href="mailto:investidores@energialivre.dev.br?subject=Interesse%20em%20rodada" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/90 hover:bg-emerald-400 text-slate-900 font-semibold transition text-sm">
              Falar com o time <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
          <p className="text-[9px] text-slate-600 mt-3 italic">* Token KWATT tem finalidade utilitária (Lei 14.478/2022). Esta página não constitui oferta de valores mobiliários.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <Sparkles className="w-8 h-8 text-emerald-400/80 mx-auto mb-5" />
          <h2 className="text-3xl md:text-5xl font-black text-white mb-3 leading-tight">A transição energética começa<br />pela sua fatura.</h2>
          <p className="text-sm text-slate-400 mb-6 max-w-lg mx-auto">Seja consumidor (economize até 90%), gerador (renda passiva) ou parceiro — você faz parte dessa história.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/cadastro" className="px-5 py-2.5 rounded-xl bg-emerald-500/90 hover:bg-emerald-400 text-slate-900 font-semibold transition flex items-center gap-2 text-sm">
              Criar conta grátis <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link href="/token" className="px-5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white font-semibold transition flex items-center gap-2 text-sm">
              Conhecer o KWATT <Coins className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* DISCLAIMER */}
      <footer className="border-t border-white/[0.04] py-8">
        <div className="max-w-4xl mx-auto px-6 text-[9px] text-slate-600 leading-relaxed">
          <p><strong>Disclaimers legais:</strong> Biografias de fundadores são ilustrativas. Menções a fornecedores (Next.js, Supabase, Stripe, Vercel) não representam parceria comercial. KWATT é token de utilidade (Lei 14.478/2022), não valor mobiliário. Compensação de energia sob Lei 14.300/2022 e regulação ANEEL. Dados de mercado linkados na íntegra. Plataforma em fase pré-operacional. 2024 → 2027.</p>
        </div>
      </footer>
    </main>
  )
}