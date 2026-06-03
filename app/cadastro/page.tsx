'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { CheckCircle, Loader2, Eye, EyeOff, Zap } from 'lucide-react';
import Link from 'next/link';

export default function CadastroPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [cidade, setCidade] = useState('');
  const [password, setPassword] = useState('');
  const [tipo, setTipo] = useState<'consumidor' | 'gerador'>('consumidor');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validações (Lei 27: Para dominar, primeiro submeta-se às regras)
    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      // 1. Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome,
            tipo,
            whatsapp,
            cidade,
          },
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
        // 2. Criar perfil do usuário
        await supabase.from('profiles').upsert({
          id: authData.user.id,
          email,
          nome,
          tipo,
          whatsapp,
          cidade,
          role: 'user',
        });

        // 3. Criar lead para o admin gerenciar
        await supabase.from('leads').insert({
          user_id: authData.user.id,
          nome,
          email,
          whatsapp,
          cidade,
          tipo,
          status: 'pendente',
        });

        setSuccess(true);

        // Redirecionar para dashboard após 2 segundos
        setTimeout(() => {
          if (tipo === 'gerador') {
            router.push('/dashboard-gerador');
          } else {
            router.push('/dashboard-consumidor');
          }
        }, 2000);
      }
    } catch (err: any) {
      console.error('Erro no cadastro:', err);
      setError('Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="text-center bg-white/5 p-8 rounded-3xl border border-white/10 max-w-md">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Cadastro Realizado!</h1>
          <p className="text-slate-400">Redirecionando para seu dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="text-slate-900 w-8 h-8 fill-current" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Criar Conta</h1>
          <p className="text-slate-400">Junte-se à revolução da energia solar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nome completo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"
            required
          />
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"
            required
          />
          <input
            type="tel"
            placeholder="WhatsApp (com DDD)"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"
            required
          />
          <input
            type="text"
            placeholder="Cidade - UF"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"
            required
          />
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Senha (mínimo 6 caracteres)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 pr-10 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="space-y-2">
            <p className="text-slate-400 text-sm font-medium">Eu sou:</p>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setTipo('consumidor')}
                className={`flex-1 py-3 rounded-xl font-bold transition ${
                  tipo === 'consumidor'
                    ? 'bg-emerald-500 text-slate-900'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                Consumidor
              </button>
              <button
                type="button"
                onClick={() => setTipo('gerador')}
                className={`flex-1 py-3 rounded-xl font-bold transition ${
                  tipo === 'gerador'
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                Gerador
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          <button
            disabled={loading}
            className="w-full py-4 bg-emerald-500 text-slate-900 rounded-xl font-bold hover:bg-emerald-400 transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Criando conta...
              </>
            ) : (
              'Cadastrar'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">
            Já tem conta?{' '}
            <Link href="/login" className="text-emerald-400 hover:text-emerald-300 transition font-medium">
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}