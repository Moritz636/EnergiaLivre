'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Shield } from 'lucide-react';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();
  const supabase = createClient();
  const ADMIN_EMAIL = 'energialivreofc@gmail.com';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (password !== 'adm123') {
        throw new Error('Senha administrativa incorreta.');
      }

      // Tenta logar. Se não existir, cria o usuário admin automaticamente
      let { error: signInError } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: password,
      });

      if (signInError && signInError.message.includes('Invalid login')) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: ADMIN_EMAIL,
          password: password,
          options: { data: { nome: 'Administrador', tipo: 'admin' } }
        });
        if (signUpError) throw signUpError;
        
        await supabase.auth.signInWithPassword({ email: ADMIN_EMAIL, password: password });
      } else if (signInError) {
        throw signInError;
      }

      router.replace('/admin/dashboard');
    } catch (err: any) {
      console.error('Erro admin:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-8">
        <Link href="/" className="text-slate-500 hover:text-purple-400 inline-flex items-center gap-2 mb-8">
          <ArrowLeft className="w-4 h-4" /> Voltar ao site
        </Link>
        <div className="text-center mb-8">
          <Shield className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white">Painel Admin</h1>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" value={ADMIN_EMAIL} disabled className="w-full bg-slate-800 border border-white/10 rounded-xl py-3 px-4 text-slate-400" />
          <input type="password" placeholder="Senha (adm123)" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white" required />
          
          {error && <p className="text-red-400 text-sm text-center bg-red-500/10 p-2 rounded-lg">{error}</p>}
          
          <button disabled={loading} className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-500 transition disabled:opacity-50 flex justify-center items-center">
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Acessar Painel'}
          </button>
        </form>
      </div>
    </div>
  );
}