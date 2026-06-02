'use client';

import { useState } from 'react';
import { 
  Zap, TrendingUp, Users, Shield, Award, 
  CheckCircle, ArrowRight, Star, MapPin,
  DollarSign, BarChart3, Heart, Globe,
  Smartphone, Headphones, FileText, Clock
} from 'lucide-react';

export default function ProgramaEmbaixadores() {
  const [selectedState, setSelectedState] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
      {/* NAV */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-[#020617]/95 backdrop-blur-xl">
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
            <a href="#cadastro" className="bg-gradient-to-r from-emerald-500 to-yellow-500 text-slate-900 px-6 py-2.5 rounded-full font-bold hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all">
              Ser Embaixador
            </a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent" />
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-yellow-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-bold mb-8">
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

          {/* NÚMEROS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
            {[
              { value: '+R$ 2M', label: 'Pagos em comissões', icon: DollarSign },
              { value: '+500', label: 'Embaixadores ativos', icon: Users },
              { value: '32%', label: 'Economia média', icon: TrendingUp },
              { value: '5', label: 'Estados atendidos', icon: MapPin },
            ].map((stat, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <stat.icon className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#cadastro" className="px-10 py-5 bg-gradient-to-r from-emerald-500 to-yellow-500 text-slate-900 rounded-full font-bold text-lg hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-2 group">
              Começar Agora <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a href="#simulador" className="px-10 py-5 bg-white/10 border border-white/20 text-white rounded-full font-bold text-lg hover:bg-white/20 transition-all">
              Simular Ganhos
            </a>
          </div>
        </div>
      </section>

      {/* ANALOGIA */}
      <section className="py-20 px-6 bg-slate-900/40 border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Energia solar por assinatura
            </h2>
            <p className="text-slate-400 text-lg">O mesmo conceito que revolucionou outros mercados</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '🚗',
                title: 'Ter carro',
                arrow: '→',
                result: 'Uber',
                desc: 'Acesso sem posse'
              },
              {
                icon: '🏠',
                title: 'Ter imóvel',
                arrow: '→',
                result: 'Airbnb',
                desc: 'Uso sob demanda'
              },
              {
                icon: '⚡',
                title: 'Placa solar',
                arrow: '→',
                result: 'EnergiaLivre',
                desc: 'Energia sem investimento',
                highlight: true
              }
            ].map((item, i) => (
              <div key={i} className={`relative p-8 rounded-3xl border ${item.highlight ? 'bg-gradient-to-br from-emerald-500/20 to-yellow-500/10 border-emerald-500/50' : 'bg-white/5 border-white/10'} text-center`}>
                <div className="text-5xl mb-4">{item.icon}</div>
                <div className="text-2xl font-bold text-white mb-2">{item.title}</div>
                <div className="text-4xl font-black text-emerald-400 mb-2">{item.arrow}</div>
                <div className={`text-2xl font-bold mb-2 ${item.highlight ? 'text-yellow-400' : 'text-white'}`}>{item.result}</div>
                <div className="text-slate-400">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Ganhe em 4 passos simples
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Indique',
                desc: 'Apresente a EnergiaLivre para amigos, familiares ou clientes',
                icon: Users
              },
              {
                step: '02',
                title: 'Cadastre',
                desc: 'Faça o cadastro gratuito da pessoa na plataforma',
                icon: CheckCircle
              },
              {
                step: '03',
                title: 'Ative',
                desc: 'Nós cuidamos de toda a parte burocrática e técnica',
                icon: Shield
              },
              {
                step: '04',
                title: 'Ganhe',
                desc: 'Receba comissão imediata + renda todo mês',
                icon: DollarSign
              }
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-emerald-500/50 transition-all group">
                  <div className="text-6xl font-black text-white/5 absolute top-4 left-6">{item.step}</div>
                  <item.icon className="w-12 h-12 text-emerald-400 mb-6 relative z-10" />
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-slate-400">{item.desc}</p>
                </div>
                {i < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-20">
                    <ArrowRight className="w-8 h-8 text-emerald-500/50" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SIMULADOR */}
      <section id="simulador" className="py-20 px-6 bg-gradient-to-br from-emerald-500/10 to-yellow-500/5 border-y border-white/10">
        <div className="max-w-4xl mx-auto">
          <SimulatorComponent />
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Por que ser um embaixador?
              </h2>
              <div className="space-y-6">
                {[
                  {
                    icon: DollarSign,
                    title: 'Alta comissão',
                    desc: 'Ganhe até 100% da primeira fatura do cliente + 5% recorrente'
                  },
                  {
                    icon: Globe,
                    title: 'Sem limites geográficos',
                    desc: 'Atue em 5 estados e expanda conforme crescemos'
                  },
                  {
                    icon: Award,
                    title: 'Suporte completo',
                    desc: 'Treinamento, materiais de venda e suporte dedicado'
                  },
                  {
                    icon: Heart,
                    title: 'Impacto positivo',
                    desc: 'Ajude o meio ambiente enquanto ganha dinheiro'
                  }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center shrink-0">
                      <item.icon className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                      <p className="text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
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

      {/* SUPORTE */}
      <section className="py-20 px-6 bg-slate-900/40 border-y border-white/5">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-12">
            Você nunca está sozinho
          </h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: FileText, title: 'Material de apoio', desc: 'Apresentações e scripts prontos' },
              { icon: Smartphone, title: 'Treinamento', desc: 'Capacitação online completa' },
              { icon: Headphones, title: 'Suporte dedicado', desc: 'WhatsApp para dúvidas' },
              { icon: BarChart3, title: 'Plataforma', desc: 'Acompanhe comissões em tempo real' }
            ].map((item, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                <item.icon className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COBERTURA */}
      <section className="py-20 px-6">
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

      {/* FAQ */}
      <section className="py-20 px-6 bg-slate-900/40 border-y border-white/5">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-white text-center mb-12">
            Perguntas frequentes
          </h2>
          
          <div className="space-y-4">
            {[
              {
                q: 'Preciso investir alguma coisa pra começar?',
                a: 'Não. Zero investimento. Você não compra estoque, não paga taxa de adesão e não tem meta obrigatória.'
              },
              {
                q: 'Quando eu recebo a primeira comissão?',
                a: 'A comissão na venda pode chegar a 100% paga já no cadastro do cliente. Depois, você recebe o bônus de recorrência todo mês.'
              },
              {
                q: 'Como funciona a comissão?',
                a: 'Você recebe comissão na venda (até 100%) + bônus de recorrência mensal enquanto o cliente mantiver a assinatura.'
              },
              {
                q: 'Preciso ser CLT ou ter CNPJ?',
                a: 'Você atua como autônomo. Não tem vínculo CLT — você é dono do seu tempo.'
              }
            ].map((faq, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-3">{faq.q}</h3>
                <p className="text-slate-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section id="cadastro" className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-emerald-500/20 to-yellow-500/10 border border-emerald-500/30 rounded-3xl p-12">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Transforme a conta de luz em fonte de renda
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
              Cadastre-se no programa. Em 5 minutos você fala com um recrutador e já sai com treinamento e material de vendas.
              <br /><strong className="text-white">Sem investimento, sem meta obrigatória.</strong>
            </p>
            <a href="/cadastro-parceiro" className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-emerald-500 to-yellow-500 text-slate-900 rounded-full font-bold text-lg hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] transition-all">
              Quero ser Embaixador <ArrowRight className="w-5 h-5" />
            </a>
            <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-slate-400">
              <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Regulado pela ANEEL</span>
              <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Dados protegidos (LGPD)</span>
              <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Comissão garantida</span>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 border-t border-white/10 text-center text-slate-500">
        <p>© 2026 EnergiaLivre. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

// Componente do Simulador
function SimulatorComponent() {
  const [clientes, setClientes] = useState(20);
  const [ticketMedio, setTicketMedio] = useState(400);
  
  const comissaoPrimeiroMes = clientes * ticketMedio;
  const rendaRecorrente = clientes * (ticketMedio * 0.05);
  const totalMensal = rendaRecorrente;

  return (
    <div>
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
              min="5