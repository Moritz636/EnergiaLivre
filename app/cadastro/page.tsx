'use client';

import { useState, useEffect } from 'react';
import { getSupabase } from '@/lib/supabase/singleton';
import { useRouter } from 'next/navigation';
import {
  CheckCircle,
  Loader2,
  Eye,
  EyeOff,
  Zap,
  Users,
  ShieldCheck,
  BadgeCheck,
  Clock,
  ArrowRight,
  Home,
  Briefcase,
  Sun
} from 'lucide-react';
import Link from 'next/link';

interface CadastroStats {
  last24h: number;
  totalUsers: number;
}

export default function CadastroPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [password, setPassword] = useState('');
  const [tipo, setTipo] = useState<'consumidor' | 'gerador' | 'parceiro'>('consumidor');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedLgpd, setAcceptedLgpd] = useState(false);
  const [stats, setStats] = useState<CadastroStats | null>(null);

  const whatsappRegex = /^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$/;
  const isValidWhatsapp = whatsappRegex.test(whatsapp.replace(/\s/g, ''));
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const router = useRouter();
  const supabase = getSupabase();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const [last24hRes, totalRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', since),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
      ]);
      if (!mounted) return;
      setStats({
        last24h: last24hRes.count ?? 0,
        totalUsers: totalRes.count ?? 0,
      });
    })();
    return () => {
      mounted = false;
    };
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
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
            tipo,
            whatsapp,
            cidade,
            estado,
          },
          emailRedirectTo: `${window.location.origin}/login?cadastro=sucesso&from=${tipo}`,
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
        setSuccess(true);
        setTimeout(() => {
          router.push(`/login?cadastro=sucesso&from=${tipo}`);
        }, 2500);
      }
    } catch (err: any) {
      console.error('Erro no cadastro:', err);
      setError('Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const getGradientByType = () => {
    switch (tipo) {
      case 'consumidor':
        return 'from-emerald-500 to-emerald-600';
      case 'gerador':
        return 'from-blue-500 to-blue-600';
      case 'parceiro':
        return 'from-yellow-500 to-yellow-400';
      default:
        return 'from-emerald-500 to-emerald-600';
    }
  };

  const getBadgeByType = () => {
    switch (tipo) {
      case 'consumidor':
        return { icon: <Home className="w-3 h-3" />, text: 'Economize na conta de luz', color: 'emerald' };
      case 'gerador':
        return { icon: <Sun className="w-3 h-3" />, text: 'Monetize sua usina', color: 'blue' };
      case 'parceiro':
        return { icon: <Briefcase className="w-3 h-3" />, text: 'Ganhe comissões', color: 'yellow' };
      default:
        return { icon: <Zap className="w-3 h-3" />, text: 'Energia Solar', color: 'emerald' };
    }
  };

  const badge = getBadgeByType();
  const last24hText = stats
    ? `${stats.last24h} ${stats.last24h === 1 ? 'pessoa entrou' : 'pessoas entraram'} na rede nas últimas 24h`
    : '';
  const totalText = stats
    ? `${stats.totalUsers.toLocaleString('pt-BR')} ${stats.totalUsers === 1 ? 'cadastro' : 'cadastros'} na plataforma`
    : '';

  if (success) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
        <div className="text-center bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-8 rounded-3xl max-w-md animate-in zoom-in duration-500">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 rounded-full mb-6 animate-bounce">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Cadastro realizado com sucesso</h1>
          <p className="text-slate-400 mb-4">Enviamos um link de confirmação para seu e-mail. Verifique sua caixa de entrada e spam.</p>

          {last24hText && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 mb-6">
              <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                <Clock className="w-3 h-3" /> Confirme seu e-mail
              </p>
              <p className="text-sm text-white mt-1">{last24hText}. Confirme seu e-mail para entrar.</p>
            </div>
          )}

          <p className="text-slate-500 text-sm flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
            Redirecionando para o login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col items-center justify-center px-6 py-20 font-sans overflow-x-hidden">

      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent -z-20" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] -z-10" />
      <div className="fixed top-40 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px] -z-10" />

      <div className="max-w-md w-full">

        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-emerald-400 transition-colors text-sm font-medium group">
            <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" /> Voltar
          </Link>
          <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[9px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            {badge.icon} {badge.text}
          </div>
        </div>

        {last24hText && (
          <div className="flex items-center justify-center gap-2 text-[10px] text-emerald-400 bg-emerald-500/10 rounded-full py-1.5 px-3 w-fit mx-auto mb-6">
            <Users className="w-3 h-3" /> {last24hText}
          </div>
        )}

        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl p-8 rounded-[40px] shadow-2xl relative overflow-hidden group">

          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

          <div className="absolute top-4 right-4">
            <ShieldCheck className="w-6 h-6 text-emerald-500/20 group-hover:text-emerald-500/40 transition-all" />
          </div>

          <div className="text-center mb-8">
            <div className={`w-16 h-16 bg-gradient-to-br ${getGradientByType()} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
              {tipo === 'consumidor' && <Home className="text-slate-900 w-8 h-8" />}
              {tipo === 'gerador' && <Sun className="text-slate-900 w-8 h-8" />}
              {tipo === 'parceiro' && <Briefcase className="text-slate-900 w-8 h-8" />}
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Criar Conta</h1>
            <p className="text-slate-400">Junte-se à rede de energia solar</p>
          </div>

          {totalText && (
            <div className="flex items-center justify-center gap-6 text-[10px] text-slate-500 border-t border-b border-white/5 py-3 mb-6">
              <div className="flex items-center gap-1"><Users className="w-3 h-3 text-emerald-400" /> {totalText}</div>
              <div className="flex items-center gap-1"><Zap className="w-3 h-3 text-emerald-400" /> Cadastro gratuito</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Nome completo"
                aria-label="Nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3.5 px-4 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all hover:border-emerald-500/50"
                required
              />
            </div>

            <div className="relative">
              <input
                type="email"
                placeholder="E-mail"
                aria-label="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3.5 px-4 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all hover:border-emerald-500/50"
                required
              />
            </div>

            <div className="relative">
              <input
                type="tel"
                placeholder="WhatsApp (com DDD)"
                aria-label="WhatsApp com DDD"
                aria-invalid={whatsapp.length > 0 && !isValidWhatsapp}
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3.5 px-4 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all hover:border-emerald-500/50"
                required
              />
              {whatsapp.length > 0 && !isValidWhatsapp && (
                <p className="mt-1 text-[10px] text-red-400">Formato: (84) 98785-8668</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 relative">
                <input
                  type="text"
                  placeholder="Cidade"
                  aria-label="Cidade"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3.5 px-4 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all hover:border-emerald-500/50"
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
                  onChange={(e) => setEstado(e.target.value.toUpperCase())}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3.5 px-4 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all hover:border-emerald-500/50 uppercase"
                  required
                />
              </div>
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Senha (mínimo 6 caracteres)"
                aria-label="Senha (mínimo 6 caracteres)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3.5 px-4 pr-10 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all hover:border-emerald-500/50"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-slate-400 text-sm font-medium">Eu sou:</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTipo('consumidor')}
                  aria-pressed={tipo === 'consumidor'}
                  className={`py-3 rounded-xl font-bold transition-all text-sm ${
                    tipo === 'consumidor'
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-900 shadow-[0_0_15px_rgba(16,185,129,0.3)] scale-105'
                      : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 border border-white/5'
                  }`}
                >
                  Consumidor
                </button>
                <button
                  type="button"
                  onClick={() => setTipo('gerador')}
                  aria-pressed={tipo === 'gerador'}
                  className={`py-3 rounded-xl font-bold transition-all text-sm ${
                    tipo === 'gerador'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] scale-105'
                      : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 border border-white/5'
                  }`}
                >
                  Gerador
                </button>
                <button
                  type="button"
                  onClick={() => setTipo('parceiro')}
                  aria-pressed={tipo === 'parceiro'}
                  className={`py-3 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-1 ${
                    tipo === 'parceiro'
                      ? 'bg-gradient-to-r from-yellow-500 to-yellow-400 text-slate-900 shadow-[0_0_15px_rgba(234,179,8,0.3)] scale-105'
                      : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 border border-white/5'
                  }`}
                >
                  <Users className="w-3 h-3" /> Embaixador
                </button>
              </div>

              <p className="text-[10px] text-slate-500 text-center">
                {tipo === 'consumidor' && 'Consumidores economizam na conta de luz via créditos de energia solar.'}
                {tipo === 'gerador' && 'Geradores monetizam excedente de energia com demanda garantida.'}
                {tipo === 'parceiro' && 'Embaixadores ganham comissões indicando energia solar.'}
              </p>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-slate-500 justify-center">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              <span>Dados criptografados e protegidos pela LGPD</span>
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

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3" role="alert">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            <button
              disabled={loading || !acceptedLgpd}
              className={`w-full py-4 bg-gradient-to-r ${getGradientByType()} text-slate-900 rounded-xl font-black text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 group shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:shadow-[0_0_35px_rgba(16,185,129,0.5)]`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Criando conta...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Cadastrar
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-white/5">
            <div className="flex items-center gap-1 text-[9px] text-slate-600">
              <BadgeCheck className="w-3 h-3 text-emerald-500" />
              <span>Conta gratuita</span>
            </div>
            <div className="flex items-center gap-1 text-[9px] text-slate-600">
              <Clock className="w-3 h-3 text-emerald-500" />
              <span>Ativação por e-mail</span>
            </div>
            <div className="flex items-center gap-1 text-[9px] text-slate-600">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              <span>LGPD</span>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              Já tem conta?{' '}
              <Link href="/login" className="text-emerald-400 hover:text-emerald-300 transition font-medium">
                Faça login
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-slate-600/60 text-[10px] leading-relaxed max-w-xs mx-auto">
            Ao se cadastrar, você concorda com nossos Termos de Uso e Política de Privacidade.
          </p>
        </div>
      </div>
    </div>
  );
}
