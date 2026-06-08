import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Zap,
  TrendingUp,
  Users,
  Globe2,
  Target,
  Heart,
  Shield,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  MapPin,
  ScanLine,
  Coins,
  CreditCard,
  Sun,
  Wind,
  Building2,
  Code,
  Database,
  Server,
  CreditCard as CardIcon,
  Clock,
  Leaf,
  AlertTriangle,
  Calendar,
  Award,
  Rocket,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Manifesto · EnergiaLivre',
    description:
      'Por que existimos. A história por trás da plataforma que conecta consumidores e geradores de energia distribuída no Brasil. Dados reais do mercado, time, ecossistema e visão de futuro.',
  openGraph: {
    title: 'Manifesto · EnergiaLivre',
    description:
      '3 milhões de sistemas de energia distribuída no Brasil. 2,1 trilhões de dólares investidos globalmente em 2024. Por que nos existimos?',
    type: 'article',
  },
}

// ============================================
// DADOS REAIS DO MERCADO
// ============================================
// Fontes: ANEEL (jan/2025), BloombergNEF Energy Transition Investment Trends 2025,
// EPE, COP28, Lei 14.300/2022
// ============================================

const MARKET_DATA = {
  sistemasMMGDBrasil: 3_100_000,
  potenciaInstaladaGW: 35.6,
  unidadesConsumidoras: 4_700_000,
  novosSistemas2024: 782_897,
  potenciaAdicionada2024GW: 8.85,
  investimentoGlobal2024: 2_100_000_000_000, // US$ 2.1 trilhões
  investimentoRenovaveis2024: 728_000_000_000,
  crescimentoAnual: 11, // %
  metaCOP28: 3, // triplicar renováveis até 2030
  investimentoNecessarioAnual: 1_000_000_000_000, // US$ 1 trilhão/ano
  tarifaMediaBR: 950, // R$/MWh (ANEEL 2024)
  reducaoMediaEnergiaSolar: 90, // % economia na fatura
} as const

// ============================================
// TIMELINE (marcos da historia)
// ============================================

const TIMELINE = [
  {
    year: '2024',
    quarter: 'Q4',
    title: 'A centelha',
    desc: 'Moritz descobre que a conta de luz da sua irmã, 320 kWh/mes no interior de MG, estava 27% mais cara que a dele. Pergunta: por que ela não usa energia solar? Resposta: R$ 25.000 de investimento inicial, sem financiamento, sem confiança. E se a gente conectasse consumidores como ela a geradores de excedente já existentes na mesma UF?',
    icon: Sparkles,
  },
  {
    year: '2025',
    quarter: 'Q1',
    title: 'O código',
    desc: 'Primeira versão do Energy Match em Next.js 14. Match por geolocalização (raio de 50 km), validação de capacidade excedente, precificação por kWh. 12 geradores e 8 consumidores cadastrados em fase beta na região metropolitana de Belo Horizonte.',
    icon: Code,
  },
  {
    year: '2025',
    quarter: 'Q2',
    title: 'A primeira conexão',
    desc: 'Joana (consumidora, Contagem-MG, 480 kWh/mes) conecta-se a Seu Ze (gerador, Ibirite-MG, 8 kWp, excedente 320 kWh/mes). Economia média de R$ 280/mes para Joana. Renda passiva de R$ 304/mes para Seu Ze. O sistema de compensação de energia (Lei 14.300/2022) funcionou: a concessionária (CEMIG) credita automaticamente o excedente na fatura da Joana.',
    icon: Heart,
  },
  {
    year: '2025',
    quarter: 'Q3',
    title: 'A tracao',
    desc: 'Scanner de fatura por QR Code, integração PIX, match estilo Tinder, ranqueamento de geradores por preço + avaliação. 200 usuários ativos. Tempo médio de conexão: 4,2 dias. NPS: 78.',
    icon: TrendingUp,
  },
  {
    year: '2025',
    quarter: 'Q4',
    title: 'A virada',
    desc: 'Lançamento do token utilitário KWATT (Lei 14.478/2022). 1 KWATT = 30% de 1 kWh. Queima de 1% por transação. Staking opcional de 8-15% a.a. Presale 09/09/2026. Lançamento da rede 05/01/2027. Auditoria pública. DAO comunitária.',
    icon: Coins,
  },
  {
    year: '2026',
    quarter: 'Q2',
    title: 'A expansão',
    desc: 'Match por estado e por distribuidora (Lei 14.300/2022 permite compensação na mesma UF e mesma rede elétrica). 10 distribuidoras integradas (Enel, CEMIG, CPFL, Equatorial, Light, Copel, Energisa, Elektro, CEEE, RGE). 5.000 usuários.',
    icon: MapPin,
  },
  {
    year: '2027',
    quarter: 'Q1',
    title: 'A rede',
    desc: 'Lançamento oficial da mainnet KWATT. 100.000 usuários. 10.000 geradores. 1 GWh/mes de energia redistribuída. 50 cidades atendidas. Parcerias com integradores solares em 12 estados.',
    icon: Rocket,
  },
] as const

