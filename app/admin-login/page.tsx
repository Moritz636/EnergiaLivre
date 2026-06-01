'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Lock, Mail, Loader2, Eye, EyeOff } from 'lucide-react';

// Credenciais fixas do admin
const ADMIN_EMAIL = 'energialivreofc@gmail.com';
const ADMIN_PASSWORD = 'adm123';

export default function AdminLoginPage() {
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState('');
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
      // Verificar credenciais fixas
      if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
        throw new Error('Credenciais inválidas');
      }

      // Tentar fazer login no Supabase (se o usuário existir)
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      });

      if (signInError && signInError.message.includes('Invalid login')) {
        // Se o usuário não existe, criar
        const { error: signUpError } = await supabase.auth.signUp({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          options: {
            data: { nome: 'Administrador', tipo: 'admin', role: 'admin' }
          }
        });
        if (signUpError && !signUpError.message.includes('already')) {
          throw new Error(signUpError.message);
        }
        
        // Tentar login novamente
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
    <div className="min-h-screen bg-gradient-to-br from-[#020617] to-[#0a122e] flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl p-8 shadow-2xl">
        
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-10 h-10 text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Painel Administrativo</h1>
          <p className="text-slate-400 text-sm mt-1">Acesse com suas credenciais</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-slate-400 text-sm mb-2">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-sm mb-2">Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-11 pr-11 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-400"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white rounded-xl font-bold transition-all transform hover:scale-[1.02] shadow-lg disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Entrar no Painel'}
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