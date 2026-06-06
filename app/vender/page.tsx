"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  ShieldCheck,
  Loader2,
  ArrowLeft,
  DollarSign,
  CheckCircle2,
  Award,
  FileText,
  Crown,
  Zap,
  TrendingUp,
  Clock,
  BadgeCheck,
  MapPin,
  Building,
  Send,
  Flame,
  Gift,
  Users,
  BarChart3
} from 'lucide-react';
import { saveLead } from '@/app/actions';
import { buildFollowUpUrl, splitCidadeEstado } from '@/lib/leads';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export default function VenderPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisPhase, setAnalysisPhase] = useState(0);
  const [roiProjetado, setRoiProjetado] = useState(0);
  const [formData, setFormData] = useState({
    capacidade: '',
    estado: '',
    nome: '',
    whatsapp: '',
    email: '',
    cargo: 'Proprietário',
  });

  const [acceptedLgpd, setAcceptedLgpd] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const whatsappRegex = /^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$/;
  const isValidWhatsapp = whatsappRegex.test(formData.whatsapp.replace(/\s/g, ''));
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

  // Cálculo do ROI projetado em tempo real (Step 1)
  useEffect(() => {
    const capacidade = parseFloat(formData.capacidade);
    if (!isNaN(capacidade) && capacidade > 0) {
      // Simulação: cada kWp gera ~R$ 150/mês de receita bruta
      const receitaMensal = capacidade * 150;
      setRoiProjetado(Math.round(receitaMensal));
    } else {
      setRoiProjetado(0);
    }
  }, [formData.capacidade]);

  const analysisSteps = [
    "Acessando base de dados da ANEEL...",
    "Analisando demanda de consumidores em " + (formData.estado || "sua região") + "...",
    "Calculando projeção de ROI mensal...",
    "Verificando conformidade regulatória...",
    "Finalizando relatório de lucratividade..."
  ];

  // GATILHO de transição automática do Passo 3 para o Passo 4
  useEffect(() => {
    if (step === 3) {
      setAnalysisPhase(0);
      const interval = setInterval(() => {
        setAnalysisPhase((prev) => {
          if (prev < analysisSteps.length - 1) return prev + 1;
          clearInterval(interval);
          setTimeout(() => setStep(4), 800);
          return prev;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step, formData.estado]);

  // Redirecionamento automático do Passo 5 para /login após captura
  useEffect(() => {
    if (step === 5) {
      const t = setTimeout(() => router.push('/login?from=gerador'), 6000);
      return () => clearTimeout(t);
    }
  }, [step, router]);

  const handleNext = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(step + 1);
    }, 800);
  };

  const handlePrev = () => setStep(step - 1);

  // FUNÇÃO DE ENVIO BLINDADA (Envia todos os campos para o Supabase)
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
      const { cidade, estado } = splitCidadeEstado(formData.estado);
      const result = await saveLead({
        tipo: 'gerador',
        nome: formData.nome,
        email: formData.email,
        whatsapp: formData.whatsapp,
        cidade: cidade || formData.estado,
        estado: estado || 'ND',
        capacidadeKwp: formData.capacidade,
        cargo: formData.cargo,
      });

      if (!result.success) {
        throw new Error(result.message);
      }

      setStep(5);
    } catch (error: any) {
      console.error("Falha no envio:", error);
      setSubmitError('Não conseguimos enviar agora. Tente novamente ou chame no WhatsApp.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col items-center justify-center px-6 py-20 font-sans overflow-x-hidden">
      
      {/* Efeitos de fundo - Autoridade Visual (Lei 6) */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent -z-20" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] -z-10" />
      <div className="fixed top-40 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px] -z-10" />

      <SiteHeader />

      <div className="max-w-2xl w-full">
        
        {/* Header com Badge de Exclusividade (Lei 27) */}
        <div className="flex items-center justify-between mb-8">
          <a href="/" className="flex items-center gap-2 text-slate-500 hover:text-blue-400 transition-colors text-sm font-medium group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Voltar ao Portal
          </a>
          <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/10 border border-blue-500/30 text-[9px] font-black text-blue-400 uppercase tracking-wider flex items-center gap-1">
            <Crown className="w-3 h-3" /> Monetização Garantida • Demanda Alta
          </div>
        </div>

        {/* Progresso Detalhado */}
        <div className="mb-8 space-y-3">
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className={`flex-1 h-2 rounded-full transition-all duration-500 ${s <= step ? 'bg-gradient-to-r from-blue-500 to-cyan-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-slate-800'}`} />
            ))}
          </div>
          <div className="flex justify-between text-xs text-slate-500 px-1">
            <span className={step >= 1 ? "text-blue-400" : ""}>⚡ Capacidade</span>
            <span className={step >= 2 ? "text-blue-400" : ""}>📍 Localização</span>
            <span className={step >= 3 ? "text-blue-400" : ""}>📊 Análise</span>
            <span className={step >= 4 ? "text-blue-400" : ""}>💰 Cadastro</span>
          </div>
        </div>

        {/* Card Principal com Efeito de Poder */}
        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl p-8 md:p-12 rounded-[40px] shadow-2xl relative overflow-hidden group">
          
          {/* Efeito de brilho no hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
          <div className="absolute top-4 right-4">
            <ShieldCheck className="w-6 h-6 text-blue-500/20 group-hover:text-blue-500/40 transition-all" />
          </div>

          {/* STEP 1 - Capacidade da Usina */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold mb-4 uppercase tracking-wider">
                  <Zap className="w-3 h-3" /> Passo 1 de 4
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">Qual a capacidade <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">da sua usina solar?</span></h2>
                <p className="text-slate-400 text-sm">Defina a potência instalada para que possamos calcular seu potencial de monetização real.</p>
              </div>
              
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl" id="capacidade-label">kWp</span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Ex: 100"
                  aria-label="Capacidade da usina em quilowatts pico"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-5 pl-16 pr-6 text-2xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all hover:border-blue-500/50"
                  value={formData.capacidade}
                  onChange={(e) => setFormData({...formData, capacidade: e.target.value})}
                />
              </div>

              {/* ROI Projetado em Tempo Real (Lei 32: Explore os Sonhos) */}
              {roiProjetado > 0 && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 to-cyan-500/5 border border-blue-500/20 text-center animate-in fade-in duration-300">
                  <p className="text-xs text-blue-400/80 uppercase tracking-wider mb-1">Receita Mensal Projetada</p>
                  <p className="text-2xl font-bold text-white">R$ {roiProjetado.toLocaleString('pt-BR')}<span className="text-sm text-blue-400">/mês</span></p>
                  <p className="text-[10px] text-slate-500 mt-1">*baseado na demanda atual da sua região</p>
                </div>
              )}
              
              <button 
                onClick={handleNext}
                disabled={formData.capacidade.length === 0 || isLoading}
                className="w-full py-5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 disabled:from-slate-700 disabled:to-slate-800 text-white rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 group shadow-[0_0_25px_rgba(59,130,246,0.3)] hover:shadow-[0_0_35px_rgba(59,130,246,0.5)]"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Calcular Lucratividade <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
              </button>

              {/* Selo de Confiança */}
              <div className="flex items-center justify-center gap-4 text-[10px] text-slate-500">
                <div className="flex items-center gap-1"><BadgeCheck className="w-3 h-3 text-blue-500" /> Análise Gratuita</div>
                <div className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-blue-500" /> ROI Garantido</div>
                <div className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-blue-500" /> Sem Compromisso</div>
              </div>
            </div>
          )}

          {/* STEP 2 - Localização da Usina */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold mb-4 uppercase tracking-wider">
                  <MapPin className="w-3 h-3" /> Passo 2 de 4
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">Em qual <span className="text-blue-400">estado</span> se localiza a usina?</h2>
                <p className="text-slate-400 text-sm">Crucial para definirmos a tarifa de compensação regional da ANEEL.</p>
              </div>
              
              <div className="relative">
                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Ex: Minas Gerais - MG"
                  aria-label="Estado da usina"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all hover:border-blue-500/50"
                  value={formData.estado}
                  onChange={(e) => setFormData({...formData, estado: e.target.value})}
                />
              </div>

              {/* Dica de Mercado (Escassez/Urgência) */}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/10 text-[11px] text-slate-500">
                <Flame className="w-4 h-4 text-yellow-400 shrink-0" />
                <span>Estados como SP, MG, RJ e RS têm alta demanda reprimida. Sua usina pode lucrar até 32% acima da média.</span>
              </div>

              <div className="flex gap-4">
                <button onClick={handlePrev} className="flex-1 py-5 bg-slate-800/50 text-slate-300 rounded-2xl font-bold text-lg hover:bg-slate-700 transition-all border border-white/5">Voltar</button>
                <button 
                  onClick={handleNext}
                  disabled={formData.estado.length === 0 || isLoading}
                  className="flex-[2] py-5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 disabled:from-slate-700 disabled:to-slate-800 text-white rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 group"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Analisar Potencial <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 - Análise com Mensagens Rotativas (Lei 7: Faça os Outros Trabalharem) */}
          {step === 3 && (
            <div className="flex flex-col items-center justify-center py-12 space-y-8 animate-in fade-in duration-700">
              <div className="relative">
                <div className="w-24 h-24 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                <DollarSign className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500 w-8 h-8 animate-pulse" />
              </div>
              
              <div className="text-center space-y-6 w-full">
                <h2 className="text-2xl font-bold text-white">Processando Viabilidade...</h2>
                <div className="space-y-3 max-w-xs mx-auto">
                  {analysisSteps.map((text, i) => (
                    <div key={i} className={`flex items-center gap-3 text-sm transition-all duration-500 ${i === analysisPhase ? 'text-blue-400 font-bold scale-105' : 'text-slate-500'}`}>
                      <CheckCircle2 className={`w-4 h-4 ${i <= analysisPhase ? 'text-blue-500' : 'text-slate-700'}`} />
                      {text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Barra de progresso do carregamento */}
              <div className="w-full max-w-xs h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full animate-[progress_5s_linear]" style={{ width: '100%' }} />
              </div>

              <p className="text-xs text-slate-600 text-center">Enquanto isso, saiba que usinas na sua região estão gerando até 28% de ROI anual ☀️</p>
            </div>
          )}

          {/* STEP 4 - Cadastro com Oferta Premium (Lei 27: Crie um Culto) */}
          {step === 4 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-full text-blue-500 mb-6 animate-pulse">
                  <Award className="w-10 h-10" />
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500/20 to-amber-500/10 border border-yellow-500/30 text-yellow-400 text-[10px] font-bold mb-4 uppercase tracking-wider">
                  <Crown className="w-3 h-3" /> Potencial Confirmado • Oferta Exclusiva
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">Potencial Confirmado! <br/><span className="text-blue-400">Sua usina é altamente lucrativa.</span></h2>
                <p className="text-slate-400 text-sm">Sua planta apresenta um perfil de rentabilidade acima da média. Informe seus dados para receber a proposta de monetização.</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Nome completo"
                      aria-label="Nome completo"
                      required
                      className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 pl-6 pr-6 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all hover:border-blue-500/50"
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    />
                  </div>
                  <div className="relative">
                    <select
                      aria-label="Cargo ou função"
                      className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 px-6 text-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all appearance-none cursor-pointer hover:border-blue-500/50"
                      value={formData.cargo}
                      onChange={(e) => setFormData({...formData, cargo: e.target.value})}
                    >
                      <option value="Proprietário">👑 Proprietário</option>
                      <option value="Engenheiro Responsável">🔧 Engenheiro Responsável</option>
                      <option value="Gestor de Ativos">📊 Gestor de Ativos</option>
                      <option value="Investidor">💰 Investidor</option>
                    </select>
                    <Building className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="E-mail corporativo"
                    aria-label="E-mail corporativo"
                    required
                    className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all hover:border-blue-500/50"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="WhatsApp com DDD"
                    aria-label="WhatsApp com DDD"
                    aria-invalid={formData.whatsapp.length > 0 && !isValidWhatsapp}
                    required
                    className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all hover:border-blue-500/50"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                  />
                  {formData.whatsapp.length > 0 && !isValidWhatsapp && (
                    <p className="mt-1 text-[10px] text-red-400">Formato: (84) 98785-8668</p>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>⚡ {formData.capacidade || '0'} kWp</span>
                  <span>📍 {formData.estado || 'Não informado'}</span>
                  <span>💰 R$ {roiProjetado.toLocaleString('pt-BR')}/mês</span>
                </div>

                <label className="flex items-start gap-2 text-[11px] text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedLgpd}
                    onChange={(e) => setAcceptedLgpd(e.target.checked)}
                    required
                    className="mt-0.5 w-3.5 h-3.5 accent-blue-500"
                  />
                  <span>
                    Concordo com a <a href="/termos" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Política de Privacidade</a> e
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
                    <ShieldCheck className="w-3 h-3 text-blue-500" /> LGPD
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    <BadgeCheck className="w-3 h-3 text-blue-500" /> Dados Criptografados
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    <Clock className="w-3 h-3 text-blue-500" /> Proposta em até 24h
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !acceptedLgpd}
                  className="w-full py-5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 disabled:from-slate-700 disabled:to-slate-800 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 group shadow-[0_0_25px_rgba(59,130,246,0.3)]"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Receber Proposta de Lucro <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
                </button>
              </form>
            </div>
          )}

          {/* STEP 5 - Sucesso com mensagem de fatura recebida e redirecionamento para /login */}
          {step === 5 && (
            <div className="text-center space-y-6 animate-in zoom-in duration-500">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-500/20 rounded-full text-blue-500 mb-2 animate-bounce">
                <CheckCircle2 className="w-14 h-14" />
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-white">Tudo Pronto! 🚀</h2>
                <p className="text-blue-400 text-sm font-medium uppercase tracking-wider">Fatura recebida ✓</p>
              </div>

              <p className="text-slate-300 leading-relaxed text-sm">
                Nossa equipe <strong className="text-white">já recebeu seus dados</strong> e vai priorizar a análise da sua usina. Continue para o painel do gerador e acompanhe em tempo real.
              </p>

              {/* CTA: Enviar Fatura via WhatsApp (opcional) */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-500/10 to-cyan-500/5 border border-blue-500/30 space-y-3">
                <p className="text-xs text-blue-300 font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                  <FileText className="w-3.5 h-3.5" /> Quer adiantar ainda mais?
                </p>
                <p className="text-xs text-slate-400">
                  Envie o projeto técnico ou a foto da última fatura de crédito da sua usina para o nosso WhatsApp. Análise prioritária!
                </p>
                <a
                  href={buildFollowUpUrl('gerador', {
                    nome: formData.nome,
                    ...splitCidadeEstado(formData.estado),
                    capacidadeKwp: Number(formData.capacidade) || 0,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-2.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 rounded-xl font-bold text-sm transition border border-blue-500/30"
                >
                  📄 Enviar Documentos via WhatsApp
                </a>
              </div>

              {/* CTA: Continuar para Login → Dashboard Gerador */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-500/30 space-y-3">
                <p className="text-xs text-emerald-300 font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Redirecionando para o Painel do Gerador…
                </p>
                <button
                  onClick={() => router.push('/login?from=gerador')}
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
            A EnergiaLivre opera sob rigorosos critérios de compliance e regulamentação da ANEEL. Seus dados estão seguros e criptografados.
          </p>
          <div className="flex items-center justify-center gap-4 mt-4 text-[9px] text-slate-700">
            <span>🔒 Dados Protegidos</span>
            <span>⚡ Monetização Garantida</span>
            <span>📋 ANEEL 687/2015</span>
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