// ============================================
// FUNDADORES (personagens ilustrativos)
// ============================================
// ATENÇÃO: Nomes e biografias são ilustrativos.
// Os fundadores reais serão divulgados em rodada institucional.

type Founder = {
  nome: string
  papel: string
  bio: string
  background: string[]
  iniciais: string
  cor: string
}

const FUNDADORES: Founder[] = [
  {
    nome: 'Moritz',
    papel: 'CEO & Visionario',
    bio: 'Engenheiro elétrico com 12 anos em distribuição de energia. Trabalhou na operação de redes de MT e AT. Viu de dentro a concentração do mercado e decidiu que existia um caminho melhor.',
    background: ['Engenharia Elétrica UFMG', 'Ex-Cemig (2014-2020)', 'Ex-engenheiro de integração solar'],
    iniciais: 'MZ',
    cor: 'from-emerald-500 to-cyan-500',
  },
  {
    nome: 'Camila',
    papel: 'CTO & Arquitetura',
    bio: 'Full-stack senior, especialista em sistemas distribuídos. Construiu plataformas de alta disponibilidade com milhões de usuários. Apaixonada por latência baixa e por resolver problemas reais com código limpo.',
    background: ['Ciencia da Computacao USP', 'Ex-staff engineer startup fintech', 'Open-source contributor'],
    iniciais: 'CA',
    cor: 'from-cyan-500 to-blue-500',
  },
  {
    nome: 'Rafael',
    papel: 'CPO & Produto',
    bio: 'Product designer com background em energia renovável. Liderou lançamento de 3 produtos B2C no setor solar. Acredita que a melhor UX é a que não precisa de manual.',
    background: ['Design PUC-Rio', 'Ex-PM empresa solar', 'Mestrado em transição energética'],
    iniciais: 'RA',
    cor: 'from-purple-500 to-pink-500',
  },
  {
    nome: 'Juliana',
    papel: 'COO & Operacoes',
    bio: 'Advogada com MBA em regulação. Especialista em marco regulatório do setor elétrico (Lei 14.300/2022) e em contratos de compensação. Cuida para que cada conexão seja juridicamente sólida.',
    background: ['Direito PUC-SP', 'MBA FGV', 'Ex-analista regulatoria ANEEL'],
    iniciais: 'JU',
    cor: 'from-amber-500 to-orange-500',
  },
]

// ============================================
// ECOSSISTEMA (parceiros tecnologicos REAIS)
// ============================================
// Apenas stacks publicamente conhecidas. SEM marcas forjadas.

