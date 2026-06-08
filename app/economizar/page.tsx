"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Loader2,
  ArrowLeft,
  FileText,
  Crown,
  Flame,
  Sparkles,
  TrendingDown,
  Clock,
  BadgeCheck,
  MapPin,
  Wallet,
  Send,
  AlertCircle,
  Gift,
  Users,
  Award,
  TrendingUp
} from 'lucide-react';
import Image from 'next/image';
import { saveLead } from '@/app/actions';
import { buildFollowUpUrl, splitCidadeEstado } from '@/lib/leads';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export default function EconomizarPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [rotatingMessageIndex, setRotatingMessageIndex] = useState(0);
  const [economiaProjetada, setEconomiaProjetada] = useState(0);
  const [formData, setFormData] = useState({
    gastoMensal: '',
    cidade: '',
    nome: '',
    whatsapp: '',
    email: '',
  });

  const [acceptedLgpd, setAcceptedLgpd] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const whatsappRegex = /^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$/;
  const isValidWhatsapp = whatsappRegex.test(formData.whatsapp.replace(/\s/g, ''));
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

  // Mensagens rotativas para o step 3 (carregamento persuasivo)
  const rotatingMessages = [
    { icon: <Zap className="w-4 h-4" />, text: "Verificando usinas disponíveis na sua região..." },
    { icon: <TrendingDown className="w-4 h-4" />, text: "Calculando sua economia potencial..." },
    { icon: <Crown className="w-4 h-4" />, text: "Selecionando as melhores ofertas exclusivas..." },
    { icon: <Flame className="w-4 h-4" />, text: "Últimas vagas na sua região!" },
    { icon: <Sparkles className="w-4 h-4" />, text: "Preparando relatório personalizado..." },
  ];

  // Cálculo da economia projetada em tempo real (Step 1)
  useEffect(() => {
    const gasto = parseFloat(formData.gastoMensal);
    if (!isNaN(gasto) && gasto > 0) {
      const economia = gasto * 0.32; // Até 32% de economia
      setEconomiaProjetada(Math.round(economia));
    } else {
      setEconomiaProjetada(0);
    }
  }, [formData.gastoMensal]);

  // Rotação de mensagens no step 3
  useEffect(() => {
    if (step === 3) {
      const interval = setInterval(() => {
        setRotatingMessageIndex((prev) => (prev + 1) % rotatingMessages.length);
      }, 2000);

      const timer = setTimeout(() => {
        setStep(4);
      }, 8000); // Aumentado para 8 segundos para mostrar mais mensagens

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [step]);

  // Redirecionamento automático do Passo 5 para /login após captura
  useEffect(() => {
    if (step === 5) {
      const t = setTimeout(() => router.push('/login?from=consumidor'), 6000);
      return () => clearTimeout(t);
    }
  }, [step, router]);

  const handleNext = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(step + 1);
    }, 1000);
  };

  const handlePrev = () => setStep(step - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!isValidWhatsapp) {
      setSubmitError('WhatsApp inválido. Use o formato (84) 98785-8668.');
      return;
    }
    if (!isValidEmail) {
      setSubmitError('E-mail inválido.');
      return;
    }
    if (!acceptedLgpd) {
      setSubmitError('É necessário aceitar os termos de privacidade para continuar.');
      return;
    }

    setIsLoading(true);

    try {
      const { estado } = splitCidadeEstado(formData.cidade);
      const result = await saveLead({
        tipo: 'consumidor',
        nome: formData.nome,
        email: formData.email,
        whatsapp: formData.whatsapp,
        cidade: formData.cidade,
        estado: estado || 'ND',
        gastoMensal: formData.gastoMensal,
      });
      if (!result.success) throw new Error(result.message);

      setStep(5);
    } catch (error: any) {
      console.error('Falha no envio:', error);
      setSubmitError('Não conseguimos enviar agora. Tente novamente ou chame no WhatsApp.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col items-center justify-center px-6 py-20 font-sans overflow-x-hidden">

      {/* Background image */}
      <div className="fixed inset-0 -z-30" aria-hidden>
        <Image
          src="/images/familia-economia.webp"
          alt=""
          fill
          className="object-cover opacity-[0.06]"
          priority
        />
      </div>

      <SiteHeader />

      {/* Efeitos de fundo - Autoridade Visual */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent -z-20" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] -z-10" />
      <div className="fixed top-40 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px] -z-10" />

      <div className="max-w-2xl w-full">
        {/* Header com Badge de Escassez */}
        <div className="flex items-center justify-between mb-8">
          <a href="/" className="flex items-center gap-2 text-slate-500 hover:text-emerald-400 transition-colors text-sm font-medium group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Voltar ao Portal
          </a>
          <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 text-[9px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <Flame className="w-3 h-3" /> Análise Gratuita
          </div>
        </div>

        {/* Progresso Detalhado */}
        <div className="mb-8 space-y-3">
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className={`flex-1 h-2 rounded-full transition-all duration-500 ${s <= step ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-800'}`} />
            ))}
          </div>
          <div className="flex justify-between text-xs text-slate-500 px-1">
            <span className={step >= 1 ? "text-emerald-400" : ""}>💰 Consumo</span>
            <span className={step >= 2 ? "text-emerald-400" : ""}>📍 Localização</span>
            <span className={step >= 3 ? "text-emerald-400" : ""}>🔍 Análise</span>
            <span className={step >= 4 ? "text-emerald-400" : ""}>📋 Cadastro</span>
          </div>
        </div>

        {/* Card Principal com Efeito de Poder */}
        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl p-8 md:p-12 rounded-[40px] shadow-2xl relative overflow-hidden group">
          
          {/* Efeito de brilho no hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
          <div className="absolute top-4 right-4">
            <ShieldCheck className="w-6 h-6 text-emerald-500/20 group-hover:text-emerald-500/40 transition-all" />
          </div>

          {/* STEP 1 - Consumo Mensal */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold mb-4 uppercase tracking-wider">
                  <Wallet className="w-3 h-3" /> Passo 1 de 4
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">Qual a sua média de <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-500">gasto mensal de energia?</span></h2>
                <p className="text-slate-400 text-sm">Isso nos permite calcular a porcentagem exata de economia para o seu perfil.</p>
              </div>
              
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-2xl" id="gasto-label">R$</span>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="350"
                  aria-label="Gasto mensal em reais"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-2xl text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all hover:border-emerald-500/50"
                  value={formData.gastoMensal}
                  onChange={(e) => setFormData({...formData, gastoMensal: e.target.value})}
                />
              </div>

              {/* Economia Projetada em Tempo Real */}
              {economiaProjetada > 0 && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 text-center animate-in fade-in duration-300">
                  <p className="text-xs text-emerald-400/80 uppercase tracking-wider mb-1">Economia Projetada</p>
                  <p className="text-2xl font-bold text-white">R$ {economiaProjetada.toLocaleString('pt-BR')}<span className="text-sm text-emerald-400">/mês</span></p>
                  <p className="text-[10px] text-slate-500 mt-1">*baseado em até 32% de redução na fatura</p>
                </div>
              )}
              
              <button 
                onClick={handleNext}
                disabled={!formData.gastoMensal || isLoading}
                className="w-full py-5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:from-slate-700 disabled:to-slate-800 text-slate-900 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 group shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:shadow-[0_0_35px_rgba(16,185,129,0.5)]"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Continuar <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
              </button>

              {/* Selo de Confiança */}
              <div className="flex items-center justify-center gap-4 text-[10px] text-slate-500">
                <div className="flex items-center gap-1"><BadgeCheck className="w-3 h-3 text-emerald-500" /> Dados Protegidos</div>
                <div className="flex items-center gap-1"><Clock className="w-3 h-3 text-emerald-500" /> Análise Rápida</div>
                <div className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-500" /> Sem Compromisso</div>
              </div>
            </div>
          )}

          {/* STEP 2 - Localização */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold mb-4 uppercase tracking-wider">
                  <MapPin className="w-3 h-3" /> Passo 2 de 4
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">Em qual <span className="text-emerald-400">cidade e estado</span> você reside?</h2>
                <p className="text-slate-400 text-sm">Precisamos verificar a disponibilidade de usinas solares na sua região.</p>
              </div>
              
              <div className="relative">
                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Ex: São Paulo - SP"
                  aria-label="Cidade e estado"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-xl text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all hover:border-emerald-500/50"
                  value={formData.cidade}
                  onChange={(e) => setFormData({...formData, cidade: e.target.value})}
                />
              </div>

              {/* Tooltip explicativo */}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 text-[11px] text-slate-500">
                <AlertCircle className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Usinas solares disponíveis variam por região. Quanto mais específico, mais precisa é a análise.</span>
              </div>

              <div className="flex gap-4">
                <button onClick={handlePrev} className="flex-1 py-5 bg-slate-800/50 text-slate-300 rounded-2xl font-bold text-lg hover:bg-slate-700 transition-all border border-white/5">Voltar</button>
                <button 
                  onClick={handleNext}
                  disabled={!formData.cidade || isLoading}
                  className="flex-[2] py-5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:from-slate-700 disabled:to-slate-800 text-slate-900 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 group"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Analisar Viabilidade <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 - Carregamento com Mensagens Rotativas */}
          {step === 3 && (
            <div className="flex flex-col items-center justify-center py-12 space-y-8 animate-in fade-in duration-700">
              <div className="relative">
                <div className="w-24 h-24 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-500 w-8 h-8 animate-pulse" />
              </div>
              
              <div className="text-center space-y-3">
                <h2 className="text-2xl font-bold text-white">Cruzando dados de demanda...</h2>
                <div className="flex items-center justify-center gap-2 text-emerald-400 text-sm h-12">
                  {rotatingMessages[rotatingMessageIndex].icon}
                  <span className="animate-in fade-in duration-300">{rotatingMessages[rotatingMessageIndex].text}</span>
                </div>
              </div>

              {/* Barra de progresso do carregamento */}
              <div className="w-full max-w-xs h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full animate-[progress_8s_linear]" style={{ width: '100%' }} />
              </div>

              <p className="text-xs text-slate-600 text-center">Enquanto isso, saiba que você pode economizar até 32% na sua conta de luz ☀️</p>
            </div>
          )}

          {/* STEP 4 - Cadastro com Oferta Exclusiva */}
          {step === 4 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/20 rounded-full text-emerald-500 mb-6">
                  <Crown className="w-10 h-10" />
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[10px] font-bold mb-4 uppercase tracking-wider">
                  <Flame className="w-3 h-3" /> Oferta Personalizada • Exclusiva
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">Análise Concluída! <br/><span className="text-emerald-400">Temos ótimas notícias.</span></h2>
                <p className="text-slate-400 text-sm">Encontramos viabilidade para reduzir sua fatura. Para onde devemos enviar o seu relatório de economia?</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Seu nome completo"
                    aria-label="Nome completo"
                    required
                    className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all hover:border-emerald-500/50"
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  />
                </div>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Seu melhor e-mail"
                    aria-label="E-mail"
                    required
                    className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all hover:border-emerald-500/50"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="Seu WhatsApp com DDD"
                    aria-label="WhatsApp com DDD"
                    aria-invalid={formData.whatsapp.length > 0 && !isValidWhatsapp}
                    required
                    className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all hover:border-emerald-500/50"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                  />
                  {formData.whatsapp.length > 0 && !isValidWhatsapp && (
                    <p className="mt-1 text-[10px] text-red-400">Formato: (84) 98785-8668</p>
                  )}
                </div>

                {/* Resumo dos dados para confiança */}
                <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>💰 R$ {formData.gastoMensal || '0'}/mês</span>
                  <span>📍 {formData.cidade || 'Não informado'}</span>
                  <span>⚡ Economia: até 32%</span>
                </div>

                <label className="flex items-start gap-2 text-[11px] text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedLgpd}
                    onChange={(e) => setAcceptedLgpd(e.target.checked)}
                    required
                    className="mt-0.5 w-3.5 h-3.5 accent-emerald-500"
                  />
                  <span>
                    Concordo com a <a href="/termos" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Política de Privacidade</a> e
                    autorizo o contato comercial. Posso revogar a qualquer momento.
                  </span>
                </label>

                {submitError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-[11px] text-red-300" role="alert">
                    {submitError}
                  </div>
                )}

                <div className="flex items-center justify-center gap-4 py-2">
                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" /> LGPD
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    <BadgeCheck className="w-3 h-3 text-emerald-500" /> Dados Criptografados
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    <Clock className="w-3 h-3 text-emerald-500" /> Resposta em até 24h
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !acceptedLgpd}
                  className="w-full py-5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:from-slate-700 disabled:to-slate-800 disabled:cursor-not-allowed text-slate-900 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 group shadow-[0_0_25px_rgba(16,185,129,0.3)]"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Receber Relatório Agora <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
                </button>
              </form>
            </div>
          )}

          {/* STEP 5 - Sucesso com mensagem de fatura recebida e redirecionamento para /login */}
          {step === 5 && (
            <div className="text-center space-y-6 animate-in zoom-in duration-500">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-emerald-500/20 rounded-full text-emerald-500 mb-2 animate-bounce">
                <CheckCircle2 className="w-14 h-14" />
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-white">Tudo Pronto! 🚀</h2>
                <p className="text-emerald-400 text-sm font-medium uppercase tracking-wider">Fatura recebida ✓</p>
              </div>

              <p className="text-slate-300 leading-relaxed text-sm">
                Nossa equipe <strong className="text-white">já recebeu seus dados de consumo</strong> e vai priorizar a sua análise. Continue para o painel do consumidor e acompanhe sua economia em tempo real.
              </p>

              {/* CTA: Enviar Fatura via WhatsApp (opcional) */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-500/30 space-y-3">
                <p className="text-xs text-emerald-300 font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                  <FileText className="w-3.5 h-3.5" /> Quer acelerar em até 50%?
                </p>
                <p className="text-xs text-slate-400">
                  Envie uma foto da sua última fatura de energia. Isso torna o cálculo 100% preciso e acelera sua economia.
                </p>
                <a
                  href={buildFollowUpUrl('consumidor', { nome: formData.nome, cidade: formData.cidade })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 rounded-xl font-bold text-sm transition border border-emerald-500/30"
                >
                  📄 Enviar Fatura via WhatsApp
                </a>
              </div>

              {/* CTA: Continuar para Login → Dashboard Consumidor */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-500/10 to-blue-500/5 border border-blue-500/30 space-y-3">
                <p className="text-xs text-blue-300 font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Redirecionando para o Painel do Consumidor…
                </p>
                <button
                  onClick={() => router.push('/login?from=consumidor')}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-900 rounded-xl font-black hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  Continuar para o Login <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[10px] text-slate-600">
                🔒 Seus dados estão protegidos pela LGPD. Não compartilhamos com terceiros.
              </p>
            </div>
          )}
        </div>

        {/* Footer com Autoridade (Sem CNPJ) */}
        <div className="mt-12 text-center">
          <p className="text-slate-600/60 text-[10px] leading-relaxed max-w-md mx-auto">
            Análise gratuita e sem compromisso. Seus dados são utilizados exclusivamente para simulação de viabilidade técnica sob as normas da LGPD.
          </p>
          <div className="flex items-center justify-center gap-4 mt-4 text-[9px] text-slate-700">
            <span>🔒 Dados Protegidos</span>
            <span>⚡ 100% Gratuito</span>
            <span>📋 Sem Compromisso</span>
          </div>
        </div>
      </div>

      {/* Estilos customizados para animação da barra de progresso */}
      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
      <SiteFooter />
    </div>
  );
}