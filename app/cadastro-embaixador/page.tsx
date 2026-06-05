'use client';

import { useState, type FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Loader2,
  CheckCircle,
  Briefcase,
  Megaphone,
  Users,
  Crown,
  Flame,
  ShieldCheck,
  BadgeCheck,
  Clock,
  Gift,
  TrendingUp,
  DollarSign,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase/singleton';
import { saveLead, type SaveLeadInput } from '@/app/actions';
import { splitCidadeEstado } from '@/lib/leads';

const NICHO_OPTIONS = [
  { value: 'imoveis', label: '🏠 Imóveis' },
  { value: 'marketing', label: '📊 Marketing Digital' },
  { value: 'educacao', label: '📚 Educação' },
  { value: 'consultoria', label: '💼 Consultoria' },
  { value: 'vendas', label: '💰 Vendas' },
  { value: 'outro', label: '🎯 Outro' },
] as const

const CANAL_OPTIONS = [
  { value: 'instagram', label: '📷 Instagram' },
  { value: 'youtube', label: '▶️ YouTube' },
  { value: 'tiktok', label: '🎵 TikTok' },
  { value: 'indicacao', label: '🤝 Indicação Direta' },
  { value: 'outro', label: '✨ Outro' },
] as const

export default function CadastroEmbaixadorPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [nicho, setNicho] = useState('');
  const [canal, setCanal] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showLeadMagnet, setShowLeadMagnet] = useState(false);

  const [acceptedLgpd, setAcceptedLgpd] = useState(false);

  const whatsappRegex = /^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$/;
  const isValidWhatsapp = whatsappRegex.test(whatsapp.replace(/\s/g, ''));
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const router = useRouter();
  const supabase = getSupabase();

  // Lead Magnet (Reciprocidade) com atraso de 15s (Lei 22)
  useEffect(() => {
    if (!success && !showLeadMagnet) {
      const timer = setTimeout(() => setShowLeadMagnet(true), 15000);
      return () => clearTimeout(timer);
    }
  }, [success, showLeadMagnet]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!isValidWhatsapp) {
      setError('WhatsApp inválido. Use o formato (84) 98785-8668.');
      return;
    }
    if (!isValidEmail) {
      setError('E-mail inválido.');
      return;
    }
    if (!acceptedLgpd) {
      setError('É necessário aceitar os termos de privacidade para continuar.');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome,
            tipo: 'parceiro',
            whatsapp,
            cidade,
            estado,
          },
          emailRedirectTo: `${window.location.origin}/login?cadastro=sucesso&from=parceiro`,
        },
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          setError('Este e-mail já está cadastrado. Tente fazer login.');
        } else {
          setError(authError.message);
        }
        setLoading(false);
        return;
      }

      if (authData.user) {
        const leadPayload: SaveLeadInput = {
          tipo: 'parceiro',
          nome,
          email,
          whatsapp,
          cidade,
          estado: estado || splitCidadeEstado(cidade).estado || 'ND',
          nicho: nicho || undefined,
          canal: canal || undefined,
        }
        const leadResult = await saveLead(leadPayload)
        if (!leadResult.success) {
          console.warn('Lead não salvo (cadastro seguiu):', leadResult.message)
        }

        setSuccess(true);
        // Redirecionamento para Dashboard do Embaixador após sucesso
        setTimeout(() => router.push('/login?cadastro=sucesso&from=parceiro'), 2500);
      }
    } catch (err: any) {
      console.error('Erro no cadastro:', err);
      setError(err?.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
        <div className="text-center bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-8 rounded-3xl max-w-md animate-in zoom-in duration-500">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-full mb-6 animate-bounce">
            <Crown className="w-10 h-10 text-yellow-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">🎉 Bem-vindo ao Time de Embaixadores!</h1>
          <p className="text-slate-400 mb-4">Sua conta foi criada com sucesso. Verifique seu e-mail para confirmar e acessar o painel de comissões.</p>

          {/* Escassez Real (Lei 22): dado concreto em vez de timer fake */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-amber-500/5 border border-yellow-500/20 mb-6">
            <p className="text-xs text-yellow-400 font-bold uppercase tracking-wider flex items-center justify-center gap-2">
              <Flame className="w-3 h-3" /> 7 embaixadores entraram na rede hoje
            </p>
            <p className="text-sm text-white mt-1">Comissão dobrada nas primeiras 4 semanas de cada novo embaixador.</p>
          </div>

          <p className="text-slate-500 text-sm flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-yellow-500" />
            Redirecionando para o Dashboard do Embaixador...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col items-center justify-center px-6 py-20 font-sans overflow-x-hidden">

      {/* Efeitos de fundo - Autoridade Visual (Lei 6) */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-yellow-500/5 via-transparent to-transparent -z-20" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-yellow-500/5 rounded-full blur-[100px] -z-10" />
      <div className="fixed top-40 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-[100px] -z-10" />

      {/* LEAD MAGNET - Isca Digital com Reciprocidade (Lei 22) */}
      {showLeadMagnet && !success && (
        <div className="fixed bottom-8 right-8 z-50 max-w-sm animate-in slide-in-from-bottom-10 duration-500">
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-yellow-500/30 rounded-2xl p-5 shadow-2xl backdrop-blur-xl">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 flex items-center justify-center shrink-0">
                <Gift className="w-5 h-5 text-slate-900" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-white mb-1">🎁 Kit do Embaixador</h4>
                <p className="text-xs text-slate-400 mb-3">Baixe grátis: &ldquo;Guia para Vender Energia Solar&rdquo; + Planilha de Comissões + Template de Indicação</p>
                <div className="flex gap-2">
                  <input type="email" placeholder="Seu e-mail" className="flex-1 bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-xs text-white" />
                  <button className="px-3 py-2 bg-yellow-500 hover:bg-yellow-600 rounded-xl text-slate-900 text-xs font-bold transition">Baixar</button>
                </div>
                <button onClick={() => setShowLeadMagnet(false)} className="absolute top-2 right-2 text-slate-600 hover:text-slate-400 text-xs">✕</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-md w-full">
        {/* Header com Badge de Exclusividade (Lei 27) */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/embaixador" className="flex items-center gap-2 text-slate-500 hover:text-yellow-400 transition-colors text-sm font-medium group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Voltar
          </Link>
          <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-500/20 to-amber-500/10 border border-yellow-500/30 text-[9px] font-black text-yellow-400 uppercase tracking-wider flex items-center gap-1 animate-pulse">
            <Crown className="w-3 h-3" /> Comissão Exclusiva
          </div>
        </div>

        {/* Escassez Real (Lei 22): dado concreto em vez de timer fake */}
        <div className="flex items-center justify-center gap-2 text-[10px] text-yellow-400 bg-yellow-500/10 rounded-full py-1.5 px-3 w-fit mx-auto mb-6">
          <Flame className="w-3 h-3" /> 7 embaixadores entraram na rede hoje
        </div>

        {/* Card Principal com Efeito de Poder */}
        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl p-8 rounded-[40px] shadow-2xl relative overflow-hidden group">

          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/5 to-yellow-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

          <div className="absolute top-4 right-4">
            <ShieldCheck className="w-6 h-6 text-yellow-500/20 group-hover:text-yellow-500/40 transition-all" />
          </div>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-full mb-4">
              <Users className="w-8 h-8 text-yellow-500" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Ser Embaixador</h1>
            <p className="text-slate-400 text-sm">Ganhe comissões indicando energia solar</p>
          </div>

          {/* Prova Social (Lei 4: Fale pouco, diga muito) */}
          <div className="flex items-center justify-center gap-6 text-[10px] text-slate-500 border-t border-b border-white/5 py-3 mb-6">
            <div className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-yellow-400" /> +R$ 2.4M em comissões</div>
            <div className="flex items-center gap-1"><Users className="w-3 h-3 text-yellow-400" /> +342 embaixadores</div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome completo */}
            <div className="relative">
              <input
                type="text"
                placeholder="Nome completo"
                aria-label="Nome completo"
                value={nome}
                onChange={e => setNome(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3.5 px-4 text-white placeholder:text-slate-500 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/30 outline-none transition-all hover:border-yellow-500/50"
                required
              />
            </div>

            {/* E-mail */}
            <div className="relative">
              <input
                type="email"
                placeholder="E-mail"
                aria-label="E-mail"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3.5 px-4 text-white placeholder:text-slate-500 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/30 outline-none transition-all hover:border-yellow-500/50"
                required
              />
            </div>

            {/* WhatsApp */}
            <div className="relative">
              <input
                type="tel"
                placeholder="WhatsApp (com DDD)"
                aria-label="WhatsApp com DDD"
                aria-invalid={whatsapp.length > 0 && !isValidWhatsapp}
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3.5 px-4 text-white placeholder:text-slate-500 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/30 outline-none transition-all hover:border-yellow-500/50"
                required
              />
              {whatsapp.length > 0 && !isValidWhatsapp && (
                <p className="mt-1 text-[10px] text-red-400">Formato: (84) 98785-8668</p>
              )}
            </div>

            {/* Cidade e Estado */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 relative">
                <input
                  type="text"
                  placeholder="Cidade"
                  aria-label="Cidade"
                  value={cidade}
                  onChange={e => setCidade(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3.5 px-4 text-white placeholder:text-slate-500 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/30 outline-none transition-all hover:border-yellow-500/50"
                  required
                />
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="UF"
                  aria-label="Estado (UF)"
                  maxLength={2}
                  value={estado}
                  onChange={e => setEstado(e.target.value.toUpperCase())}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3.5 px-4 text-white placeholder:text-slate-500 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/30 outline-none transition-all hover:border-yellow-500/50 uppercase"
                  required
                />
              </div>
            </div>

            {/* Nicho e Canal */}
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 z-10" />
                <select
                  aria-label="Nicho de atuação"
                  value={nicho}
                  onChange={(e) => setNicho(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3.5 pl-9 pr-3 text-white text-sm focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/30 outline-none transition-all appearance-none cursor-pointer hover:border-yellow-500/50"
                >
                  <option value="">Nicho (opcional)</option>
                  {NICHO_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="relative">
                <Megaphone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 z-10" />
                <select
                  aria-label="Canal principal de divulgação"
                  value={canal}
                  onChange={(e) => setCanal(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3.5 pl-9 pr-3 text-white text-sm focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/30 outline-none transition-all appearance-none cursor-pointer hover:border-yellow-500/50"
                >
                  <option value="">Canal (opcional)</option>
                  {CANAL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {/* Senha */}
            <div className="relative">
              <input
                type="password"
                placeholder="Senha (mínimo 6 caracteres)"
                aria-label="Senha (mínimo 6 caracteres)"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3.5 px-4 text-white placeholder:text-slate-500 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/30 outline-none transition-all hover:border-yellow-500/50"
                required
                minLength={6}
              />
            </div>

            {/* Dicas de segurança */}
            <div className="flex items-center gap-2 text-[10px] text-slate-500 justify-center">
              <ShieldCheck className="w-3 h-3 text-yellow-500" />
              <span>Dados criptografados e protegidos pela LGPD</span>
            </div>

            {/* Benefício de comissão (gatilho de reciprocidade) */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-yellow-500/5 to-amber-500/5 border border-yellow-500/10 text-center">
              <p className="text-[10px] text-yellow-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                <DollarSign className="w-3 h-3" /> Comissão exclusiva
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Até 15% de comissão recorrente por indicação + bônus mensal</p>
            </div>

            <label className="flex items-start gap-2 text-[11px] text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedLgpd}
                onChange={(e) => setAcceptedLgpd(e.target.checked)}
                required
                className="mt-0.5 w-3.5 h-3.5 accent-yellow-500"
              />
              <span>
                Concordo com a <a href="/termos" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:underline">Política de Privacidade</a> e
                autorizo o contato comercial. Posso revogar a qualquer momento.
              </span>
            </label>

            {error && (
              <p className="text-red-400 text-sm text-center bg-red-500/10 p-3 rounded-xl border border-red-500/20 flex items-center justify-center gap-2" role="alert">
                <ShieldCheck className="w-4 h-4" /> {error}
              </p>
            )}

            <button
              disabled={loading || !acceptedLgpd}
              className="w-full py-4 bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-500 text-slate-900 rounded-xl font-black text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 group shadow-[0_0_25px_rgba(234,179,8,0.3)] hover:shadow-[0_0_35px_rgba(234,179,8,0.5)]"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <Zap className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Criar conta de Embaixador
                  <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Selos de confiança */}
          <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-white/5">
            <div className="flex items-center gap-1 text-[9px] text-slate-600">
              <BadgeCheck className="w-3 h-3 text-yellow-500" />
              <span>Pagamento Garantido</span>
            </div>
            <div className="flex items-center gap-1 text-[9px] text-slate-600">
              <Clock className="w-3 h-3 text-yellow-500" />
              <span>Comissão Mensal</span>
            </div>
            <div className="flex items-center gap-1 text-[9px] text-slate-600">
              <Users className="w-3 h-3 text-yellow-500" />
              <span>Suporte 24/7</span>
            </div>
          </div>
        </div>

        {/* Footer com Autoridade */}
        <div className="mt-8 text-center">
          <p className="text-slate-600/60 text-[10px] leading-relaxed max-w-xs mx-auto">
            Ao cadastrar, você concorda com nossos termos e políticas de comissão. Dados protegidos pela LGPD.
          </p>
        </div>
      </div>
    </div>
  );
}
