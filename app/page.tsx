'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight, Zap, ShieldCheck, Crown, ChevronDown, Mail, Wallet, Award,
  Sun, CheckCircle2, Building2, Leaf, Calculator, Clock, Sparkles, MapPin,
  TrendingUp, Lock, Phone, Target, Flame, Users, BadgeCheck, Share2, Send,
  Handshake,
} from 'lucide-react';
import { WHATSAPP_BASE } from '@/lib/leads';

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [calcBill, setCalcBill] = useState('')
  const [calcResult, setCalcResult] = useState<number | null>(null)

  const faqs = [
    {
      q: 'O que é a EnergiaLivre?',
      a: 'Somos um marketplace de energia solar que conecta geradores com excedente a consumidores que querem economizar na fatura. Você não precisa instalar painéis solares: a plataforma faz o match entre quem produz e quem consome, dentro das regras da Lei 14.300/2022 e da REN 687/2015 da ANEEL.',
    },
    {
      q: 'Como funciona o marketplace na prática?',
      a: 'Três passos: (1) você se cadastra como consumidor ou gerador, (2) nossa plataforma cruza oferta e demanda da sua região, (3) o match é ativado. Para geradores, cada kWh excedente vira receita recorrente. Para consumidores, a fatura começa a cair sem obras em casa.',
    },
    {
      q: 'Preciso instalar painéis solares para economizar?',
      a: 'Não. O consumidor se beneficia da rede de geradores da plataforma sem instalar nada. Você continua conectado à sua distribuidora normalmente; o que muda é de onde vem o crédito de energia que abate a sua fatura. Para geradores, sim, é preciso ter a usina instalada e homologada.',
    },
    {
      q: 'Quanto posso economizar ou ganhar?',
      a: 'Consumidores podem reduzir a fatura em até 32% dependendo do perfil de consumo e da região. Geradores recebem por kWp instalado conforme a tarifa de compensação regional. Use o simulador gratuito para ver um número específico para o seu caso.',
    },
    {
      q: 'É seguro e está em conformidade com a ANEEL?',
      a: 'Sim. Operamos dentro do Sistema de Compensação de Energia Elétrica (SCEEE) regulado pela ANEEL. Todos os dados pessoais são tratados conforme a LGPD, com criptografia em trânsito e em repouso. Você pode revogar consentimento a qualquer momento.',
    },
    {
      q: 'O que é a Lei 14.300/2022?',
      a: 'É o marco legal da microgeração e minigeração distribuída no Brasil. Estabeleceu as regras de transição para a cobrança de componentes tarifários (os "fios" e encargos) sobre a energia compensada. A EnergiaLivre trabalha 100% dentro dessas regras, então o que você vê na plataforma é o que vai valer na sua fatura.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans overflow-x-hidden">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent -z-20" />
      <div className="fixed bottom-0 left-0 w-[28rem] h-[28rem] bg-emerald-500/5 rounded-full blur-[120px] -z-10" />
      <div className="fixed top-40 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px] -z-10" />

      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-[#020617]/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-400 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
              <Zap className="text-slate-900 w-5 h-5 fill-current" />
            </div>
            <span className="text-2xl font-black text-white tracking-tight">ENERGIA<span className="text-emerald-500">LIVRE</span></span>
          </Link>
          <div className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-300">
            <a href="#como-funciona" className="hover:text-white transition">Como Funciona</a>
            <a href="#para-voce" className="hover:text-white transition">Para Você</a>
            <Link href="/embaixador" className="hover:text-emerald-400 transition">Embaixador</Link>
            <a href="#planos" className="hover:text-white transition">Planos</a>
            <Link href="/simulador" className="hover:text-white transition">Simulador</Link>
            <Link href="/regulamentacao" className="hover:text-white transition">Regulamentação</Link>
            <a href="#faq" className="hover:text-white transition">FAQ</a>
            <a href="#contato" className="hover:text-white transition">Contato</a>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { if (typeof navigator !== 'undefined' && navigator.share) { navigator.share({ title: 'EnergiaLivre', text: 'Economize na conta de luz com energia solar. Sem instalação, sem fidelidade.', url: 'https://energialivre.dev.br' }); } else { navigator.clipboard?.writeText('https://energialivre.dev.br'); alert('⚡ Link copiado! Compartilhe com seus amigos e ajude mais pessoas a economizar na conta de luz.'); } }}
              className="hidden md:inline-flex text-sm font-bold text-emerald-400 hover:text-emerald-300 transition px-3 py-2 items-center gap-1.5"
              title="Compartilhar"
            >
              <Share2 className="w-4 h-4" /> Compartilhar
            </button>
            <Link href="/login" className="hidden md:inline-flex text-sm font-bold text-slate-300 hover:text-white transition px-4 py-2">
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="bg-emerald-500 text-slate-900 px-5 py-2.5 rounded-full font-bold text-sm hover:bg-emerald-400 transition shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center gap-1.5"
            >
              Cadastrar <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative pt-40 pb-24 px-6 text-center">
        <div className="absolute inset-0 -z-20" aria-hidden>
          <Image
            src="/images/hero-home.webp"
            alt=""
            fill
            className="object-cover opacity-40"
            priority
          />
        </div>
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-black mb-8 uppercase tracking-wider animate-fade-up">
            <Crown className="w-3.5 h-3.5" /> Marketplace de Energia Solar · Lei 14.300/2022
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-7 leading-[1.05] tracking-tight animate-fade-up" style={{ animationDelay: '100ms' }}>
            A energia que você produz<br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-yellow-400"> (ou consome) </span>
            finalmente trabalhando a seu favor.
          </h1>
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-up" style={{ animationDelay: '150ms' }}>
            Conectamos <strong className="text-slate-200">geradores com excedente</strong> a consumidores que querem pagar menos na fatura.
            Sem obras em casa, sem fidelidade, sem intermediários. A plataforma faz o match e a energia flui.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10 animate-fade-up" style={{ animationDelay: '200ms' }}>
            <Link
              href="/economizar"
              className="group px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-900 rounded-full font-black text-base hover:from-emerald-400 hover:to-emerald-300 transition flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(16,185,129,0.35)]"
            >
              <Wallet className="w-5 h-5" /> Quero economizar
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/vender"
              className="group px-8 py-4 bg-white/5 border border-white/15 text-white rounded-full font-bold text-base hover:bg-white/10 hover:border-white/30 transition flex items-center justify-center gap-2"
            >
              <Sun className="w-5 h-5 text-yellow-400" /> Tenho uma usina
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] text-slate-500 uppercase tracking-wider font-bold animate-fade-up" style={{ animationDelay: '250ms' }}>
            <div className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-emerald-500" /> LGPD</div>
            <div className="flex items-center gap-1.5"><BadgeCheck className="w-3.5 h-3.5 text-emerald-500" /> ANEEL · REN 687/2015</div>
            <div className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Pagamento criptografado</div>
            <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-emerald-500" /> Análise em 24h</div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 px-6">
          {[
            { icon: <Users className="w-5 h-5" />, label: 'Match regional', desc: 'Oferta × demanda na sua UF' },
            { icon: <TrendingUp className="w-5 h-5" />, label: 'Até 32%', desc: 'de economia na fatura' },
            { icon: <Zap className="w-5 h-5" />, label: 'Sem instalação', desc: 'Você não precisa de painéis' },
            { icon: <Leaf className="w-5 h-5" />, label: '100% digital', desc: 'Onboarding em 2 minutos' },
          ].map((it, i) => (
            <div key={i} className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-sm text-left hover:border-emerald-500/40 transition animate-fade-up" style={{ animationDelay: `${300 + i * 80}ms` }}>
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">{it.icon}</div>
              <p className="text-sm font-black text-white">{it.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{it.desc}</p>
            </div>
          ))}
        </div>

        {/* Role login — integrado, dinâmico e moderno */}
        <div className="mt-20 max-w-6xl mx-auto px-6">
          <div className="text-center mb-8 animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black mb-3 uppercase tracking-wider">
              <Users className="w-3.5 h-3.5" /> Acessar plataforma
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white">Qual é o seu perfil?</h2>
            <p className="text-sm text-slate-400 mt-1">Escolha seu caminho e comece agora</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/login?from=consumidor"
              className="group relative p-6 rounded-2xl bg-gradient-to-br from-emerald-500/[0.08] to-emerald-500/[0.01] border border-emerald-500/20 hover:border-emerald-500/50 transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] animate-fade-up text-left"
              style={{ animationDelay: '300ms' }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-3xl -z-10" />
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.25)] transition-all duration-300">
                <Wallet className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-base font-black text-white group-hover:text-emerald-300 transition-colors">Consumidor</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">Reduza sua fatura de luz sem instalar painéis. Economia real todo mês.</p>
              <div className="mt-4 flex items-center gap-1.5 text-[11px] font-bold text-emerald-400/70 group-hover:text-emerald-300 transition-colors">
                Quero economizar <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/login?from=gerador"
              className="group relative p-6 rounded-2xl bg-gradient-to-br from-blue-500/[0.08] to-blue-500/[0.01] border border-blue-500/20 hover:border-blue-500/50 transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] animate-fade-up text-left"
              style={{ animationDelay: '350ms' }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-3xl -z-10" />
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/30 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.25)] transition-all duration-300">
                <Sun className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-base font-black text-white group-hover:text-blue-300 transition-colors">Gerador</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">Monetize o excedente da sua usina solar. Renda passiva todo mês.</p>
              <div className="mt-4 flex items-center gap-1.5 text-[11px] font-bold text-blue-400/70 group-hover:text-blue-300 transition-colors">
                Quero gerar receita <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/login?from=embaixador"
              className="group relative p-6 rounded-2xl bg-gradient-to-br from-purple-500/[0.08] to-purple-500/[0.01] border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] animate-fade-up text-left"
              style={{ animationDelay: '400ms' }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-3xl -z-10" />
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/30 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.25)] transition-all duration-300">
                <Handshake className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-base font-black text-white group-hover:text-purple-300 transition-colors">Embaixador</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">Indique a plataforma e ganhe comissão recorrente por cada conexão.</p>
              <div className="mt-4 flex items-center gap-1.5 text-[11px] font-bold text-purple-400/70 group-hover:text-purple-300 transition-colors">
                Quero ser embaixador <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/login?from=parceiro"
              className="group relative p-6 rounded-2xl bg-gradient-to-br from-yellow-500/[0.08] to-yellow-500/[0.01] border border-yellow-500/20 hover:border-yellow-500/50 transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(234,179,8,0.15)] animate-fade-up text-left"
              style={{ animationDelay: '450ms' }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-full blur-3xl -z-10" />
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border border-yellow-500/30 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(234,179,8,0.25)] transition-all duration-300">
                <Award className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-base font-black text-white group-hover:text-yellow-300 transition-colors">Parceiro</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">Empresas e profissionais: ofereça energia solar aos seus clientes.</p>
              <div className="mt-4 flex items-center gap-1.5 text-[11px] font-bold text-yellow-400/70 group-hover:text-yellow-300 transition-colors">
                Quero ser parceiro <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CALCULADORA INSTANTÂNEA */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black mb-4 uppercase tracking-wider">
            <Calculator className="w-3 h-3" /> Simulador Instantâneo
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">
            Quanto você pode economizar?
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto mb-8">
            Digite o valor da sua conta de luz e veja na hora sua economia potencial com créditos de energia solar.
          </p>
          <div className="max-w-sm mx-auto space-y-4">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
              <input
                type="number"
                value={calcBill}
                onChange={(e) => { setCalcBill(e.target.value); setCalcResult(null) }}
                placeholder="Valor da sua conta mensal"
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-emerald-500 outline-none transition"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const v = parseFloat(calcBill.replace(',', '.'))
                    if (v >= 50) setCalcResult(v * 0.32)
                  }
                }}
              />
            </div>
            <button
              onClick={() => {
                const v = parseFloat(calcBill.replace(',', '.'))
                if (v >= 50) setCalcResult(v * 0.32)
              }}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-900 rounded-xl font-black text-sm hover:from-emerald-400 hover:to-emerald-300 transition shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              Calcular economia
            </button>
            {calcResult !== null && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 animate-fade-in">
                <p className="text-3xl font-black text-emerald-400">R$ {calcResult.toFixed(2)}</p>
                <p className="text-xs text-slate-400">de economia por mês*</p>
                <p className="text-[10px] text-slate-500 mt-2">*Estimativa baseada em até 32% de economia com cessão de créditos. Consulte os termos.</p>
                <Link
                  href="/economizar"
                  className="mt-3 inline-flex items-center gap-1 px-4 py-2 bg-emerald-500 text-slate-900 rounded-lg text-xs font-bold hover:bg-emerald-400 transition"
                >
                  Quero essa economia <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}
            {calcBill && parseFloat(calcBill.replace(',', '.')) < 50 && calcResult === null && (
              <p className="text-[10px] text-slate-500">Mínimo de R$ 50,00 para simulação.</p>
            )}
          </div>
        </div>
      </section>

      <section id="como-funciona" className="relative py-24 px-6 border-t border-white/5">
        <div className="absolute inset-0 -z-20" aria-hidden>
          <Image
            src="/images/escritorio-equipe.webp"
            alt=""
            fill
            className="object-cover opacity-35"
          />
        </div>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black mb-4 uppercase tracking-wider">
              <Target className="w-3 h-3" /> Como funciona
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">
              Três passos. Sem complicação.
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              A plataforma cruza oferta e demanda da sua região automaticamente. Você só precisa se cadastrar e escolher seu papel.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 relative">
            {[
              {
                n: '01', icon: <Sparkles className="w-6 h-6" />,
                title: 'Você se cadastra',
                desc: 'Em 2 minutos você informa: se quer economizar (consumidor) ou se quer monetizar excedente (gerador). Conta de luz ou dados da usina.',
                color: 'emerald',
              },
              {
                n: '02', icon: <Calculator className="w-6 h-6" />,
                title: 'A plataforma faz o match',
                desc: 'Cruzamos automaticamente a demanda da sua região com a oferta disponível. Você recebe uma análise personalizada em até 24h.',
                color: 'blue',
              },
              {
                n: '03', icon: <Zap className="w-6 h-6" />,
                title: 'A energia flui',
                desc: 'Consumidor: a fatura começa a cair. Gerador: cada kWh excedente vira receita recorrente. Tudo com compliance ANEEL automático.',
                color: 'yellow',
              },
            ].map((s, i) => (
              <div key={i} className="relative p-8 rounded-3xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/10 backdrop-blur-sm group hover:border-emerald-500/40 transition">
                <div className="absolute -top-4 -left-2 text-7xl font-black text-white/[0.04] leading-none select-none">{s.n}</div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition ${
                  s.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400' :
                  s.color === 'blue' ? 'bg-blue-500/10 text-blue-400' :
                  'bg-yellow-500/10 text-yellow-400'
                }`}>
                  {s.icon}
                </div>
                <h3 className="text-xl font-black text-white mb-2">{s.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="para-voce" className="relative py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black mb-4 uppercase tracking-wider">
              <Users className="w-3 h-3" /> Para você
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">
              Dois caminhos. Uma plataforma.
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Você escolhe de que lado da energia solar está — e a EnergiaLivre faz o resto.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-10 rounded-3xl bg-gradient-to-br from-emerald-500/[0.08] to-emerald-500/[0.01] border border-emerald-500/20 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -z-10" />
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black mb-6 uppercase tracking-wider">
                <Wallet className="w-3 h-3" /> Consumidor
              </div>
              <h3 className="text-3xl font-black text-white mb-3 leading-tight">Quero pagar menos na fatura.</h3>
              <p className="text-slate-400 mb-8">
                Você continua com sua distribuidora normal. O que muda é de onde vem o crédito que abate sua conta: uma usina solar da rede EnergiaLivre.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Reduza a fatura em até 32% (depende do seu perfil e região)',
                  'Sem instalação de painéis, sem obras em casa',
                  'Sem fidelidade — você pode sair quando quiser',
                  'Onboarding 100% digital, leva 2 minutos',
                  'Acesso ao dashboard para acompanhar a economia mês a mês',
                ].map((b, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> {b}
                  </li>
                ))}
              </ul>
              <Link
                href="/economizar"
                className="group inline-flex items-center gap-2 px-7 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-900 rounded-full font-black transition shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                Quero economizar <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="p-10 rounded-3xl bg-gradient-to-br from-blue-500/[0.08] to-blue-500/[0.01] border border-blue-500/20 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10" />
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-black mb-6 uppercase tracking-wider">
                <Sun className="w-3 h-3" /> Gerador
              </div>
              <h3 className="text-3xl font-black text-white mb-3 leading-tight">Quero monetizar minha usina.</h3>
              <p className="text-slate-400 mb-8">
                Você tem uma usina instalada (ou está instalando). Cada kWh que sobra pode virar receita recorrente — sem precisar prospectar clientes.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Receita recorrente por kWh excedente',
                  'Demanda ativa: a plataforma traz os consumidores pra você',
                  'Compliance ANEEL automático (SCEEE, Lei 14.300)',
                  'Sem custo de aquisição por cliente',
                  'Dashboard de produção, créditos e repasse',
                ].map((b, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" /> {b}
                  </li>
                ))}
              </ul>
              <Link
                href="/vender"
                className="group inline-flex items-center gap-2 px-7 py-3.5 bg-blue-500 hover:bg-blue-400 text-white rounded-full font-black transition shadow-[0_0_20px_rgba(59,130,246,0.3)]"
              >
                Tenho uma usina <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="diferenciais" className="relative py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black mb-4 uppercase tracking-wider">
              <Award className="w-3 h-3" /> Por que EnergiaLivre
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">
              Construído sobre a regra, não ao redor dela.
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Não inventamos a energia solar. Construímos a infraestrutura para ela circular de verdade — com a segurança jurídica que o mercado exige.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: <Target className="w-5 h-5" />, title: 'Matching regional',
                desc: 'Algoritmo cruza oferta e demanda por UF em tempo real, com prioridade para a mesma concessionária.',
              },
              {
                icon: <ShieldCheck className="w-5 h-5" />, title: 'Compliance ANEEL',
                desc: '100% alinhado com REN 687/2015 e Lei 14.300/2022. Você opera dentro do SCEEE, com rastreabilidade.',
              },
              {
                icon: <Lock className="w-5 h-5" />, title: 'LGPD de ponta a ponta',
                desc: 'Dados criptografados, consentimento explícito, revogação a qualquer momento. Sua informação é sua.',
              },
              {
                icon: <Zap className="w-5 h-5" />, title: 'Sem intermediários',
                desc: 'Você fala direto com a plataforma. Sem atravessador inflando tarifa ou empurrando plano que você não precisa.',
              },
            ].map((d, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-emerald-500/30 transition">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">{d.icon}</div>
                <h3 className="text-base font-black text-white mb-1.5">{d.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="planos" className="relative py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black mb-4 uppercase tracking-wider">
              <Crown className="w-3 h-3" /> Planos
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">
              Você só paga se quiser acelerar.
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              O cadastro e a análise são gratuitos. Os planos abaixo são para quem quer prioridade, visibilidade e recursos extras.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="p-8 rounded-3xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/10 relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-[10px] font-black mb-5 uppercase tracking-wider">
                <Wallet className="w-3 h-3" /> Para consumidores
              </div>
              <h3 className="text-2xl font-black text-white mb-2">Member Plus</h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                Assinatura mensal que coloca seu perfil na frente da fila: match prioritário, dashboard de economia, suporte direto via WhatsApp.
              </p>
              <ul className="space-y-2.5 mb-8">
                {[
                  'Match prioritário na sua região',
                  'Dashboard de economia com projeção 12 meses',
                  'Suporte humano via WhatsApp',
                  'Alertas de variação de tarifa',
                  'Cancela quando quiser, sem multa',
                ].map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> {b}
                  </li>
                ))}
              </ul>
              <Link
                href="/checkout-member-plus"
                className="group inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-900 rounded-full font-black text-sm transition shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                Quero ser Membro <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-500/[0.08] to-blue-500/[0.01] border border-blue-500/30 relative">
              <div className="absolute top-5 right-5">
                <div className="px-2.5 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                  <Flame className="w-3 h-3" /> Destaque
                </div>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-black mb-5 uppercase tracking-wider">
                <Sun className="w-3 h-3" /> Para geradores
              </div>
              <h3 className="text-2xl font-black text-white mb-2">Moeda Energia</h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                Compre moedas para impulsionar sua usina: posições de topo no feed, destaque regional, priorização em campanhas.
              </p>
              <ul className="space-y-2.5 mb-8">
                {[
                  '1 moeda = R$ 0,70 (10% abaixo da tarifa ANEEL)',
                  'Pacotes a partir de R$ 35',
                  'Posição de topo no feed regional',
                  'Destaque em campanhas de aquisição',
                  'Crédito nunca expira',
                ].map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" /> {b}
                  </li>
                ))}
              </ul>
              <div className="flex flex-col sm:flex-row gap-2">
                <Link
                  href="/dashboard-gerador/moedas"
                  className="group inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-400 text-white rounded-full font-black text-sm transition shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                >
                  Comprar moedas <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/cadastro-gerador"
                  className="inline-flex items-center justify-center px-6 py-3 bg-white/5 border border-white/10 hover:border-white/30 text-white rounded-full font-bold text-sm transition"
                >
                  Criar conta grátis
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="simulador" className="relative py-20 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="relative p-10 md:p-14 rounded-[40px] bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-blue-500/5 border border-emerald-500/20 overflow-hidden text-center">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -z-10" />
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black mb-5 uppercase tracking-wider">
              <Calculator className="w-3 h-3" /> Simulador gratuito
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">
              Não sabe por onde começar?
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
              O simulador mostra, em menos de 1 minuto, quanto você pode economizar (se for consumidor) ou quanto sua usina pode gerar de receita (se for gerador) na sua região.
            </p>
            <Link
              href="/simulador"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-full font-black transition hover:bg-slate-100 shadow-xl"
            >
              <Calculator className="w-5 h-5" /> Simular agora
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="text-[11px] text-slate-500 mt-5 uppercase tracking-wider font-bold">
              Sem cadastro · Sem compromisso · Resultado na hora
            </p>
          </div>
        </div>
      </section>

      <section id="faq" className="relative py-24 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black mb-4 uppercase tracking-wider">
              <BadgeCheck className="w-3 h-3" /> Perguntas frequentes
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">
              Dúvidas comuns.
            </h2>
            <p className="text-slate-400">
              Se a sua pergunta não estiver aqui, fale com a gente no <a href="#contato" className="text-emerald-400 hover:underline">contato</a>.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((f, i) => {
              const open = openFaq === i;
              return (
                <div
                  key={i}
                  className={`rounded-2xl border transition-all ${open ? 'bg-white/[0.04] border-emerald-500/30' : 'bg-white/[0.02] border-white/10 hover:border-white/20'}`}
                >
                  <button
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="text-sm md:text-base font-bold text-white">{f.q}</span>
                    <ChevronDown className={`w-5 h-5 text-emerald-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
                  </button>
                  {open && (
                    <div className="px-6 pb-5 -mt-1 text-sm text-slate-400 leading-relaxed animate-in fade-in slide-in-from-top-1 duration-300">
                      {f.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* LEAD CAPTURE */}
      <section className="relative py-24 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black mb-4 uppercase tracking-wider">
            <Mail className="w-3 h-3" /> Lead Capture
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">
            Quer economizar na conta de luz?
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto mb-8">
            Deixe seu contato. Nossa equipe analisa sua região e te mostra quanto você pode economizar.
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              const form = e.currentTarget
              const data = new FormData(form)
              try {
                const res = await fetch('/api/leads/quick-capture', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    nome: data.get('nome'),
                    email: data.get('email'),
                    whatsapp: data.get('whatsapp'),
                    cidade: data.get('cidade'),
                  }),
                })
                if (res.ok) {
                  form.innerHTML = '<div class="py-8"><div class="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-8 h-8 text-emerald-400" /></div><p class="text-xl font-bold text-white mb-2">Recebemos seu contato!</p><p class="text-slate-400">Nossa equipe vai analisar sua região e te retornar em até 24h.</p></div>'
                }
              } catch { /* ignore */ }
            }}
            className="max-w-md mx-auto space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <input name="nome" placeholder="Seu nome" required className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:border-emerald-500 outline-none transition" />
              <input name="cidade" placeholder="Cidade - UF" required className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:border-emerald-500 outline-none transition" />
            </div>
            <input type="email" name="email" placeholder="Seu melhor e-mail" required className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:border-emerald-500 outline-none transition" />
            <input type="tel" name="whatsapp" placeholder="WhatsApp com DDD" required className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:border-emerald-500 outline-none transition" />
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-900 rounded-xl font-black text-base hover:from-emerald-400 hover:to-emerald-300 transition shadow-[0_0_25px_rgba(16,185,129,0.3)]"
            >
              Quero economizar agora
            </button>
            <p className="text-[10px] text-slate-500">Seus dados estão protegidos pela LGPD. Sem spam.</p>
          </form>
        </div>
      </section>

      <section id="contato" className="relative py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black mb-4 uppercase tracking-wider">
              <Mail className="w-3 h-3" /> Contato
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">
              Vamos conversar.
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Dúvidas, parceria comercial, imprensa ou suporte: escolha o canal abaixo.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <a
              href="mailto:contato@energialivre.dev.br"
              className="group p-7 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-emerald-500/40 transition flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-black mb-1">E-mail</p>
                <p className="text-lg font-black text-white">contato@energialivre.dev.br</p>
                <p className="text-xs text-slate-500 mt-1">Resposta em até 1 dia útil</p>
              </div>
            </a>

            <a
              href={WHATSAPP_BASE}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-7 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-emerald-500/40 transition flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-black mb-1">WhatsApp</p>
                <p className="text-lg font-black text-white">+55 84 98758-8668</p>
                <p className="text-xs text-slate-500 mt-1">Seg–Sex · 9h às 18h</p>
              </div>
            </a>
          </div>

          <div className="mt-8 p-6 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center gap-4">
            <Building2 className="w-6 h-6 text-slate-500 shrink-0" />
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong className="text-slate-200">EnergiaLivre</strong> é um marketplace de energia solar operado em conformidade com a Lei 14.300/2022, REN 687/2015 e LGPD.
              Operações intermediadas por <strong className="text-slate-200">Stripe Payments Brasil</strong>.
            </p>
          </div>
        </div>
      </section>

      <footer className="relative border-t border-white/10 bg-[#020617]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-14">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-400 rounded-xl flex items-center justify-center">
                  <Zap className="text-slate-900 w-5 h-5 fill-current" />
                </div>
                <span className="text-2xl font-black text-white tracking-tight">ENERGIA<span className="text-emerald-500">LIVRE</span></span>
              </Link>
              <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
                O marketplace onde a energia solar excedente encontra quem quer economizar — dentro da lei, sem intermediários.
              </p>
            </div>

            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-black mb-4">Plataforma</p>
              <ul className="space-y-2.5 text-sm text-slate-300">
                <li><a href="#como-funciona" className="hover:text-emerald-400 transition">Como Funciona</a></li>
                <li><a href="#para-voce" className="hover:text-emerald-400 transition">Para Você</a></li>
                <li><a href="#planos" className="hover:text-emerald-400 transition">Planos</a></li>
                <li><Link href="/simulador" className="hover:text-emerald-400 transition">Simulador</Link></li>
                <li><Link href="/regulamentacao" className="hover:text-emerald-400 transition">Regulamentação</Link></li>
                <li><a href="#faq" className="hover:text-emerald-400 transition">FAQ</a></li>
              </ul>
            </div>

            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-black mb-4">Acesso</p>
              <ul className="space-y-2.5 text-sm text-slate-300">
                <li><Link href="/login" className="hover:text-emerald-400 transition">Entrar</Link></li>
                <li><Link href="/cadastro" className="hover:text-emerald-400 transition">Cadastrar</Link></li>
                <li><Link href="/cadastro-gerador" className="hover:text-emerald-400 transition">Sou Gerador</Link></li>
                <li><Link href="/cadastro-embaixador" className="hover:text-emerald-400 transition">Sou Embaixador</Link></li>
                <li><Link href="/cadastro-embaixador" className="hover:text-emerald-400 transition">Sou Parceiro</Link></li>
                <li><a href="#contato" className="hover:text-emerald-400 transition">Contato</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} EnergiaLivre. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-5 text-[11px] text-slate-500 uppercase tracking-wider font-bold">
              <span className="flex items-center gap-1.5"><Lock className="w-3 h-3" /> LGPD</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3" /> ANEEL</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Brasil</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