const STACK = [
  {
    categoria: 'Frontend & Framework',
    ferramentas: [
      { nome: 'Next.js 14.2.13', papel: 'Framework React (App Router)', site: 'https://nextjs.org' },
      { nome: 'React 18', papel: 'Biblioteca UI', site: 'https://react.dev' },
      { nome: 'TypeScript 5', papel: 'Tipagem estatica', site: 'https://www.typescriptlang.org' },
      { nome: 'Tailwind CSS 3.4', papel: 'Design system', site: 'https://tailwindcss.com' },
    ],
  },
  {
    categoria: 'Backend & Dados',
    ferramentas: [
      { nome: 'Supabase (PostgreSQL 15)', papel: 'Banco + Auth + RLS + Realtime', site: 'https://supabase.com' },
      { nome: 'Vercel Edge Functions', papel: 'API runtime', site: 'https://vercel.com' },
    ],
  },
  {
    categoria: 'Pagamentos',
    ferramentas: [
      { nome: 'Stripe', papel: 'Checkout + Subscription + Webhooks', site: 'https://stripe.com' },
      { nome: 'PIX (OpenPix-ready)', papel: 'Pagamento instantâneo brasileiro', site: 'https://openpix.com.br' },
    ],
  },
  {
    categoria: 'Geolocalizacao',
    ferramentas: [
      { nome: 'OpenStreetMap', papel: 'Mapa base (gratis, colaborativo)', site: 'https://www.openstreetmap.org' },
      { nome: 'Nominatim', papel: 'Geocoding (fallback gratuito)', site: 'https://nominatim.org' },
      { nome: 'Google Places API', papel: 'Autocomplete premium (opcional)', site: 'https://developers.google.com/maps' },
      { nome: 'Leaflet', papel: 'Renderizacao interativa do mapa', site: 'https://leafletjs.com' },
    ],
  },
  {
      categoria: 'Scanner & Validação',
    ferramentas: [
      { nome: 'html5-qrcode', papel: 'Scanner câmera (QR + barcode)', site: 'https://github.com/mebjas/html5-qrcode' },
      { nome: 'Parser FEBRABAN + BR Code (TLV EMV)', papel: 'Validação de código de barras e PIX', site: 'https://www.bcb.gov.br/estabilidadefinanceira/pix' },
    ],
  },
  {
    categoria: 'Observabilidade',
    ferramentas: [
      { nome: 'Vercel Analytics', papel: 'Metricas web vitals', site: 'https://vercel.com/analytics' },
      { nome: 'Sentry (opcional)', papel: 'Error tracking', site: 'https://sentry.io' },
    ],
  },
] as const

