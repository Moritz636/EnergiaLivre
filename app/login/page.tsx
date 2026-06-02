'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw new Error('E-mail ou senha incorretos.');

      if (data.user) {
        // Tenta buscar o perfil, mas se falhar, não trava o login
        let tipoUsuario = 'consumidor'; // Fallback seguro
        try {
          const { data: profile } = await supabase.from('profiles').select('tipo').eq('id', data.user.id).single();
          if (profile?.tipo) tipoUsuario = profile.tipo;
        } catch (err) {
          console.warn('Perfil não encontrado, usando fallback:', err);
        }

        // Redirecionamento cirúrgico
        if (tipoUsuario === 'admin') router.replace('/admin/dashboard');
        else if (tipoUsuario === 'gerador') router.replace('/dashboard-gerador');
        else router.replace('/dashboard-consumidor');
      }
    } catch (err: any) {
      console.error('Erro login:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-8">
        <Link href="/" className="text-slate-500 hover:text-emerald-400 inline-flex items-center gap-2 mb-8">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
        <h1 className="text-3xl font-bold text-white text-center mb-8">Bem-vindo</h1>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white" required />
          <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white" required />
          
          {error && <p className="text-red-400 text-sm text-center bg-red-500/10 p-2 rounded-lg">{error}</p>}
          
          <button disabled={loading} className="w-full py-4 bg-emerald-500 text-slate-900 rounded-xl font-bold hover:bg-emerald-400 transition disabled:opacity-50 flex justify-center items-center">
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}