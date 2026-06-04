'use client';

import { useState, useEffect } from 'react';
import { getSupabase } from '@/lib/supabase/singleton';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Loader2, Eye, EyeOff, Zap } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [redirect, setRedirect] = useState('');
  
  const router = useRouter();
  const supabase = getSupabase();

  // Obter redirecionamento da URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const redirectParam = urlParams.get('redirect');
    if (redirectParam) {
      setRedirect(redirectParam);
    }
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
        // Verificar se é admin e redirecionar corretamente
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        const role = (profile as { role?: string } | null)?.role
        if (role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          const redirectPath = redirect || '/dashboard';
          router.push(redirectPath);
        }
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
      const { error: magicLinkError } = await supabase.auth.signInWithOtp({
        email,
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

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="text-slate-900 w-8 h-8 fill-current" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Login</h1>
          <p className="text-slate-400">Acesse sua conta EnergiaLivre</p>
        </div>
        
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
              type={showPassword ? "text" : "password"}
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

        <div className="mt-8 text-center">
          <p className="text-slate-400 text-sm">
            Não tem conta?{' '}
            <Link href="/cadastro" className="text-emerald-400 hover:text-emerald-300 transition font-medium">
              Cadastre-se
            </Link>
          </p>
          <p className="text-slate-400 text-sm mt-2">
            <Link href="/admin-login" className="text-purple-400 hover:text-purple-300 transition font-medium">
              Acessar Painel Admin
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}