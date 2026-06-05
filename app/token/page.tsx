'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Zap, ShieldCheck, ArrowRight, CheckCircle2, Clock, Flame, Crown,
  Users, TrendingUp, BatteryCharging, Sun, Car, Globe, Wallet,
  Gift, Star, Loader2, Menu, X, ExternalLink, BarChart3, Rocket,
  Lock, Coins, Activity, AlertTriangle, Mail, ChevronDown, ChevronUp
} from 'lucide-react';

type Package = {
  tokens: number;
  basePrice: number;
  discount: number;
  bonus: number;
  popular: boolean;
  description: string;
};

export default function TokenPresalePage() {
  const [selectedPackage, setSelectedPackage] = useState<number | null>(300);
  const [isConnecting, setIsConnecting] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [buyPackage, setBuyPackage] = useState<Package | null>(null);
  const [email, setEmail] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [acceptedLgpd, setAcceptedLgpd] = useState(false);
  const [acceptedRisk, setAcceptedRisk] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [legalExpanded, setLegalExpanded] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValidEmail = emailRegex.test(email);

  const launchDate = new Date(2027, 0, 5, 0, 0, 0);
  const presaleEndDate = new Date(2026, 2, 15, 23, 59, 59);
  const [timeToLaunch, setTimeToLaunch] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [timeToPresaleEnd, setTimeToPresaleEnd] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const KWH_PRICE = 0.95;
  const TOKEN_VALUE = KWH_PRICE * 0.30;

  const packages: Package[] = [
    { tokens: 50, basePrice: TOKEN_VALUE * 50, discount: 0, bonus: 0, popular: false, description: 'Para experimentar a rede' },
    { tokens: 100, basePrice: TOKEN_VALUE * 100, discount: 5, bonus: 5, popular: false, description: 'Acesso inicial ao ecossistema' },
    { tokens: 300, basePrice: TOKEN_VALUE * 300, discount: 10, bonus: 20, popular: true, description: 'Pacote mais equilibrado' },
    { tokens: 500, basePrice: TOKEN_VALUE * 500, discount: 15, bonus: 50, popular: false, description: 'Para embaixadores e早期 adopters' },
    { tokens: 1000, basePrice: TOKEN_VALUE * 1000, discount: 20, bonus: 150, popular: false, description: 'Volume institucional' },
  ];

  const getFinalPrice = (pkg: Package) => pkg.basePrice * (1 - pkg.discount / 100);

  useEffect(() => {
    const updateTimers = () => {
      const now = new Date();
      const launchDiff = launchDate.getTime() - now.getTime();
      setTimeToLaunch({
        days: Math.max(0, Math.floor(launchDiff / 86400000)),
        hours: Math.max(0, Math.floor((launchDiff % 86400000) / 3600000)),
        minutes: Math.max(0, Math.floor((launchDiff % 3600000) / 60000)),
        seconds: Math.max(0, Math.floor((launchDiff % 60000) / 1000)),
      });
      const presaleDiff = presaleEndDate.getTime() - now.getTime();
      setTimeToPresaleEnd({
        days: Math.max(0, Math.floor(presaleDiff / 86400000)),
        hours: Math.max(0, Math.floor((presaleDiff % 86400000) / 3600000)),
        minutes: Math.max(0, Math.floor((presaleDiff % 3600000) / 60000)),
        seconds: Math.max(0, Math.floor((presaleDiff % 60000) / 1000)),
      });
    };
    updateTimers();
    intervalRef.current = setInterval(updateTimers, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const totalRaised = 1240000;
  const totalGoal = 5000000;
  const percentageRaised = (totalRaised / totalGoal) * 100;

  const openConnectModal = () => {
    setSubmitMessage(null);
    setWalletAddress('');
    setWalletModalOpen(true);
  };

  const openBuyModal = (pkg: Package) => {
    setSubmitMessage(null);
    setBuyPackage(pkg);
    setBuyModalOpen(true);
  };

  const closeAllModals = () => {
    setWalletModalOpen(false);
    setBuyModalOpen(false);
    setBuyPackage(null);
    setSubmitMessage(null);
  };

  const handleConnectWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitMessage(null);
    if (!isValidEmail) {
      setSubmitMessage({ type: 'err', text: 'E-mail inválido.' });
      return;
    }
    if (!acceptedLgpd) {
      setSubmitMessage({ type: 'err', text: 'É necessário aceitar os termos de privacidade para continuar.' });
      return;
    }
    if (!walletAddress.startsWith('0x') || walletAddress.length !== 42) {
      setSubmitMessage({ type: 'err', text: 'Endereço de carteira inválido. Use o formato 0x… (42 caracteres).' });
      return;
    }
    setIsConnecting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsConnecting(false);
    setSubmitMessage({ type: 'ok', text: `Carteira ${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)} registrada. Em breve você recebe o link de listagem.` });
  };

  const handleBuyTokens = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyPackage) return;
    setSubmitMessage(null);
    if (!isValidEmail) {
      setSubmitMessage({ type: 'err', text: 'E-mail inválido.' });
      return;
    }
    if (!acceptedLgpd) {
      setSubmitMessage({ type: 'err', text: 'É necessário aceitar a Política de Privacidade.' });
      return;
    }
    if (!acceptedRisk) {
      setSubmitMessage({ type: 'err', text: 'É necessário confirmar ciência dos riscos do token de utilidade.' });
      return;
    }
    setIsConnecting(true);
    await new Promise((r) => setTimeout(r, 1200));
    setIsConnecting(false);
    setSubmitMessage({
      type: 'ok',
      text: `Reserva registrada para ${buyPackage.tokens} créditos. Enviamos as instruções de pagamento (PIX ou cripto) para ${email}.`,
    });
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden">

      {/* Background Effects */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/5 via-blue-500/5 to-transparent -z-20" />
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] -z-10" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] -z-10" />

      {/* Banner Legal Permanente (CVM + LGPD) */}
      <div className="fixed top-0 left-0 right-0 z-[60] bg-amber-500/10 border-b border-amber-500/30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-center gap-2 text-[11px] text-amber-200">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            <strong className="font-bold">$KWATT é token de utilidade</strong> — NÃO é valor mobiliário, não garante retorno financeiro e não é investimento.
            Sujeito à regulação da Lei 14.478/2022 (Brasil).
          </span>
        </div>
      </div>

      {/* Navbar */}
      <nav className="fixed top-7 left-0 right-0 z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-white">Energia<span className="text-cyan-400">Livre</span></span>
            <span className="ml-2 px-2 py-0.5 bg-yellow-500/20 border border-yellow-500/30 rounded-full text-[9px] font-black text-yellow-400">$KWATT</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#about" className="text-slate-400 hover:text-white transition text-sm">Sobre</a>
            <a href="#roadmap" className="text-slate-400 hover:text-white transition text-sm">Roadmap</a>
            <a href="#whitepaper" className="text-slate-400 hover:text-white transition text-sm">Whitepaper</a>
            <button
              onClick={openConnectModal}
              className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-bold text-white text-sm hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition flex items-center gap-2"
            >
              <Wallet className="w-4 h-4" />
              Registrar Interesse
            </button>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileMenuOpen}
            className="md:hidden p-2 text-slate-300"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-[#020617]/95 backdrop-blur-xl border-b border-white/10 p-4 flex flex-col gap-4">
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-white transition py-2">Sobre</a>
            <a href="#roadmap" onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-white transition py-2">Roadmap</a>
            <a href="#whitepaper" onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-white transition py-2">Whitepaper</a>
            <button onClick={() => { setMobileMenuOpen(false); openConnectModal(); }} className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-bold text-white">
              Registrar Interesse
            </button>
          </div>
        )}
      </nav>

      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">

          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-black mb-6">
              <Flame className="w-3 h-3" /> RESERVA ANTECIPADA • EDIÇÃO FUNDADOR
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Créditos de Energia <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">do Futuro</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
              Cada crédito <span className="text-cyan-400 font-bold">$KWATT</span> equivale a 30% do valor de 1 kWh —<br />
              um benefício de uso na plataforma EnergiaLivre, não um ativo de investimento.
            </p>

            {/* Timers */}
            <div className="flex flex-col md:flex-row justify-center gap-8 mb-12">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Liberação dos Créditos</p>
                <div className="flex gap-4 justify-center" role="timer" aria-live="polite">
                  <div><span className="text-3xl font-bold text-white">{timeToLaunch.days}</span><span className="text-slate-500 text-sm ml-1">d</span></div>
                  <div><span className="text-3xl font-bold text-white">{timeToLaunch.hours}</span><span className="text-slate-500 text-sm ml-1">h</span></div>
                  <div><span className="text-3xl font-bold text-white">{timeToLaunch.minutes}</span><span className="text-slate-500 text-sm ml-1">m</span></div>
                  <div><span className="text-3xl font-bold text-white">{timeToLaunch.seconds}</span><span className="text-slate-500 text-sm ml-1">s</span></div>
                </div>
                <p className="text-[10px] text-slate-600 mt-2">5 de Janeiro de 2027</p>
              </div>

              <div className="bg-gradient-to-r from-yellow-500/10 to-amber-500/5 border border-yellow-500/30 rounded-2xl p-4 backdrop-blur-sm">
                <p className="text-xs text-yellow-400 uppercase tracking-wider mb-2 flex items-center justify-center gap-1"><Clock className="w-3 h-3" /> Fim das Reservas</p>
                <div className="flex gap-4 justify-center" role="timer" aria-live="polite">
                  <div><span className="text-3xl font-bold text-yellow-400">{timeToPresaleEnd.days}</span><span className="text-slate-500 text-sm ml-1">d</span></div>
                  <div><span className="text-3xl font-bold text-yellow-400">{timeToPresaleEnd.hours}</span><span className="text-slate-500 text-sm ml-1">h</span></div>
                  <div><span className="text-3xl font-bold text-yellow-400">{timeToPresaleEnd.minutes}</span><span className="text-slate-500 text-sm ml-1">m</span></div>
                  <div><span className="text-3xl font-bold text-yellow-400">{timeToPresaleEnd.seconds}</span><span className="text-slate-500 text-sm ml-1">s</span></div>
                </div>
                <p className="text-[10px] text-slate-600 mt-2">15 de Março de 2026</p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 rounded-2xl border border-white/10">
              <Coins className="w-5 h-5 text-cyan-400" />
              <span className="text-slate-400">1 $KWATT =</span>
              <span className="text-2xl font-bold text-cyan-400">R$ {TOKEN_VALUE.toFixed(3)}</span>
              <span className="text-xs text-slate-500">(30% do kWh de referência: R$ {KWH_PRICE.toFixed(2)})</span>
            </div>
          </div>

          {/* Prova Social - Agora com disclaimer */}
          <div className="mb-8 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Demonstrativo de adoção inicial (mockup — números serão auditados)</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
              <Users className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">+2.847</p>
              <p className="text-xs text-slate-500">Pré-registros</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
              <TrendingUp className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">R$ 1.24M</p>
              <p className="text-xs text-slate-500">Reservas confirmadas</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
              <BatteryCharging className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">+12.8M</p>
              <p className="text-xs text-slate-500">kWh reservados</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
              <Car className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">+500</p>
              <p className="text-xs text-slate-500">Vagas para EV</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="max-w-2xl mx-auto mb-20">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400">Meta de Adesão Inicial</span>
              <span className="text-cyan-400">R$ {totalRaised.toLocaleString('pt-BR')} / R$ {totalGoal.toLocaleString('pt-BR')}</span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500" style={{ width: `${percentageRaised}%` }} />
            </div>
            <p className="text-xs text-slate-500 text-center mt-2">Cap sujeito a ajustes conforme demanda real</p>
          </div>

          {/* Cards de Compra */}
          <div className="mb-20">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Escolha seu Pacote <span className="text-cyan-400">$KWATT</span></h2>
              <p className="text-slate-400 max-w-xl mx-auto">Quanto maior o pacote, maior o desconto e bônus. Créditos válidos por 24 meses após liberação.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {packages.map((pkg) => {
                const finalPrice = getFinalPrice(pkg);
                const isSelected = selectedPackage === pkg.tokens;
                return (
                  <div
                    key={pkg.tokens}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isSelected}
                    aria-label={`Pacote ${pkg.tokens} créditos por R$ ${finalPrice.toFixed(2)}`}
                    className={`relative bg-gradient-to-br from-white/5 to-white/[0.02] border rounded-2xl p-5 transition-all hover:scale-105 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-cyan-500/50 ${
                      isSelected
                        ? 'border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                        : 'border-white/10 hover:border-cyan-500/50'
                    }`}
                    onClick={() => setSelectedPackage(pkg.tokens)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedPackage(pkg.tokens); } }}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full text-[9px] font-black text-slate-900 whitespace-nowrap">
                        <Star className="w-3 h-3 inline mr-1 fill-current" /> MAIS RESERVADO
                      </div>
                    )}

                    <div className="text-center mb-4">
                      <p className="text-2xl font-bold text-white">{pkg.tokens}</p>
                      <p className="text-xs text-slate-500">$KWATT créditos</p>
                      <p className="text-[10px] text-slate-600 mt-1">{pkg.description}</p>
                    </div>

                    <div className="text-center mb-4">
                      <p className="text-2xl font-bold text-cyan-400">R$ {finalPrice.toFixed(2)}</p>
                      {pkg.discount > 0 && (
                        <p className="text-xs text-slate-500 line-through">R$ {pkg.basePrice.toFixed(2)}</p>
                      )}
                    </div>

                    {pkg.discount > 0 && (
                      <div className="text-center mb-3">
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold">
                          {pkg.discount}% OFF
                        </span>
                      </div>
                    )}

                    {pkg.bonus > 0 && (
                      <div className="text-center mb-4">
                        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full text-[10px] font-bold flex items-center justify-center gap-1">
                          <Gift className="w-3 h-3" /> +{pkg.bonus} bônus
                        </span>
                      </div>
                    )}

                    <button
                      onClick={(e) => { e.stopPropagation(); openBuyModal(pkg); }}
                      className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-bold text-white text-sm hover:opacity-90 transition"
                    >
                      Reservar
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="text-center mt-6">
              <p className="text-[10px] text-slate-600">*Créditos resgatáveis na plataforma EnergiaLivre a partir de 5 de Janeiro de 2027. Sem garantia de valorização.</p>
            </div>
          </div>

          {/* POR QUE ADOTAR? (removido "investir") */}
          <div className="mb-20" id="about">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Por que <span className="text-cyan-400">$KWATT</span>?</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">3 tendências que tornam os créditos da EnergiaLivre relevantes para usuários da plataforma</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-cyan-500/30 transition">
                <Sun className="w-12 h-12 text-cyan-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Expansão Solar no Brasil</h3>
                <p className="text-slate-400 text-sm mb-4">Brasil atingiu 28 GW de capacidade solar instalada em 2024. Solar é a 2ª maior matriz elétrica do país e segue em crescimento.</p>
                <div className="flex items-center gap-2 text-[11px] text-cyan-400">
                  <TrendingUp className="w-3 h-3" /> Crescimento contínuo da matriz
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-cyan-500/30 transition">
                <Car className="w-12 h-12 text-cyan-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Mobilidade Elétrica</h3>
                <p className="text-slate-400 text-sm mb-4">Frota de EVs em forte crescimento. Cada veículo elétrico consome ~3.500 kWh/ano — 1.050 $KWATT/ano em economia potencial via plataforma.</p>
                <div className="flex items-center gap-2 text-[11px] text-cyan-400">
                  <BatteryCharging className="w-3 h-3" /> Demanda crescente por carga
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-cyan-500/30 transition">
                <Globe className="w-12 h-12 text-cyan-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Custo da Energia Solar</h3>
                <p className="text-slate-400 text-sm mb-4">O custo do kWh solar caiu ~89% na última década. Créditos $KWATT dão acesso a essa economia dentro da plataforma.</p>
                <div className="flex items-center gap-2 text-[11px] text-cyan-400">
                  <Activity className="w-3 h-3" /> Benefício de uso, não promessa de retorno
                </div>
              </div>
            </div>
          </div>

          {/* COMPARATIVO */}
          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-8 mb-20">
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Reservar agora vs entrar depois</h2>
              <p className="text-slate-400">Quem reserva primeiro garante desconto fundador e bônus</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white/5 rounded-xl p-6 text-center">
                <p className="text-cyan-400 font-bold mb-2">✅ RESERVANDO AGORA</p>
                <p className="text-3xl font-bold text-white mb-2">Até 20% OFF</p>
                <p className="text-sm text-slate-400 mb-4">Em pacotes acima de 100 créditos</p>
                <p className="text-sm text-white">+ Bônus de até 150 créditos</p>
                <p className="text-sm text-white">Etiqueta de Fundador</p>
              </div>
              <div className="bg-white/5 rounded-xl p-6 text-center opacity-60">
                <p className="text-slate-400 font-bold mb-2">⏰ DEPOIS DO LANÇAMENTO</p>
                <p className="text-3xl font-bold text-white mb-2">Preço cheio</p>
                <p className="text-sm text-slate-400 mb-4">Sem desconto fundador</p>
                <p className="text-sm text-slate-400">Sem bônus</p>
                <p className="text-sm text-slate-400">Disponibilidade imediata</p>
              </div>
            </div>
          </div>

          {/* COMO FUNCIONA */}
          <div className="mb-20">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Como funciona?</h2>
              <p className="text-slate-400">4 passos para reservar seus $KWATT</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { n: 1, title: 'Registre-se', desc: 'E-mail e aceite os termos de uso' },
                { n: 2, title: 'Escolha o Pacote', desc: 'De 50 a 1.000+ créditos' },
                { n: 3, title: 'Pague com Pix ou Cripto', desc: 'Instruções enviadas por e-mail' },
                { n: 4, title: 'Receba em Jan/27', desc: 'Créditos válidos por 24 meses' },
              ].map((s) => (
                <div key={s.n} className="text-center">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-3 text-cyan-400 font-bold text-xl">{s.n}</div>
                  <p className="font-bold text-white mb-1">{s.title}</p>
                  <p className="text-xs text-slate-500">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ONDE SERÁ USADO (substitui "Onde Será Vendido") */}
          <div className="mb-20">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Onde o <span className="text-cyan-400">$KWATT</span> é aceito?</h2>
              <p className="text-slate-400">Créditos resgatáveis dentro do ecossistema EnergiaLivre</p>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              {[
                'Plataforma EnergiaLivre (consumidores)',
                'Marketplace de créditos de carbono',
                'Programa de embaixadores (comissão)',
                'Recarga de VE na rede parceira',
                'Desconto em faturas de energia',
              ].map((use, idx) => (
                <div key={idx} className="px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-medium">
                  {use}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-600 text-center mt-6">* Lista de用例 em construção. Exchanges de cripto não estão no roadmap oficial do projeto.</p>
          </div>

          {/* ROADMAP */}
          <div className="mb-20" id="roadmap">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Roadmap <span className="text-cyan-400">$KWATT</span></h2>
              <p className="text-slate-400">Marcos sujeitos a alterações conforme evolução do projeto</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { date: 'Mar 2026', title: 'Fim das Reservas', desc: 'Encerra pré-registro fundador' },
                { date: 'Jul 2026', title: 'Integração Usinas', desc: 'Tokenização de usinas solares parceiras' },
                { date: 'Dez 2026', title: 'Auditoria & Whitepaper', desc: 'Publicação do whitepaper técnico e auditoria' },
                { date: 'Jan 2027', title: 'Liberação dos Créditos', desc: 'Créditos resgatáveis na plataforma' },
              ].map((item, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4 relative">
                  <div className="text-cyan-400 text-xs font-bold mb-1">{item.date}</div>
                  <div className="font-bold text-white text-sm mb-1">{item.title}</div>
                  <div className="text-xs text-slate-500">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* AVISO LEGAL EXPANSÍVEL (CVM + LGPD) */}
          <div className="mb-20 bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <button
              onClick={() => setLegalExpanded(!legalExpanded)}
              className="w-full flex items-center justify-between text-left"
              aria-expanded={legalExpanded}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-white text-sm">Aviso Legal Completo (CVM / Lei 14.478/2022)</span>
              </div>
              {legalExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {legalExpanded && (
              <div className="mt-4 text-[12px] text-slate-400 space-y-3 leading-relaxed">
                <p>
                  <strong className="text-white">1. Natureza do $KWATT.</strong> O $KWATT é um <em>token de utilidade</em> (utility token) emitido pela EnergiaLivre, que dá direito a desconto em tarifas e acesso a serviços dentro da plataforma. <strong>Não é um valor mobiliário</strong>, não representa participação societária, não confere direito a dividendos, lucros ou qualquer forma de retorno financeiro.
                </p>
                <p>
                  <strong className="text-white">2. Não é investimento.</strong> A reserva de $KWATT NÃO constitui oferta pública de valores mobiliários, NÃO é recomendada pela CVM e NÃO gera expectativa de rentabilidade. O valor de revenda (se houver) depende exclusivamente de mercado secundário, que NÃO é garantido pela emissora.
                </p>
                <p>
                  <strong className="text-white">3. Riscos.</strong> Tokens de utilidade estão sujeitos a: (i) volatilidade de mercado, (ii) risco regulatório (Lei 14.478/2022, normas do Banco Central do Brasil e da CVM), (iii) risco de execução do projeto, (iv) possibilidade de perda integral do valor pago.
                </p>
                <p>
                  <strong className="text-white">4. Reembolso.</strong> Caso o projeto não atinja os marcos mínimos até Dez/2026, os valores pagos na reserva serão reembolsados integralmente, descontadas apenas taxas de rede/PIX efetivamente incorridas.
                </p>
                <p>
                  <strong className="text-white">5. LGPD.</strong> Os dados fornecidos serão tratados conforme nossa <Link href="/termos" className="text-cyan-400 hover:underline">Política de Privacidade</Link>, com base no art. 7º, V da Lei 13.709/2018 (execução de contrato).
                </p>
                <p>
                  <strong className="text-white">6. Documentos.</strong> Leia o <a href="#whitepaper" className="text-cyan-400 hover:underline">Whitepaper</a> e os <Link href="/termos" className="text-cyan-400 hover:underline">Termos de Uso</Link> antes de reservar.
                </p>
              </div>
            )}
          </div>

          {/* CTA FINAL */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Garanta seu acesso fundador à economia solar</h2>
              <p className="text-slate-400 mb-6 max-w-xl mx-auto">Pré-registros com até 20% de desconto e bônus exclusivos. Sem garantia de valorização.</p>
              <button
                onClick={() => selectedPackage && openBuyModal(packages.find((p) => p.tokens === selectedPackage) || packages[2])}
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl font-bold text-white text-lg hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition flex items-center gap-2 mx-auto"
              >
                <Rocket className="w-5 h-5" />
                Reservar pacote {selectedPackage || 300}
              </button>
              <p className="text-[10px] text-slate-600 mt-4">*Créditos resgatáveis na plataforma EnergiaLivre a partir de 5 de Janeiro de 2027. Token de utilidade — não é investimento.</p>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 mt-10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex flex-wrap justify-center gap-6 mb-4 text-xs text-slate-500">
            <a href="#whitepaper" className="hover:text-cyan-400 transition">Whitepaper</a>
            <Link href="/termos" className="hover:text-cyan-400 transition">Termos de Uso</Link>
            <Link href="/termos" className="hover:text-cyan-400 transition">Política de Privacidade</Link>
            <a href="https://wa.me/5584987858668" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition">Contato</a>
          </div>
          <p className="text-[10px] text-slate-600">© 2026 EnergiaLivre — Tokenizando o futuro da energia solar no Brasil</p>
          <p className="text-[9px] text-slate-700 mt-2 max-w-2xl mx-auto">
            Disclaimer: $KWATT é token de utilidade, NÃO configurando valor mobiliário nem investimento financeiro, conforme Lei 14.478/2022 e regulamentação da CVM aplicável. Reservas sujeitas a risco de perda integral.
          </p>
        </div>
      </footer>

      {/* MODAL: Registrar Carteira */}
      {walletModalOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="wallet-modal-title"
          onClick={closeAllModals}
        >
          <div
            className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-cyan-400" />
                <h2 id="wallet-modal-title" className="text-xl font-bold text-white">Registrar Interesse</h2>
              </div>
              <button onClick={closeAllModals} aria-label="Fechar" className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-400 mb-4">
              Receba por e-mail o whitepaper e o link para reservar créditos $KWATT quando o portal abrir.
            </p>

            <form onSubmit={handleConnectWallet} className="space-y-3">
              <div>
                <label htmlFor="wallet-email" className="text-xs text-slate-500">E-mail</label>
                <input
                  id="wallet-email"
                  type="email"
                  placeholder="voce@empresa.com.br"
                  aria-label="E-mail para receber novidades"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 outline-none"
                />
              </div>
              <div>
                <label htmlFor="wallet-addr" className="text-xs text-slate-500">Carteira (opcional, formato 0x…)</label>
                <input
                  id="wallet-addr"
                  type="text"
                  placeholder="0x…"
                  aria-label="Endereço de carteira Ethereum"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 outline-none font-mono text-sm"
                />
              </div>

              <label className="flex items-start gap-2 text-[11px] text-slate-400 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={acceptedLgpd}
                  onChange={(e) => setAcceptedLgpd(e.target.checked)}
                  required
                  className="mt-0.5 w-3.5 h-3.5 accent-cyan-500"
                />
                <span>
                  Concordo com a <Link href="/termos" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Política de Privacidade</Link>.
                </span>
              </label>

              {submitMessage && (
                <div
                  className={`p-3 rounded-xl text-[12px] ${submitMessage.type === 'ok' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' : 'bg-red-500/10 border border-red-500/30 text-red-300'}`}
                  role="alert"
                >
                  {submitMessage.text}
                </div>
              )}

              <button
                type="submit"
                disabled={isConnecting}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                Registrar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Reservar Pacote */}
      {buyModalOpen && buyPackage && (
        <div
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="buy-modal-title"
          onClick={closeAllModals}
        >
          <div
            className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-cyan-400" />
                <h2 id="buy-modal-title" className="text-xl font-bold text-white">Reservar {buyPackage.tokens} créditos</h2>
              </div>
              <button onClick={closeAllModals} aria-label="Fechar" className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-white/5 rounded-xl p-4 mb-4 text-center">
              <p className="text-2xl font-bold text-cyan-400">R$ {getFinalPrice(buyPackage).toFixed(2)}</p>
              {buyPackage.discount > 0 && (
                <p className="text-xs text-slate-500 line-through">R$ {buyPackage.basePrice.toFixed(2)}</p>
              )}
              <p className="text-[10px] text-slate-500 mt-1">{buyPackage.tokens} créditos + {buyPackage.bonus} bônus</p>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200 mb-4">
              <p className="font-bold mb-1">⚠️ Token de utilidade, não investimento.</p>
              <p>Créditos resgatáveis na plataforma a partir de Jan/2027, válidos por 24 meses. Sem garantia de valorização ou revenda.</p>
            </div>

            <form onSubmit={handleBuyTokens} className="space-y-3">
              <div>
                <label htmlFor="buy-email" className="text-xs text-slate-500">E-mail (instruções de pagamento)</label>
                <input
                  id="buy-email"
                  type="email"
                  placeholder="voce@empresa.com.br"
                  aria-label="E-mail para receber instruções de pagamento"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 outline-none"
                />
              </div>

              <label className="flex items-start gap-2 text-[11px] text-slate-400 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={acceptedLgpd}
                  onChange={(e) => setAcceptedLgpd(e.target.checked)}
                  required
                  className="mt-0.5 w-3.5 h-3.5 accent-cyan-500"
                />
                <span>
                  Li e aceito a <Link href="/termos" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Política de Privacidade</Link>.
                </span>
              </label>

              <label className="flex items-start gap-2 text-[11px] text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedRisk}
                  onChange={(e) => setAcceptedRisk(e.target.checked)}
                  required
                  className="mt-0.5 w-3.5 h-3.5 accent-cyan-500"
                />
                <span>
                  Estou ciente de que $KWATT é <strong>token de utilidade</strong>, NÃO investimento, e estou sujeito aos riscos descritos no aviso legal.
                </span>
              </label>

              {submitMessage && (
                <div
                  className={`p-3 rounded-xl text-[12px] ${submitMessage.type === 'ok' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' : 'bg-red-500/10 border border-red-500/30 text-red-300'}`}
                  role="alert"
                >
                  {submitMessage.text}
                </div>
              )}

              <button
                type="submit"
                disabled={isConnecting}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
                Confirmar Reserva
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
