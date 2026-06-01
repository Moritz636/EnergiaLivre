'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Lock, Mail, Loader2, Eye, EyeOff } from 'lucide-react';

const ADMIN_EMAIL = 'energialivreofc@gmail.com';
const ADMIN_PASSWORD = 'adm123';

export default function AdminLoginPage() {
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState(ADMIN_PASSWORD);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
        throw new Error('Credenciais inválidas');
      }

      // Tentar login
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      });

      if (signInError) {
        // Criar usuário admin se não existir
        await supabase.auth.signUp({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          options: { data: { nome: 'Administrador', tipo: 'admin' } }
        });
        await supabase.auth.signInWithPassword({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
        });
      }

      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Login</h1>
          <p className="text-slate-400 text-sm">Acesse o painel administrativo</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition" required />
          
          <div className="relative">
            <input type={showPassword ? 'text' : 'password'} placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition" required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          
          <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:from-purple-400 hover:to-pink-400 transition disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Entrar no Painel'}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link href="/" className="text-slate-500 text-sm hover:text-purple-400 transition">
            ← Voltar para o site
          </Link>
        </div>
      </div>
    </div>
  );
}