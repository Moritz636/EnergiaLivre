import React from 'react';
import Link from 'next/link'; 
import { 
  ArrowRight, 
  Leaf, 
  Zap, 
  TrendingUp, 
  Users, 
  Globe, 
  CheckCircle2, 
  ShieldCheck, 
  MessageSquare, 
  Award,
  Crown,
  Flame,
  Sparkles,
  BadgeCheck,
  TrendingDown
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-emerald-500/30 font-sans overflow-x-hidden">
      
      {/* Efeitos de fundo */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent -z-20" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -z-10" />
      <div className="fixed top-40 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px] -z-10" />

      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-[#020617]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-400 rounded-xl flex items-center justify-center transition-all group-hover:rotate-12 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]">
              <Zap className="text-slate-900 w-5 h-5 fill-current" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-white">ENERGIA<span className="text-emerald-500">LIVRE</span></span>
            <div className="hidden lg:flex ml-3 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[9px] font-black text-emerald-400 uppercase tracking-wider">
              Marketplace
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#como-funciona" className="hover:text-emerald-400 transition-all hover:scale-105">Como funciona</a>
            <a href="#sustentabilidade" className="hover:text-emerald-400 transition-all hover:scale-105">Sustentabilidade</a>
            <a href="#vantagens" className="hover:text-emerald-400 transition-all hover:scale-105">Vantagens</a>
            <a href="#depoimentos" className="hover:text-emerald-400 transition-all hover:scale-105">Resultados</a>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/economizar" className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-900 px-6 py-2.5 rounded-full text-sm font-bold transition-all transform hover:scale-105 shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:shadow-[0_0_35px_rgba(16,185,129,0.7)] flex items-center gap-2">
              Consultoria Gratuita <Sparkles className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-500/15 blur-[120px] rounded-full -z-10 animate-pulse" />
        <div className="absolute top-20 right-10 w-40 h-40 bg-yellow-500/5 blur-[60px] rounded-full -z-10" />
        
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-8 tracking-wide uppercase backdrop-blur-sm">
            <Crown className="w-3.5 h-3.5" /> Plataforma Oficial • Marketplace de Energia Solar
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black text-white tracking-tight mb-8 leading-[1.1]">
            Sua energia solar <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-500 to-yellow-500 animate-pulse">
              livre para circular
            </span>
          </h1>
          
          <p className="text-lg md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed font-light">
            Conectamos quem gera energia solar excedente com quem quer economizar na conta de luz. 
            <span className="text-white font-medium"> Simples, seguro e 100% digital.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/economizar" className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-white to-slate-200 text-slate-900 rounded-full font-bold text-lg hover:from-slate-200 hover:to-slate-300 transition-all flex items-center justify-center gap-3 group shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_45px_rgba(255,255,255,0.5)] relative overflow-hidden">
              <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              Quero economizar <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link href="/vender" className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 text-emerald-400 border border-emerald-500/40 rounded-full font-bold text-lg hover:bg-emerald-500/30 transition-all flex items-center justify-center gap-3 group hover:scale-105 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <Zap className="w-5 h-5" /> Quero vender energia <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 mt-12 text-slate-500 text-xs">
            <div className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-500" /> Dados Protegidos</div>
            <div className="flex items-center gap-1"><BadgeCheck className="w-3 h-3 text-emerald-500" /> Conformidade LGPD</div>
            <div className="flex items-center gap-1"><Globe className="w-3 h-3 text-emerald-500" /> Transação Segura</div>
          </div>
        </div>
      </section>

      {/* --- COMO FUNCIONA --- */}
      <section id="como-funciona" className="py-24 px-6 bg-slate-900/40 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold mb-4 uppercase tracking-wider">
              <Flame className="w-3 h-3" /> Metodologia Exclusiva
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Energia solar compartilhada em 4 passos</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">Democratizamos o acesso à energia limpa com um marketplace simples, seguro e regulado para o mercado brasileiro.</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6 relative">
            <div className="absolute top-1/3 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500/20 via-emerald-500/40 to-emerald-500/20 hidden md:block -z-0" />
            
            {[
              { step: "01", title: "Cadastre-se", desc: "Crie sua conta em minutos. Informe se você é gerador com excedente ou consumidor buscando economia.", icon: Users, badge: "1min" },
              { step: "02", title: "Match Perfeito", desc: "Nosso algoritmo cruza oferta e demanda na sua região, garantindo máxima eficiência energética.", icon: Zap, badge: "Automático" },
              { step: "03", title: "Energia Compartilhada", desc: "A energia excedente é direcionada via compensação na rede, com rastreabilidade total.", icon: Globe, badge: "Rastreado" },
              { step: "04", title: "Economize ou Lucre", desc: "Consumidores pagam menos na fatura. Geradores monetizam o excedente desperdiçado.", icon: TrendingUp, badge: "Resultado" },
            ].map((item, i) => (
              <div key={i} className="relative p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-emerald-500/50 transition-all group hover:-translate-y-2 hover:shadow-[0_20px_40px_-10px_rgba(16,185,129,0.3)] z-10">
                <div className="absolute -top-3 left-6 px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 text-[9px] font-black text-emerald-400 border border-emerald-500/30 backdrop-blur-sm">
                  {item.badge}
                </div>
                <span className="absolute -top-4 left-8 text-7xl font-black text-white/5 group-hover:text-emerald-500/20 transition-colors">{item.step}</span>
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center text-emerald-400 mb-8 group-hover:scale-110 transition-transform">
                  <item.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SUSTENTABILIDADE --- */}
      <section id="sustentabilidade" className="py-24 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 text-emerald-400 font-bold text-sm uppercase tracking-widest mb-4 bg-emerald-500/10 px-3 py-1 rounded-full w-fit">
              <Leaf className="w-4 h-4" /> Impacto Real
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight">
              Cada kWh compartilhado é um passo para <span className="text-emerald-400">um Brasil mais verde</span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              A EnergiaLivre transforma excedente solar em impacto real. Ao conectar geradores e consumidores, reduzimos o desperdício energético e aceleramos a transição para uma matriz limpa.
            </p>
            <ul className="space-y-4">
              {[
                "Energia 100% solar, sem emissões na geração",
                "Rastreabilidade completa de origem renovável",
                "Contribuição direta para metas ESG e ODS 7 e 13"
              ].map((text, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300 group">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" /> {text}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 border border-emerald-500/30 text-center group hover:scale-105 transition-all">
              <div className="text-4xl font-black text-white mb-2">4.200 t</div>
              <div className="text-xs text-emerald-400 uppercase font-bold tracking-wider flex items-center justify-center gap-1"><TrendingDown className="w-3 h-3" /> CO₂ evitado</div>
              <div className="text-[10px] text-slate-500 mt-2">~ 18 mil árvores</div>
            </div>
            <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-500/20 to-cyan-600/5 border border-blue-500/30 text-center group hover:scale-105 transition-all">
              <div className="text-4xl font-black text-white mb-2">18 GWh</div>
              <div className="text-xs text-blue-400 uppercase font-bold tracking-wider">Energia Limpa</div>
              <div className="text-[10px] text-slate-500 mt-2">Compartilhada</div>
            </div>
            <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-800 to-slate-900 border border-white/10 text-center col-span-2 group hover:border-emerald-500/40 transition-all">
              <div className="text-4xl font-black text-white mb-2 flex items-center justify-center gap-2">100% <Sparkles className="w-6 h-6 text-yellow-500" /></div>
              <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Renovável & Certificável</div>
            </div>
          </div>
        </div>
      </section>

      {/* --- VANTAGENS FINANCEIRAS --- */}
      <section id="vantagens" className="py-24 px-6 bg-slate-900/40 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[10px] font-bold mb-4 uppercase tracking-wider">
              <Crown className="w-3 h-3" /> Retorno Financeiro
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ganhe de todos os lados do marketplace</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">Seja você quem gera ou quem consome, a EnergiaLivre cria valor real para o seu bolso.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-10">
            <div className="p-10 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 hover:border-emerald-500/50 transition-all hover:-translate-y-2 relative group">
              <div className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-[9px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1">
                <Flame className="w-3 h-3" /> +80% de Procura
              </div>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/30 to-emerald-600/10 rounded-2xl flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-white">Para Consumidores</h3>
              </div>
              <div className="space-y-5 mb-10">
                {["Economia imediata na conta de luz", "Até 32% de redução na fatura mensal", "Sem necessidade de investimento em painéis", "Contrato flexível, cancele quando quiser"].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-slate-400 text-base">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" /> {item}
                  </div>
                ))}
              </div>
              <Link href="/economizar" className="w-full block text-center py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-900 rounded-2xl font-bold text-lg hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-[0_0_25px_rgba(16,185,129,0.4)]">
                Quero Economizar
              </Link>
            </div>

            <div className="p-10 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 hover:border-blue-500/50 transition-all hover:-translate-y-2 relative group">
              <div className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white text-[9px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1">
                <Zap className="w-3 h-3" /> Alta Demanda
              </div>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/30 to-cyan-600/10 rounded-2xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-white">Para Geradores</h3>
              </div>
              <div className="space-y-5 mb-10">
                {["Monetize seu excedente solar", "Receba por cada kWh compartilhado", "Valorização real do seu investimento", "Gestão 100% digital do portfólio"].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-slate-400 text-base">
                    <CheckCircle2 className="w-5 h-5 text-blue-500" /> {item}
                  </div>
                ))}
              </div>
              <Link href="/vender" className="w-full block text-center py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl font-bold text-lg hover:from-blue-400 hover:to-blue-500 transition-all shadow-[0_0_25px_rgba(59,130,246,0.4)]">
                Quero Vender Energia
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            {[
              { label: "Ticket Médio Econ.", val: "R$ 144/mês", color: "text-emerald-400" },
              { label: "ROI Geradores", val: "+18%", color: "text-blue-400" },
              { label: "Ativação", val: "< 48h", color: "text-white" },
              { label: "Taxa Plataforma", val: "8% apenas", color: "text-slate-400" },
            ].map((stat, i) => (
              <div key={i} className="p-6 rounded-3xl bg-white/5 border border-white/10 text-center hover:bg-white/10 transition-all hover:scale-105 hover:border-emerald-500/30 group">
                <div className={`text-2xl font-black ${stat.color} mb-1`}>{stat.val}</div>
                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold group-hover:text-emerald-400 transition-colors">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- TESTEMUNHOS --- */}
      <section id="depoimentos" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold mb-4 uppercase tracking-wider">
              <Award className="w-3 h-3" /> Resultados Reais
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Quem já está lucrando</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">Histórias reais de economia e rentabilidade com a EnergiaLivre.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Ricardo", role: "Dono de Indústria", text: "Sinceramente, eu estava cético no começo, mas a economia na fatura da minha empresa foi surreal.", tag: "Redução de 32%" },
              { name: "Mariana", role: "Residencial", text: "Eu não acreditava que era possível baixar tanto a conta de luz da minha casa.", tag: "Economia R$ 210/mês" },
              { name: "André", role: "Engenheiro", text: "O projeto da EnergiaLivre foi impecável do início ao fim.", tag: "Eficiência 100%" },
              { name: "Beatriz", role: "Comércio Local", text: "A economia que tive me permitiu reinvestir na minha loja esse mês.", tag: "Redução 28%" },
              { name: "Lucas", role: "Proprietário de Usina", text: "Em poucos dias já vi a diferença no bolso.", tag: "Excedente Rentável" },
            ].map((test, i) => (
              <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col justify-between hover:border-emerald-500/40 transition-all group">
                <div className="mb-6">
                  <div className="flex gap-1 mb-4 text-yellow-400">
                    {[...Array(5)].map((_, j) => <Award key={j} className="w-4 h-4 fill-current" />)}
                  </div>
                  <p className="text-slate-300 italic leading-relaxed">"{test.text}"</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-blue-500 flex items-center justify-center font-bold text-white uppercase shadow-lg">
                    {test.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-bold flex items-center gap-1">
                      {test.name} <BadgeCheck className="w-3 h-3 text-emerald-400" />
                    </div>
                    <div className="text-xs text-slate-500">{test.role}</div>
                  </div>
                  <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 text-emerald-400 text-[9px] font-bold border border-emerald-500/30 whitespace-nowrap">
                    {test.tag}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-20 px-6 border-t border-white/10 bg-[#01040f]">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-emerald-400 rounded-lg flex items-center justify-center shadow-lg">
                <Zap className="text-slate-900 w-4 h-4 fill-current" />
              </div>
              <span className="text-xl font-black text-white tracking-tighter">ENERGIA<span className="text-emerald-500">LIVRE</span></span>
              <div className="ml-2 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[8px] font-black text-emerald-400 uppercase">
                Marketplace
              </div>
            </div>
            <p className="text-slate-400 max-w-sm text-sm leading-relaxed mb-8">
              Conectamos energia solar excedente a quem quer economizar. Tecnologia, sustentabilidade e impacto financeiro real.
            </p>
            <div className="flex gap-4">
               <div className="p-2 rounded-lg bg-white/5 border border-white/10 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/10 cursor-pointer transition-all">
                 <MessageSquare className="w-5 h-5" />
               </div>
               <div className="p-2 rounded-lg bg-white/5 border border-white/10 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/10 cursor-pointer transition-all">
                 <ShieldCheck className="w-5 h-5" />
               </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-4">
            <h4 className="text-white font-bold mb-2">Produto</h4>
            <ul className="space-y-3 text-sm text-slate-500 font-medium">
              <li className="hover:text-emerald-400 cursor-pointer transition-colors">Como funciona</li>
              <li className="hover:text-emerald-400 cursor-pointer transition-colors">Simulador</li>
              <li className="hover:text-emerald-400 cursor-pointer transition-colors">Para Geradores</li>
              <li className="hover:text-emerald-400 cursor-pointer transition-colors">Para Consumidores</li>
            </ul>
          </div>
          
          <div className="flex flex-col gap-4">
            <h4 className="text-white font-bold mb-2">Legal</h4>
            <ul className="space-y-3 text-sm text-slate-500 font-medium">
              <li className="hover:text-emerald-400 cursor-pointer transition-colors">Termos de Uso</li>
              <li className="hover:text-emerald-400 cursor-pointer transition-colors">Privacidade</li>
              <li className="hover:text-emerald-400 cursor-pointer transition-colors">LGPD</li>
              <Link href="/regulamentacao" className="hover:text-emerald-400 cursor-pointer transition-colors block">Regulamentação ANEEL</Link>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 text-center text-slate-600 text-xs font-medium">
          © 2026 EnergiaLivre. Marketplace de Energia Solar. 
          <br className="md:hidden" /> 
          <span className="hidden md:inline ml-2">|</span> 
          <span className="ml-2">Conectando pessoas por uma energia mais limpa e acessível.</span>
        </div>
      </footer>
    </div>
  );
}
