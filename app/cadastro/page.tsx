'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Zap, User, Briefcase, Loader2 } from 'lucide-react';

export default function CadastroPage() {
  const [tipo, setTipo] = useState<'consumidor' | 'gerador' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('Tentando cadastrar:', email, tipo);

    try {
      // 1. Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            tipo,
            nome: email.split('@')[0]
          },
        }
      });

      if (authError) {
        console.error('Erro Auth:', authError);
        setError(authError.message);
        setLoading(false);
        return;
      }

      console.log('Auth sucesso:', authData);

      if (authData.user) {
        // 2. Salvar na tabela profiles
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            nome: email.split('@')[0],
            email: email,
            tipo: tipo,
            created_at: new Date().toISOString()
          });

        if (profileError) {
          console.error('Erro profile:', profileError);
        }

        // 3. Salvar na tabela leads
        await supabase.from('leads').insert({
          nome: email.split('@')[0],
          email: email,
          tipo: tipo,
          status: 'pendente',
          created_at: new Date().toISOString()
        });

        // 4. Redirecionar para completar perfil baseado no tipo
        if (tipo === 'consumidor') {
          router.push('/completar-perfil/consumidor');
        } else {
          router.push('/completar-perfil/gerador');
        }
      }
    } catch (err: any) {
      console.error('Erro geral:', err);
      setError('Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] to-[#0a122e] flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-emerald-400 mb-8">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>

        <div className="text-center mb-8">
          <Zap className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white">Criar Conta</h1>
          <p className="text-slate-400">Junte-se à revolução da energia solar</p>
        </div>

        {!tipo ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white text-center">Você é:</h2>
            <button
              onClick={() => setTipo('consumidor')}
              className="w-full p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center hover:bg-emerald-500/20 transition group"
            >
              <User className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-white">Consumidor</h3>
              <p className="text-slate-400 text-sm">Quero economizar na conta de luz</p>
            </button>
            <button
              onClick={() => setTipo('gerador')}
              className="w-full p-6 bg-blue-500/10 border border-blue-500/30 rounded-2xl text-center hover:bg-blue-500/20 transition group"
            >
              <Briefcase className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-white">Gerador / Parceiro</h3>
              <p className="text-slate-400 text-sm">Tenho energia solar para compartilhar</p>
            </button>
          </div>
        ) : (
          <form onSubmit={handleCadastro} className="space-y-5">
            <div>
              <label className="block text-slate-400 text-sm mb-2">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"
                required
              />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-2">Senha (mínimo 6 caracteres)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"
                required
                minLength={6}
              />
            </div>
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-900 rounded-xl font-bold hover:from-emerald-400 hover:to-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Criar Conta'}
            </button>
            <button
              type="button"
              onClick={() => setTipo(null)}
              className="w-full text-center text-sm text-slate-500 hover:text-emerald-400 transition"
            >
              ← Voltar e escolher outro tipo
            </button>
          </form>
        )}
      </div>
    </div>
  );
}