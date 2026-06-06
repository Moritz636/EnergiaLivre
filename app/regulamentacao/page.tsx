"use client";
import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  FileText,
  CheckCircle2,
  Scale,
  Globe,
  Zap,
  Users,
  Building,
  Crown,
  Flame,
  Sparkles,
  BadgeCheck,
  Award,
  TrendingUp,
  Clock,
} from 'lucide-react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export default function RegulamentacaoPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans flex flex-col overflow-x-hidden">
      <SiteHeader />

      {/* Efeitos de fundo - Autoridade Visual (Lei 6) */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent -z-20" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] -z-10" />
      <div className="fixed top-40 right-0 w-80 h-80 bg-yellow-500/5 rounded-full blur-[100px] -z-10" />
      <div className="fixed bottom-20 right-20 w-60 h-60 bg-blue-500/5 rounded-full blur-[80px] -z-10" />

      {/* --- TOP NAVIGATION --- */}
      <div className="max-w-5xl mx-auto px-6 pt-8">

        {/* IMAGEM DE REGULAMENTAÇÃO - Com Efeito de Poder */}
        <div className="w-full overflow-hidden rounded-2xl shadow-2xl shadow-emerald-500/20 mb-12 relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-transparent to-yellow-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <img 
            src="/images/image.png" 
            alt="Lei ANEEL 687/2015 - Geração Compartilhada de Energia Solar - Autoridade Regulatória Brasileira" 
            className="w-full h-auto rounded-2xl block transform group-hover:scale-105 transition-transform duration-700"
          />
          {/* Selo sobreposto - Exclusividade */}
          <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md rounded-full px-4 py-1.5 border border-yellow-500/50 shadow-lg">
            <span className="text-yellow-400 text-xs font-bold tracking-wider flex items-center gap-2">
              <Crown className="w-3 h-3" /> SELO DE AUTORIDADE
            </span>
          </div>
        </div>

        {/* Header com Título Impactante */}
        <div className="text-center mb-16 relative">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -z-10" />
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-yellow-500/20 rounded-2xl text-yellow-400 mb-6 shadow-lg relative">
            <ShieldCheck className="w-10 h-10" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4 leading-tight">
            Compliance e <br/>
            <span className="bg-gradient-to-r from-emerald-400 via-yellow-400 to-blue-400 bg-clip-text text-transparent">
              Rigor Regulatório
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Operamos sob as normas mais rígidas do setor elétrico brasileiro para garantir segurança jurídica e economia real.
          </p>
        </div>
      </div>

      {/* --- SEÇÃO FUNDAMENTO LEGAL ANEEL 687/2015 - COM PODER --- */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 mb-24">
        <div className="relative bg-gradient-to-br from-emerald-500/10 via-blue-500/5 to-yellow-500/10 border-2 border-yellow-500/40 rounded-3xl p-6 md:p-12 shadow-2xl overflow-hidden group">
          
          {/* Efeito de brilho no hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/5 to-yellow-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
          {/* Badge de Vigência com Tradição como Poder (Lei 34) */}
          <div className="absolute top-4 right-4 md:top-8 md:right-8">
            <span className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-600/30 to-yellow-500/20 text-yellow-400 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider border border-yellow-500/50 backdrop-blur-sm">
              <Clock className="w-3 h-3" /> Vigência: 2015 - Atual
            </span>
          </div>

          <div className="flex items-center gap-3 mb-8 border-b border-yellow-500/20 pb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-500/30 to-amber-600/30 rounded-xl flex items-center justify-center shadow-lg">
              <Scale className="w-7 h-7 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                Fundamento Legal
              </h2>
              <p className="text-yellow-400 text-sm font-mono tracking-wide">
                RESOLUÇÃO NORMATIVA ANEEL 687/2015
              </p>
            </div>
          </div>

          {/* Caixa de Citação Verbatim - A Verdade que Ninguém Pode Contester */}
          <div className="bg-black/40 backdrop-blur-sm border-l-4 border-yellow-500 p-6 md:p-8 rounded-r-2xl mb-10 relative">
            <div className="absolute -top-3 -left-3 text-yellow-500/20">
              <FileText className="w-8 h-8" />
            </div>
            <p className="text-white text-lg md:text-xl leading-relaxed font-medium relative z-10">
              <span className="text-yellow-500 text-2xl mr-2">“</span>
              A Lei existe desde 2015: A <span className="text-yellow-400 font-bold border-b border-yellow-500/50">ANEEL</span> (Agência Nacional de Energia Elétrica) criou a 
              <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1 mx-1"> Resolução Normativa 687/2015</span>. 
              Ela permite que quem tem energia solar (excedente) doe ou ceda créditos para quem não tem, desde que esteja na mesma área de 
              concessão da distribuidora (ex: mesma região da <span className="text-blue-400">Enel</span>, 
              <span className="text-blue-400"> CPFL</span>, <span className="text-blue-400"> Cemig</span>, etc.).
              <span className="text-yellow-500 text-2xl ml-2 align-top">”</span>
            </p>
          </div>

          {/* Grid de Explicação Dupla - Sedução + Utilidade */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="flex gap-4 group-hover:bg-white/5 rounded-2xl p-4 transition-all duration-300 -mx-4">
              <div className="shrink-0 w-12 h-12 bg-gradient-to-br from-emerald-500/30 to-emerald-600/10 rounded-xl flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                  O que isso significa para você?
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">Vantagem Direta</span>
                </h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Você pode <strong className="text-emerald-400">economizar na conta de luz sem instalar nada no seu telhado</strong>, 
                  pois estamos apenas transferindo créditos de quem já tem energia solar. Zero investimento, zero obras.
                </p>
              </div>
            </div>

            <div className="flex gap-4 group-hover:bg-white/5 rounded-2xl p-4 transition-all duration-300 -mx-4">
              <div className="shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500/30 to-cyan-600/10 rounded-xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                  Como funciona na prática?
                  <span className="text-[9px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">Mecanismo Legal</span>
                </h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Seu vizinho com painéis solares tem créditos sobrando. A <strong className="text-yellow-400">lei permite que ele te doe</strong>. 
                  Nós só conectamos vocês dentro das regras da ANEEL. Todos ganham.
                </p>
              </div>
            </div>
          </div>

          {/* Barra de Progresso Simbólica (Confiança) */}
          <div className="mb-6 bg-white/5 rounded-full h-1 overflow-hidden">
            <div className="w-full h-full bg-gradient-to-r from-yellow-500 via-emerald-500 to-blue-500 rounded-full" style={{ width: '100%' }} />
          </div>

          {/* Rodapé do Card - Cláusula de Proteção */}
          <div className="flex items-start gap-2 pt-6 border-t border-white/10 text-slate-500 text-xs italic">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <span className="text-yellow-500/70 font-mono text-[10px] uppercase tracking-wider">Nota Técnica:</span> A EnergiaLivre é uma facilitadora tecnológica. 
              A propriedade e transferência dos créditos segue integralmente as regras da ANEEL e da distribuidora local de energia.
            </p>
          </div>
        </div>
      </section>

      {/* --- GRID DE PILARES COM PODER --- */}
      <section className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
        
        {/* Pilar 1 - Marco Legal ANEEL */}
        <div className="p-8 rounded-3xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-emerald-500/40 transition-all duration-500 group hover:-translate-y-2 hover:shadow-[0_20px_40px_-10px_rgba(16,185,129,0.2)]">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/30 to-emerald-600/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Scale className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
            Marco Legal e ANEEL
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">Art. 687</span>
          </h3>
          <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
            Operamos estritamente sob a <span className="text-emerald-400 font-bold">Resolução Normativa 687/2015 da ANEEL</span>, garantindo que cada kWh transferido esteja em conformidade com a legislação de Geração Distribuída do Brasil.
          </p>
          <div className="mt-4 flex items-center gap-1 text-[10px] text-emerald-500/50">
            <BadgeCheck className="w-3 h-3" /> Conformidade Verificada
          </div>
        </div>

        {/* Pilar 2 - Blindagem LGPD */}
        <div className="p-8 rounded-3xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-blue-500/40 transition-all duration-500 group hover:-translate-y-2 hover:shadow-[0_20px_40px_-10px_rgba(59,130,246,0.2)]">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500/30 to-cyan-600/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Lock className="w-6 h-6 text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
            Blindagem LGPD
            <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">Lei 13.709</span>
          </h3>
          <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
            Seus dados são criptografados e tratados com o mais alto rigor de privacidade, seguindo a <span className="text-blue-400 font-bold">Lei Geral de Proteção de Dados</span> para assegurar total confidencialidade.
          </p>
          <div className="mt-4 flex items-center gap-1 text-[10px] text-blue-500/50">
            <ShieldCheck className="w-3 h-3" /> Dados Criptografados
          </div>
        </div>
      </section>

      {/* --- PROTOCOLOS DE OPERAÇÃO - Os 4 Pilares de Confiança --- */}
      <section className="max-w-5xl mx-auto px-6 mb-24">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold mb-4 uppercase tracking-wider">
            <Flame className="w-3 h-3" /> Metodologia Transparente
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Protocolos de Operação</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">Nossos processos internos para garantir a transparência total e segurança jurídica</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "Validação", desc: "Checagem de titularidade e área de concessão.", icon: CheckCircle2, color: "emerald" },
            { title: "Matching", desc: "Conexão inteligente entre gerador e consumidor.", icon: Users, color: "blue" },
            { title: "Auditabilidade", desc: "Rastreio de créditos via fatura da distribuidora.", icon: FileText, color: "yellow" },
            { title: "Sustentabilidade", desc: "Certificação de origem 100% solar.", icon: Globe, color: "emerald" },
          ].map((item, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center hover:bg-white/10 transition-all duration-300 group hover:-translate-y-1 hover:border-emerald-500/30">
              <div className={`w-12 h-12 bg-${item.color}-500/20 rounded-xl flex items-center justify-center text-${item.color}-400 mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                <item.icon className="w-5 h-5" />
              </div>
              <h4 className="text-white font-bold mb-2 text-sm">{item.title}</h4>
              <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Indicadores institucionais (apenas referências regulatórias, sem métricas de marketing) */}
        <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10 text-center text-xs text-slate-400">
          <p>
            Plataforma em conformidade com a <span className="text-emerald-400">Resolução Normativa ANEEL 687/2015</span> e a <span className="text-emerald-400">Lei 14.300/2022</span>.
            Indicadores operacionais publicados no <Link href="/admin/dashboard" className="text-emerald-400 hover:underline">painel administrativo</Link> (acesso restrito).
          </p>
        </div>
      </section>

      {/* --- SELO FINAL - A Coroação da Autoridade (Lei 27 + Lei 34) --- */}
      <footer className="max-w-3xl mx-auto px-6 text-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-yellow-500/20 to-blue-500/20 rounded-full blur-2xl" />
          <div className="relative p-12 rounded-full bg-gradient-to-b from-emerald-500/10 via-yellow-500/5 to-transparent border border-emerald-500/30 inline-block shadow-2xl">
            
            {/* Selo Flutuante */}
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#020617] px-4 py-1.5 rounded-full border border-yellow-500/40 shadow-lg">
              <span className="text-yellow-400 text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                <Crown className="w-3 h-3" /> Selo de Confiança 2026
              </span>
            </div>
            
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500/30 to-amber-600/20 rounded-full flex items-center justify-center animate-pulse">
                <Award className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Compromisso com a Ética
              </h3>
              <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
                Atuamos com transparência absoluta para democratizar a energia solar no Brasil, sempre alinhados à ANEEL e à LGPD.
              </p>
              <div className="flex items-center gap-3 pt-4">
                <div className="flex items-center gap-1 text-[9px] text-emerald-500/60">
                  <BadgeCheck className="w-3 h-3" /> ANEEL 687/2015
                </div>
                <div className="w-1 h-1 rounded-full bg-slate-700" />
                <div className="flex items-center gap-1 text-[9px] text-emerald-500/60">
                  <ShieldCheck className="w-3 h-3" /> LGPD
                </div>
                <div className="w-1 h-1 rounded-full bg-slate-700" />
                <div className="flex items-center gap-1 text-[9px] text-emerald-500/60">
                  <Globe className="w-3 h-3" /> Energia 100% Solar
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Linha de Fim - O Corte Maquiavélico */}
        <div className="mt-16 text-center text-slate-600/50 text-[9px] font-mono border-t border-white/5 pt-8">
          <span className="tracking-widest">ENERGIALIVRE • PLATAFORMA DE TRANSFERÊNCIA DE CRÉDITOS ENERGÉTICOS • RESOLUÇÃO ANEEL 687/2015</span>
        </div>
      </footer>
      <SiteFooter />
    </div>
  );
}