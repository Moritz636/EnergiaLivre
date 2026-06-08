'use client';

import { useState, useEffect } from 'react';
import { getSupabase } from '@/lib/supabase/singleton';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Loader2, Eye, EyeOff, Zap, ArrowRight, Sparkles, Sun, Wallet, Home, Briefcase } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const FROM_ROLE_MAP: Record<string, string> = {
  consumidor: '/dashboard-consumidor',
  gerador: '/dashboard-gerador',
  parceiro: '/embaixador/dashboard',
  embaixador: '/embaixador/dashboard',
  admin: '/admin/dashboard',
};

function isSafePath(p: string): boolean {
  return typeof p === 'string' && p.startsWith('/') && !p.startsWith('//');
}

function resolveTarget(params: URLSearchParams, role: string | null, tipo: string | null): string {
  const next = params.get('next');
  if (isSafePath(next || '')) return next as string;
  const from = params.get('from');
  if (from) {
    if (FROM_ROLE_MAP[from]) return FROM_ROLE_MAP[from];
    if (isSafePath(from)) return from;
  }
  const redirect = params.get('redirect');
  if (isSafePath(redirect || '')) return redirect as string;
  if (role === 'admin') return '/admin/dashboard';
  if (tipo === 'gerador' || role === 'gerador') return '/dashboard-gerador';
  if (tipo === 'parceiro' || role === 'parceiro') return '/embaixador/dashboard';
  if (tipo === 'consumidor' || role === 'consumidor') return '/dashboard-consumidor';
  return '/dashboard';
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [cadastroSucesso, setCadastroSucesso] = useState(false);
  const [fromLabel, setFromLabel] = useState<string>('');

  const router = useRouter();
  const supabase = getSupabase();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('cadastro') === 'sucesso') setCadastroSucesso(true);
    const from = urlParams.get('from');
    if (from && FROM_ROLE_MAP[from]) {
      const labels: Record<string, string> = {
        consumidor: 'Painel do Consumidor',
        gerador: 'Painel do Gerador',
        parceiro: 'Painel do Parceiro',
        embaixador: 'Painel do Parceiro',
      };
      setFromLabel(labels[from] || '');
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!mounted) return;
      if (!user) {
        setAuthChecked(true);
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, tipo')
        .eq('id', user.id)
        .single();
      const urlParams = new URLSearchParams(window.location.search);
      const target = resolveTarget(
        urlParams,
        (profile as { role?: string } | null)?.role ?? null,
        (profile as { tipo?: string } | null)?.tipo ?? null,
      );
      router.replace(target);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError('Email ou senha incorretos');
        setLoading(false);
        return;
      }

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, tipo')
          .eq('id', data.user.id)
          .single();

        const urlParams = new URLSearchParams(window.location.search);
        const target = resolveTarget(
          urlParams,
          (profile as { role?: string } | null)?.role ?? null,
          (profile as { tipo?: string } | null)?.tipo ?? null,
        );
        router.push(target);
      }
    } catch (err: any) {
      setError('Erro ao fazer login. Tente novamente.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const emailRedirectTo = `${window.location.origin}/login?${urlParams.toString()}`;
      const { error: magicLinkError } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo },
      });

      if (magicLinkError) {
        setError('Erro ao enviar link mágico. Tente novamente.');
        setLoading(false);
        return;
      }

      alert(`Link mágico enviado para ${email}. Verifique sua caixa de entrada!`);
      setEmail('');
    } catch (err: any) {
      setError('Erro ao enviar link mágico.');
      console.error('Magic link error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative">
      <div className="fixed inset-0 -z-20" aria-hidden>
        <Image
          src="/images/login-security.webp"
          alt=""
          fill
          className="object-cover opacity-[0.12]"
          priority
        />
      </div>
      <div className="fixed inset-0 -z-20" aria-hidden>
        <Image
          src="/images/login-security.webp"
          alt=""
          fill
          className="object-cover opacity-[0.12]"
          priority
        />
      </div>
      <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-8">
        <Link href="/" className="flex items-center gap-2 justify-center mb-6 group">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-400 rounded-xl flex items-center justify-center group-hover:scale-105 transition">
            <Zap className="text-slate-900 w-5 h-5 fill-current" />
          </div>
          <span className="text-xl font-black text-white tracking-tight">ENERGIA<span className="text-emerald-500">LIVRE</span></span>
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Login</h1>
          <p className="text-slate-400">
            {fromLabel ? `Entre para acessar o ${fromLabel}` : 'Acesse sua conta EnergiaLivre'}
          </p>
        </div>

        {cadastroSucesso && (
          <div className="mb-6 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-start gap-2">
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Cadastro realizado! Confirme seu e-mail (se aplicável) e faça login para acessar seu painel.</span>
          </div>
        )}

        {fromLabel && (
          <div className="mb-6 p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-sm flex items-center gap-2">
            <ArrowRight className="w-4 h-4 shrink-0" />
            <span>Você será direcionado para o {fromLabel} após o login.</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-10 pr-10 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-500 text-slate-900 rounded-xl font-bold hover:bg-emerald-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Entrando...
              </div>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        <div className="mt-6">
          <button
            onClick={handleMagicLink}
            disabled={loading}
            className="w-full py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              'Entrar com Link Mágico'
            )}
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-white/5">
          <p className="text-[10px] text-slate-500 text-center mb-3 uppercase tracking-wider font-bold">
            Entrar como:
          </p>
          <div className="grid grid-cols-3 gap-2">
            <Link
              href="/login?from=consumidor"
              className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl bg-white/5 hover:bg-emerald-500/20 border border-white/5 hover:border-emerald-500/30 transition text-center group"
            >
              <Home className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
              <span className="text-[9px] text-slate-400 group-hover:text-emerald-300 font-bold">Consumidor</span>
            </Link>
            <Link
              href="/login?from=gerador"
              className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl bg-white/5 hover:bg-blue-500/20 border border-white/5 hover:border-blue-500/30 transition text-center group"
            >
              <Sun className="w-4 h-4 text-blue-400 group-hover:scale-110 transition" />
              <span className="text-[9px] text-slate-400 group-hover:text-blue-300 font-bold">Gerador</span>
            </Link>
            <Link
              href="/login?from=parceiro"
              className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl bg-white/5 hover:bg-yellow-500/20 border border-white/5 hover:border-yellow-500/30 transition text-center group"
            >
              <Briefcase className="w-4 h-4 text-yellow-400 group-hover:scale-110 transition" />
              <span className="text-[9px] text-slate-400 group-hover:text-yellow-300 font-bold">Parceiro</span>
            </Link>
          </div>
        </div>

        <div className="mt-6 space-y-2 text-center">
          <p className="text-slate-400 text-sm">
            Não tem conta?{' '}
            <Link href="/cadastro" className="text-emerald-400 hover:text-emerald-300 transition font-medium">
              Cadastre-se
            </Link>
          </p>
          <p className="text-slate-500 text-xs">
            <Link href="/admin-login" className="text-purple-400 hover:text-purple-300 transition font-medium">
              Acessar Painel Admin
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