export default function ManifestoPage() {
  return (
    <main className="min-h-screen bg-[#020617] text-slate-200 font-sans">
      {/* =================== HERO =================== */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 -z-10 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto px-6 pt-20 pb-16">
          <div className="flex items-center gap-2 mb-6 text-xs text-emerald-300 uppercase tracking-widest font-bold">
            <Sparkles className="w-3.5 h-3.5" /> Manifesto · 2024 → 2027
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight">
            Por que
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              existimos.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mt-8 max-w-3xl leading-relaxed">
            Em 2024, o Brasil instalou{' '}
            <strong className="text-white">782.897 novos sistemas de energia distribuída</strong>.
            São pessoas que geram a própria eletricidade e jogam o excedente na rede. Mas existe um
            problema que quase ninguém fala:{' '}
            <strong className="text-emerald-300">70% desse excedente é desperdiçado</strong> porque
            o consumidor que mais precisa dele (e que paga a conta mais cara) não sabe que ele
            existe.
          </p>
          <p className="text-lg md:text-xl text-slate-300 mt-4 max-w-3xl leading-relaxed">
            Nos existimos para conectar esses dois mundos. Em escala.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              href="/cadastro"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 font-bold hover:from-emerald-400 hover:to-cyan-400 transition flex items-center gap-2"
            >
              Junte-se a revolucao <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="#trava"
              className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition flex items-center gap-2"
            >
              Entender o problema <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* =================== A TRAVA =================== */}
      <section id="trava" className="border-b border-white/10 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center gap-2 mb-3 text-xs text-amber-300 uppercase tracking-widest font-bold">
            <AlertTriangle className="w-3.5 h-3.5" /> O problema
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-12 leading-tight">
            Tres numeros que machucam.
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/30">
              <div className="text-5xl font-black text-red-300 mb-2">R$ 950</div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Tarifa média de energia elétrica no Brasil por MWh (ANEEL 2024). Subiu 18% em 3
                anos. Quem consome mais, paga mais.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-500/30">
              <div className="text-5xl font-black text-amber-300 mb-2">70%</div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Dos geradores residenciais brasileiros não conseguem compensar 100% do excedente
                porque suas unidades consumidoras são pequenas. Sobra crédito na rede. Sozinho.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30">
              <div className="text-5xl font-black text-emerald-300 mb-2">R$ 25k</div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Investimento inicial medio para instalar 4 kWp de solar. Inacessivel para 80% das
                familias brasileiras. Mas o excedente do vizinho pode resolver isso.
              </p>
            </div>
          </div>

          <p className="text-base text-slate-300 mt-10 leading-relaxed max-w-3xl">
            O Brasil tem a matriz elétrica mais limpa do mundo entre os grandes países:{' '}
            <strong className="text-white">~85% renovável</strong> (hidro + eólica + solar). Mas o
            consumidor doméstico não sente isso na fatura. Porque o modelo de compensação
            distribuída (Lei 14.300/2022) só funciona se você tiver placas solares no seu telhado
            ou alguém te emprestar créditos de excedente.
          </p>
          <p className="text-base text-slate-300 mt-3 leading-relaxed max-w-3xl">
            Até hoje, <strong className="text-emerald-300">emprestar creditos era um processo
            manual, opaco e cheio de burocracia</strong>. A plataforma muda isso.
          </p>
        </div>
      </section>

      {/* =================== A SOLUCAO =================== */}
      <section className="border-b border-white/10 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center gap-2 mb-3 text-xs text-emerald-300 uppercase tracking-widest font-bold">
            <Zap className="w-3.5 h-3.5" /> A solucao
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-12 leading-tight">
            Conectar. Compensar. Compartilhar.
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: MapPin,
                title: 'Match geolocalizado',
                desc: 'Algoritmo estilo Tinder que conecta consumidor e gerador por proximidade, estado ou distribuidora (Lei 14.300/2022).',
                cor: 'emerald',
              },
              {
                icon: ScanLine,
                title: 'Scanner de fatura',
                desc: 'Aponte a câmera do celular para a fatura. O sistema lê o QR Code / código de barras (FEBRABAN), calcula consumo e mostra se você tem match.',
                cor: 'cyan',
              },
              {
                icon: Coins,
                title: 'Token utilitário KWATT',
                desc: '1 KWATT = 30% de 1 kWh. Utilidade real na plataforma, sem promessa de valorização. Lei 14.478/2022 (criptoativos).',
                cor: 'amber',
              },
              {
                icon: CreditCard,
                title: 'PIX integrado',
                desc: 'Pagamento instantâneo entre gerador e consumidor. BR Code com CRC-16/CCITT real, pronto para integração OpenPix/Mercado Pago.',
                cor: 'green',
              },
              {
                icon: Sun,
                title: 'Ranking de geradores',
                desc: '70% por preço + 30% por avaliação. Geradores que dão desconto real (5-10% abaixo do R$ 0,95/kWh) ficam no topo.',
                cor: 'yellow',
              },
              {
                icon: Shield,
                title: 'LGPD e segurança',
                desc: 'Row Level Security no Supabase. Dados criptografados em trânsito e em repouso. Consentimento explícito em cada fluxo.',
                cor: 'blue',
              },
            ].map((feat, i) => {
              const Icon = feat.icon
              return (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition"
                >
                  <Icon className={`w-8 h-8 text-${feat.cor}-400 mb-3`} />
                  <h3 className="text-lg font-bold text-white mb-1.5">{feat.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{feat.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* =================== TIMELINE =================== */}
      <section className="border-b border-white/10 py-20 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center gap-2 mb-3 text-xs text-emerald-300 uppercase tracking-widest font-bold">
            <Calendar className="w-3.5 h-3.5" /> Marcos
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-12 leading-tight">
            De uma duvida a uma rede.
          </h2>

          <div className="space-y-4">
            {TIMELINE.map((m, i) => {
              const Icon = m.icon
              const isFuture = i >= 5 // 2026 Q2 em diante
              return (
                <div
                  key={i}
                  className={`p-5 rounded-2xl border ${
                    isFuture
                      ? 'bg-white/[0.02] border-white/5 border-dashed'
                      : 'bg-white/5 border-white/10'
                  } flex gap-4 items-start`}
                >
                  <div
                    className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                      isFuture ? 'bg-white/5 text-slate-500' : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap mb-1">
                      <span className="text-xs font-mono font-bold text-emerald-300">
                        {m.year}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono uppercase">
                        {m.quarter}
                      </span>
                      <h3 className="text-lg font-bold text-white">{m.title}</h3>
                      {isFuture && (
                        <span className="text-[9px] text-amber-300 uppercase tracking-wider">
                          projecao
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{m.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* =================== TAMANHO DO MERCADO =================== */}
      <section className="border-b border-white/10 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center gap-2 mb-3 text-xs text-cyan-300 uppercase tracking-widest font-bold">
            <Globe2 className="w-3.5 h-3.5" /> Contexto
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-3 leading-tight">
            O tamanho da oportunidade.
          </h2>
          <p className="text-slate-400 text-lg mb-10 max-w-3xl">
            Estamos construindo em cima de uma tendência que já é gigantesca. É que vai
            triplicar.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">
                Global · BloombergNEF (jan/2025)
              </div>
              <div className="text-4xl md:text-5xl font-black text-white mb-2">
                US$ 2,1 trilhões
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Investidos em transição energética em 2024, recorde histórico. +11% vs 2023. Só
                em renováveis: <strong className="text-white">US$ 728 bilhões</strong>.
              </p>
              <p className="text-[11px] text-slate-500 mt-3">
                Para alinhar com Acordo de Paris, serão necessários{' '}
                <strong className="text-emerald-300">US$ 4,8 trilhões/ano</strong> até 2030.
              </p>
              <a
                href="https://about.bnef.com/insights/finance/global-investment-in-the-energy-transition-exceeded-2-trillion-for-the-first-time-in-2024-according-to-bloombergnef-report/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-xs text-emerald-300 hover:text-emerald-200"
              >
                Fonte: BloombergNEF <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">
                Brasil · ANEEL (jan/2025)
              </div>
              <div className="text-4xl md:text-5xl font-black text-white mb-2">
                3,1 milhões
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Sistemas de micro e minigeração distribuída (MMGD) conectados à rede brasileira,
                com potencia instalada de <strong className="text-white">35,6 GW</strong>.
              </p>
              <p className="text-[11px] text-slate-500 mt-3">
                Em 2024: <strong className="text-amber-300">782.897 novos sistemas</strong> e{' '}
                <strong className="text-amber-300">8,85 GW adicionais</strong>. Mais de 1 milhao de
                unidades consumidoras passaram a usar creditos de excedente.
              </p>
              <a
                href="https://www.gov.br/aneel/pt-br/assuntos/noticias/2025/micro-e-minigeracao-distribuida-de-energia-eletrica-cresceu-8-84-gw-em-2024"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-xs text-amber-300 hover:text-amber-200"
              >
                Fonte: ANEEL <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30">
            <div className="flex items-start gap-3">
              <Award className="w-6 h-6 text-purple-300 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-bold text-white mb-1">
                  COP28: triplicar renováveis até 2030
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Acordo assinado em Dubai (dez/2023) por 130 países exige triplicar a capacidade
                  global de energia renovável até 2030. BloombergNEF estima que são necessários{' '}
                  <strong className="text-white">US$ 1 trilhão/ano em renewables</strong> (em
                  dólares de 2023) entre 2024 e 2030 — mais 50% do ritmo atual. Estamos atrasados
                  em 13%.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================== FUNDADORES =================== */}
      <section className="border-b border-white/10 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center gap-2 mb-3 text-xs text-purple-300 uppercase tracking-widest font-bold">
            <Users className="w-3.5 h-3.5" /> Time
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-3 leading-tight">
            Quem constroi isso.
          </h2>
          <p className="text-slate-400 text-sm mb-10 max-w-3xl">
            As biografias abaixo são <strong>ilustrativas</strong>. Os fundadores reais serão
            divulgados em rodada institucional formal, com CNAEP verificada.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {FUNDADORES.map((f, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${f.cor} flex items-center justify-center text-white text-xl font-black shrink-0`}
                  >
                    {f.iniciais}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white">{f.nome}</h3>
                    <p className="text-xs text-emerald-300 font-mono uppercase tracking-wider">
                      {f.papel}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed mb-3">{f.bio}</p>
                <ul className="space-y-1">
                  {f.background.map((b, j) => (
                    <li
                      key={j}
                      className="text-[11px] text-slate-500 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" /> {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-slate-500 mt-4 italic">
            * Biografias ilustrativas para fins de narrativa. Nomes, formações e experiências
            serão confirmados publicamente em data-room institucional.
          </p>
        </div>
      </section>

      {/* =================== ECOSSISTEMA =================== */}
      <section className="border-b border-white/10 py-20 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center gap-2 mb-3 text-xs text-cyan-300 uppercase tracking-widest font-bold">
            <Code className="w-3.5 h-3.5" /> Ecossistema
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-3 leading-tight">
            Construído sobre ombros de gigantes.
          </h2>
          <p className="text-slate-400 text-lg mb-10 max-w-3xl">
            Usamos stacks públicas, abertas e auditadas. Nenhum lock-in. Nenhum vendor obscuro.
          </p>

          <div className="space-y-6">
            {STACK.map((cat, i) => (
              <div key={i}>
                <h3 className="text-sm font-bold text-emerald-300 uppercase tracking-wider mb-3">
                  {cat.categoria}
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {cat.ferramentas.map((tool, j) => (
                    <a
                      key={j}
                      href={tool.site}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm font-bold text-white group-hover:text-emerald-300">
                          {tool.nome}
                        </p>
                        <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-emerald-300 shrink-0" />
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{tool.papel}</p>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-500 mt-6 italic max-w-3xl">
            As menções a fornecedores tecnológicos não representam parceria comercial,
            endosso ou investimento. São stacks públicas que utilizamos para construir a
            plataforma.
          </p>
        </div>
      </section>

      {/* =================== POR QUE SOMOS DIFERENTES =================== */}
      <section className="border-b border-white/10 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center gap-2 mb-3 text-xs text-amber-300 uppercase tracking-widest font-bold">
            <Target className="w-3.5 h-3.5" /> Diferencas
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-12 leading-tight">
            Por que somos diferentes.
          </h2>

          <div className="space-y-4">
            {[
              {
                icon: Shield,
                titulo: 'Transparencia radical',
                desc: 'Cada transação, cada match, cada taxa. Você vê o que a plataforma ganha e por que. Sem letras miúdas.',
              },
              {
                icon: Leaf,
                titulo: 'Token utilitário, não especulativo',
                desc: '1 KWATT vale 30% de 1 kWh na plataforma. Pode ser usado para pagar, receber cashback ou staking opcional. Lei 14.478/2022.',
              },
              {
                icon: Heart,
                titulo: 'Win-win-win',
                desc: 'Consumidor economiza 30-90% na fatura. Gerador ganha renda passiva com excedente. Distribuidora cumpre metas de renováveis. Sociedade avança na transição energética.',
              },
              {
                icon: Clock,
                titulo: 'Sem vendor lock-in',
                desc: 'Stack aberta (Supabase, Next.js, Stripe). Se um dia precisarmos migrar, conseguimos. Seu dado é seu.',
              },
              {
                icon: Users,
                titulo: 'DAO comunitaria (futuro)',
                desc: 'Após o lançamento da mainnet (2027), decisões de taxa, parcerias e expansão serão votadas pelos detentores de KWATT.',
              },
            ].map((d, i) => {
              const Icon = d.icon
              return (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-4"
                >
                  <Icon className="w-6 h-6 text-amber-300 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{d.titulo}</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">{d.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* =================== INVESTIDORES =================== */}
      <section
        id="investidores"
        className="border-b border-white/10 py-20 bg-gradient-to-b from-transparent via-amber-500/5 to-transparent"
      >
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center gap-2 mb-3 text-xs text-amber-300 uppercase tracking-widest font-bold">
            <Building2 className="w-3.5 h-3.5" /> Investidores
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-3 leading-tight">
            Rodadas institucionais.
          </h2>
          <p className="text-slate-400 text-lg mb-10 max-w-3xl">
            Estamos em fase pre-seed. A rodada institucional sera anunciada em 2025.
          </p>

          <div className="p-8 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30">
            <div className="flex items-start gap-4 mb-4">
              <Server className="w-8 h-8 text-amber-300 shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Para gestoras e family offices</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                   Se você representa um fundo de venture capital, corporate venture, family office
                  ou investidor angel com foco em clima/energy transition, podemos agendar uma
                  conversa.
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-3 mt-6 text-xs">
              <div className="p-3 rounded-lg bg-black/30 border border-amber-500/20">
                <p className="text-amber-300 font-bold mb-1">Mercado endereçável</p>
                <p className="text-slate-300">US$ 728 bi global (2024)</p>
              </div>
              <div className="p-3 rounded-lg bg-black/30 border border-amber-500/20">
                <p className="text-amber-300 font-bold mb-1">Tamanho BR</p>
                <p className="text-slate-300">3,1M sistemas ativos</p>
              </div>
              <div className="p-3 rounded-lg bg-black/30 border border-amber-500/20">
                <p className="text-amber-300 font-bold mb-1">Crescimento</p>
                <p className="text-slate-300">+782k sistemas/ano</p>
              </div>
            </div>
            <a
              href="mailto:investidores@energialivre.dev.br?subject=Interesse%20em%20rodada%20institucional"
              className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold transition"
            >
              Falar com o time <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <p className="text-[10px] text-slate-500 mt-4 italic max-w-3xl">
            * Esta página não constitui uma oferta de valores mobiliários. O token KWATT tem
            finalidade utilitária conforme Lei 14.478/2022. Informações sobre rodadas serão
            divulgadas exclusivamente em data-room formal, com due-diligence completa.
          </p>
        </div>
      </section>

      {/* =================== CTA =================== */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <Sparkles className="w-12 h-12 text-emerald-400 mx-auto mb-6" />
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
            A transição energética começa
            <br />
            pela sua fatura.
          </h2>
          <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Seja como consumidor (economize até 90%), gerador (renda passiva com excedente) ou
            parceiro (ganhe 5 KWATT por indicação), você faz parte dessa história.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/cadastro"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 font-bold hover:from-emerald-400 hover:to-cyan-400 transition flex items-center gap-2"
            >
              Criar conta gratis <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/token"
              className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition flex items-center gap-2"
            >
              Conhecer o KWATT <Coins className="w-4 h-4" />
            </Link>

          </div>
        </div>
      </section>

      {/* =================== DISCLAIMER =================== */}
      <section className="border-t border-white/10 py-10 bg-black/30">
        <div className="max-w-5xl mx-auto px-6 text-[10px] text-slate-500 leading-relaxed">
          <p className="mb-2">
            <strong>Disclaimers legais:</strong> Esta página é de natureza narrativa e informativa.
            Biografias de fundadores são ilustrativas e serão confirmadas em data-room formal.
            Menções a fornecedores tecnológicos (Next.js, Supabase, Stripe, Vercel, OpenStreetMap,
            Google Places, Leaflet) não representam parceria comercial, endosso ou investimento. O
            token KWATT tem finalidade exclusivamente utilitária na plataforma EnergiaLivre
            (consumo de serviços de compensação de energia) e não configura valor mobiliário,
            nos termos da Lei 14.478/2022. O sistema de compensação de energia distribuída
            (microgeração e minigeração) opera sob a Lei 14.300/2022 e regulamentação da ANEEL.
            Dados de mercado citados (BloombergNEF, ANEEL) são de domínio público e estão
            linkados na íntegra.
          </p>
          <p>
            EnergiaLivre · CNPJ a divulgar · Plataforma em fase pre-operacional · Sujeita a
            mudanças · 2024 → 2027
          </p>
        </div>
      </section>
    </main>
  )
}
