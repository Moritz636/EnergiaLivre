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
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('tipo')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error('Erro ao buscar perfil:', profileError);
        }

        // Redirecionar baseado no tipo
        if (profile?.tipo === 'gerador') {
          router.push('/dashboard-gerador');
        } else {
          router.push('/dashboard-consumidor');
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-6">
        <Link href="/" className="text-slate-400 hover:text-emerald-400 inline-flex items-center gap-2 mb-6">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Bem-vindo de volta</h1>
          <p className="text-slate-400 text-sm">Entre para acessar seu dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition" required />
          
          <div className="relative">
            <input type={showPassword ? 'text' : 'password'} placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition" required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          
          <button type="submit" disabled={loading} className="w-full py-3 bg-emerald-500 text-slate-900 rounded-xl font-bold hover:bg-emerald-400 transition disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Entrar'}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link href="/cadastro" className="text-slate-400 text-sm hover:text-emerald-400 transition">
            Não tem conta? Cadastre-se
          </Link>
        </div>
      </div>
    </div>
  );
}