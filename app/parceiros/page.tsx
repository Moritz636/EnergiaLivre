'use client';

import { useState } from 'react';
import { 
  Zap, TrendingUp, Users, Shield, Award, 
  CheckCircle, ArrowRight, Star, MapPin,
  DollarSign, BarChart3, Heart, Globe
} from 'lucide-react';

export default function ProgramaParceiros() {
  const [clientes, setClientes] = useState(20);
  const [ticketMedio, setTicketMedio] = useState(400);

  const comissaoPrimeiroMes = clientes * ticketMedio;
  const rendaRecorrente = clientes * (ticketMedio * 0.05);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* NAV */}
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
            <a href="/cadastro-parceiro" className="bg-gradient-to-r from-emerald-500 to-yellow-500 text-slate-900 px-6 py-2.5 rounded-full font-bold hover:shadow-lg transition-all">
              Ser Parceiro
            </a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent" />
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-bold mb-8">
            <Star className="w-4 h-4 fill-current" />
            Programa de Embaixadores
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
            Ganhe ate <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-yellow-400">R$ 5.000/mes</span>
            <br />indicando energia solar
          </h1>
          
          <p className="text-xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            Sem investimento, sem estoque, sem complicacao. 
            Voce indica, nos cuidamos de tudo. 
            <span className="text-emerald-400 font-semibold"> Comissao de ate 100% no primeiro mes</span> + renda recorrente.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <DollarSign className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
              <div className="text-3xl font-black text-white mb-1">+R$ 2M</div>
              <div className="text-sm text-slate-400">Pagos em comissoes</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <Users className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
              <div className="text-3xl font-black text-white mb-1">+500</div>
              <div className="text-sm text-slate-400">Embaixadores ativos</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <TrendingUp className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
              <div className="text-3xl font-black text-white mb-1">32%</div>
              <div className="text-sm text-slate-400">Economia media</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <MapPin className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
              <div className="text-3xl font-black text-white mb-1">5</div>
              <div className="text-sm text-slate-400">Estados atendidos</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/cadastro-parceiro" className="px-10 py-5 bg-gradient-to-r from-emerald-500 to-yellow-500 text-slate-900 rounded-full font-bold text-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group">
              Comecar Agora <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
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
            <div className="p-8 rounded-3xl border bg-white/5 border-white/10 text-center">
              <div className="text-5xl mb-4">🚗</div>
              <div className="text-2xl font-bold text-white mb-2">Ter carro</div>
              <div className="text-4xl font-black text-emerald-400 mb-2">→</div>
              <div className="text-2xl font-bold text-white mb-2">Uber</div>
              <div className="text-slate-400">Acesso sem posse</div>
            </div>
            <div className="p-8 rounded-3xl border bg-white/5 border-white/10 text-center">
              <div className="text-5xl mb-4"></div>
              <div className="text-2xl font-bold text-white mb-2">Ter imovel</div>
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

      {/* COMO FUNCIONA */}
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
              <p className="text-slate-400">Faca o cadastro gratuito da pessoa na plataforma</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-emerald-500/50 transition-all">
              <Shield className="w-12 h-12 text-emerald-400 mb-6" />
              <h3 className="text-xl font-bold text-white mb-3">Ative</h3>
              <p className="text-slate-400">Nos cuidamos de toda a parte burocratica e tecnica</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-emerald-500/50 transition-all">
              <DollarSign className="w-12 h-12 text-emerald-400 mb-6" />
              <h3 className="text-xl font-bold text-white mb-3">Ganhe</h3>
              <p className="text-slate-400">Receba comissao imediata + renda todo mes</p>
            </div>
          </div>
        </div>
      </section>

      {/* SIMULADOR */}
      <section id="simulador" className="py-20 px-6 bg-gradient-to-br from-emerald-500/10 to-yellow-500/5 border-y border-white/10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Simule seus ganhos
            </h2>
            <p className="text-slate-400 text-lg">Veja quanto voce pode ganhar por mes</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <label className="block text-slate-400 mb-2">Clientes por mes: {clientes}</label>
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
                <label className="block text-slate-400 mb-2">Ticket medio: R$ {ticketMedio}</label>
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
                <div className="text-slate-400 mb-2">1º Mes</div>
                <div className="text-3xl font-black text-emerald-400">R$ {comissaoPrimeiroMes.toLocaleString()}</div>
                <div className="text-sm text-slate-500 mt-1">Comissao inicial</div>
              </div>
              <div className="bg-white/5 rounded-2xl p-6 text-center">
                <div className="text-slate-400 mb-2">Recorrente/mes</div>
                <div className="text-3xl font-black text-yellow-400">R$ {rendaRecorrente.toLocaleString()}</div>
                <div className="text-sm text-slate-500 mt-1">Renda passiva</div>
              </div>
              <div className="bg-gradient-to-br from-emerald-500/20 to-yellow-500/20 border border-emerald-500/30 rounded-2xl p-6 text-center">
                <div className="text-slate-300 mb-2">Total 12 meses</div>
                <div className="text-3xl font-black text-white">R$ {(comissaoPrimeiroMes + (rendaRecorrente * 12)).toLocaleString()}</div>
                <div className="text-sm text-emerald-400 mt-1">Projecao anual</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Por que ser um parceiro?
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <DollarSign className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">Alta comissao</h3>
                    <p className="text-slate-400">Ganhe ate 100% da primeira fatura + 5% recorrente</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <Globe className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">Sem limites geograficos</h3>
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
                <p className="text-slate-400">Ganhe todo mes enquanto o cliente estiver ativo</p>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                  <span className="text-slate-300">10 clientes</span>
                  <span className="text-emerald-400 font-bold">R$ 500/mes</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                  <span className="text-slate-300">50 clientes</span>
                  <span className="text-emerald-400 font-bold">R$ 2.500/mes</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-emerald-500/20 to-yellow-500/20 rounded-xl border border-emerald-500/30">
                  <span className="text-white font-semibold">100 clientes</span>
                  <span className="text-yellow-400 font-bold">R$ 5.000/mes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COBERTURA */}
      <section className="py-20 px-6 bg-slate-900/40 border-y border-white/5">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Onde voce pode atuar
          </h2>
          <p className="text-slate-400 text-lg mb-12">Presentes nas principais regioes do Brasil</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {['Rio Grande do Sul', 'Santa Catarina', 'Parana', 'Sao Paulo', 'Mato Grosso'].map((state) => (
              <div key={state} className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 font-semibold">
                {state}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-white text-center mb-12">
            Perguntas frequentes
          </h2>
          
          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-3">Preciso investir alguma coisa pra comecar?</h3>
              <p className="text-slate-400">Nao. Zero investimento. Voce nao compra estoque, nao paga taxa de adesao e nao tem meta obrigatoria.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-3">Quando eu recebo a primeira comissao?</h3>
              <p className="text-slate-400">A comissao na venda pode chegar a 100% paga ja no cadastro do cliente. Depois, voce recebe o bonus de recorrencia todo mes.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-3">Preciso ser CLT ou ter CNPJ?</h3>
              <p className="text-slate-400">Voce atua como autonomo. Nao tem vinculo CLT - voce e dono do seu tempo.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-emerald-500/20 to-yellow-500/10 border border-emerald-500/30 rounded-3xl p-12">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Comece a ganhar hoje mesmo
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
              Cadastro gratuito, sem compromisso. Em 5 minutos voce ja pode comecar a indicar.
            </p>
            <a href="/cadastro-parceiro" className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-emerald-500 to-yellow-500 text-slate-900 rounded-full font-bold text-lg hover:shadow-xl transition-all">
              Quero Ser Parceiro <ArrowRight className="w-5 h-5" />
            </a>
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