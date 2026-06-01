'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

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
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw new Error(error.message);
      
      if (data.user) {
        // Buscar o tipo do usuário na tabela profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('tipo')
          .eq('id', data.user.id)
          .single();

        // Redirecionar baseado no tipo
        if (profile?.tipo === 'consumidor') {
          router.push('/dashboard-consumidor');
        } else if (profile?.tipo === 'gerador') {
          router.push('/dashboard-gerador');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-emerald-400 mb-6">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Bem-vindo de volta</h1>
          <p className="text-slate-400 text-sm">Entre para acessar seu dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-slate-400 text-sm mb-2">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white"
              required
            />
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-2">Senha</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white"
              required
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-500 text-slate-900 rounded-xl font-bold hover:bg-emerald-400 transition"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Entrar'}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link href="/cadastro" className="text-slate-400 text-sm hover:text-emerald-400">
            Não tem conta? Cadastre-se
          </Link>
        </div>
      </div>
    </div>
  );
}