'use client';
import Link from 'next/link';
import { 
  ArrowRight, 
  Zap, 
  TrendingUp, 
  DollarSign, 
  Users, 
  ShieldCheck,
  Crown,
  Flame,
  CheckCircle2,
  BarChart3,
  Award,
  ArrowLeft,
  Sun,
  Battery,
  Sparkles,
  Mail,
  AlertCircle
} from 'lucide-react';

export default function ParaGeradoresPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans overflow-x-hidden">
      
      {/* Efeitos de fundo para criar atmosfera de poder */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-yellow-500/5 via-transparent to-transparent -z-20" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-yellow-500/5 rounded-full blur-[100px] -z-10" />
      <div className="fixed top-40 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-[100px] -z-10" />

      {/* Navbar minimalista para não distrair */}
      <nav className="border-b border-white/10 bg-[#020617]/90 backdrop-blur-xl fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-lg flex items-center justify-center transition-all group-hover:shadow-[0_0_20px_rgba(245,158,11,0.5)]">
              <Zap className="text-slate-900 w-4 h-4 fill-current" />
            </div>
            <span className="text-xl font-black text-white tracking-tighter">ENERGIA<span className="text-yellow-500">LIVRE</span></span>
          </Link>
          <Link href="/" className="text-sm text-slate-400 hover:text-yellow-500 transition flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Voltar ao Portal
          </Link>
        </div>
      </nav>

      <div className="pt-24 px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          
          {/* --- HERO SECTION: A Grande Revelação (Lei 6) --- */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-yellow-500/20 to-amber-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-bold mb-8 tracking-wide backdrop-blur-sm">
              <Crown className="w-3.5 h-3.5" /> Convite Exclusivo para Geradores
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-[1.1]">
              Seu Dinheiro Está <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">
                Parado no Sol
              </span>
            </h1>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-8 leading-relaxed">
              Todo mês, você desperdiça dinheiro com energia solar que poderia estar sendo vendida. 
              A <span className="text-yellow-400 font-bold">EnergiaLivre</span> conecta seu excedente a milhares de consumidores que querem economizar.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link 
                href="/completar-perfil/gerador" 
                className="group w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-900 rounded-full font-bold text-lg hover:from-yellow-400 hover:to-amber-400 transition-all flex items-center justify-center gap-3 shadow-xl"
              >
                Quero Transformar Meu Excedente em Lucro <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="flex items-center justify-center gap-6 mt-8 text-slate-500 text-xs">
              <div className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-yellow-500" /> Sem Custos de Entrada</div>
              <div className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-yellow-500" /> Contrato 100% Regulado</div>
              <div className="flex items-center gap-1"><Zap className="w-3 h-3 text-yellow-500" /> Pagamento Mensal Garantido</div>
            </div>
          </div>

          {/* --- SEÇÃO 2: A Verdade Inconfortável (Lei 33: Descubra a Fraqueza) --- */}
          <div className="mb-20 p-8 rounded-3xl bg-gradient-to-r from-red-500/5 to-amber-500/5 border border-red-500/20">
            <div className="flex items-center gap-3 mb-6 justify-center">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <h2 className="text-2xl font-bold text-white">Sua Usina Pode Está Operando no Vermelho</h2>
            </div>
            <p className="text-slate-300 text-center max-w-2xl mx-auto">
              De acordo com a ANEEL, mais de <strong className="text-red-400">40% da energia gerada por usinas solares é desperdiçada</strong> por falta de consumidores. 
              Enquanto isso, tarifas continuam subindo. <strong className="text-yellow-400">Você está perdendo dinheiro todos os dias.</strong>
            </p>
          </div>

          {/* --- SEÇÃO 3: Como a EnergiaLivre Resolve (Lei 7 e 27) --- */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[10px] font-bold mb-4 uppercase">
                <Sparkles className="w-3 h-3" /> O Futuro da Geração Distribuída
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Sua Usina. Seu Lucro. Sem Esforço.</h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">Nós fazemos o trabalho de conectar você a consumidores. Você só precisa fornecer a energia.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-yellow-500/40 transition-all group">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500/20 to-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sun className="w-8 h-8 text-yellow-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">1. Cadastre sua Usina</h3>
                <p className="text-slate-400 text-sm">Informe a capacidade e o excedente. Nosso time valida e ativa em até 48h.</p>
              </div>
              <div className="text-center p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-yellow-500/40 transition-all group">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500/20 to-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-yellow-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">2. Match Perfeito</h3>
                <p className="text-slate-400 text-sm">Nosso algoritmo conecta você a consumidores da sua região que buscam energia limpa.</p>
              </div>
              <div className="text-center p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-yellow-500/40 transition-all group">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500/20 to-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-yellow-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">3. Receba Mensalmente</h3>
                <p className="text-slate-400 text-sm">Todo mês, o valor da energia vendida cai na sua conta. Sem surpresas, sem burocracia.</p>
              </div>
            </div>
          </div>

          {/* --- SEÇÃO 4: Prova Social (Lei 27 e Lei 34) --- */}
          <div className="mb-20 p-8 rounded-3xl bg-gradient-to-br from-yellow-500/10 to-amber-500/5 border border-yellow-500/30">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-black text-yellow-400">+2.400</div>
                <div className="text-slate-400 text-sm">Consumidores Ativos</div>
              </div>
              <div>
                <div className="text-4xl font-black text-yellow-400">18 GWh</div>
                <div className="text-slate-400 text-sm">Energia Compartilhada</div>
              </div>
              <div>
                <div className="text-4xl font-black text-yellow-400">R$ 2.4M</div>
                <div className="text-slate-400 text-sm">Gerados em Comissões</div>
              </div>
            </div>
          </div>

          {/* --- SEÇÃO 5: A Grande Oportunidade (Lei 11 e Lei 32) --- */}
          <div className="mb-20 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Você está no Controle</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8">
              Enquanto outros geradores desperdiçam seu excedente, você pode estar lucrando. 
              A <span className="text-yellow-400 font-bold">EnergiaLivre</span> é a ponte entre o sol e o seu bolso.
            </p>
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10 text-left">
                <CheckCircle2 className="w-5 h-5 text-yellow-400 shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-white">Modelo 100% Regulado</h4>
                  <p className="text-slate-400 text-sm">Operamos dentro da Lei 14.300/2022 e Resolução ANEEL 687.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10 text-left">
                <CheckCircle2 className="w-5 h-5 text-yellow-400 shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-white">Gestão Descomplicada</h4>
                  <p className="text-slate-400 text-sm">Você acompanha tudo pelo nosso dashboard. Sem planilhas.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10 text-left">
                <CheckCircle2 className="w-5 h-5 text-yellow-400 shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-white">Pagamento Garantido</h4>
                  <p className="text-slate-400 text-sm">Todo consumo é validado e o valor é creditado até o dia 15 do mês seguinte.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10 text-left">
                <CheckCircle2 className="w-5 h-5 text-yellow-400 shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-white">Suporte Dedicado</h4>
                  <p className="text-slate-400 text-sm">Time especializado para tirar todas as suas dúvidas sobre créditos e geração.</p>
                </div>
              </div>
            </div>
          </div>

          {/* --- SEÇÃO FINAL: Call to Action Exclusivo (Lei 16 e 32) --- */}
          <div className="text-center p-12 rounded-3xl bg-gradient-to-r from-yellow-500/10 via-amber-500/5 to-transparent border border-yellow-500/30">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 text-xs font-bold mb-6">
              <Mail className="w-3 h-3" /> Pré-Cadastro Exclusivo • Vagas Limitadas
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">O Mercado de Energia não Espera</h3>
            <p className="text-slate-400 max-w-md mx-auto mb-8">
              Enquanto você decide, outros geradores já estão lucrando. Garanta sua vaga no clube seleto de parceiros da EnergiaLivre.
            </p>
            <Link 
              href="/completar-perfil/gerador" 
              className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-900 rounded-full font-bold text-lg hover:from-yellow-400 hover:to-amber-400 transition-all transform hover:scale-105 shadow-xl"
            >
              Quero Ser um Gerador Parceiro <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}