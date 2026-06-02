'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Loader2, LogIn } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Autenticação no Supabase
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (signInError) throw signInError;

      if (data.user) {
        // 2. Consulta o TIPO do usuário na tabela profiles (que criamos no SQL)
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('tipo')
          .eq('id', data.user.id)
          .single();

        if (profileError || !profile) {
          throw new Error('Perfil não encontrado. Por favor, finalize seu cadastro.');
        }

        // 3. REDIRECIONAMENTO ESTRUTURADO
        if (profile.tipo === 'admin') {
          router.push('/admin/dashboard');
        } else if (profile.tipo === 'gerador') {
          router.push('/dashboard-gerador');
        } else {
          router.push('/dashboard-consumidor');
        }
      }
    } catch (err: any) {
      setError(err.message || 'E-mail ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
        <Link href="/" className="text-slate-500 hover:text-emerald-400 inline-flex items-center gap-2 mb-8 transition-all group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Voltar ao início
        </Link>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
            <LogIn className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">Bem-vindo</h1>
          <p className="text-slate-400 mt-2">Acesse sua conta para gerenciar sua energia</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase mb-2 ml-1">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="email" 
                placeholder="seu@email.com" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition" 
                required 
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase mb-2 ml-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="••••••••" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-12 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition" 
                required 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center font-medium">{error}</div>}

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-900 rounded-xl font-bold text-lg hover:from-emerald-400 hover:to-emerald-500 transition-all disabled:opacity-50 shadow-xl"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'Entrar na Plataforma'}
          </button>
        </form>

        <div className="text-center mt-8">
          <p className="text-slate-500 text-sm">
            Não tem uma conta? <Link href="/cadastro" className="text-emerald-400 hover:text-emerald-300 font-bold transition">Cadastre-se grátis</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
