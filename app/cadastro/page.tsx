'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, CheckCircle, User, Zap } from 'lucide-react';

export default function CadastroPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [cidade, setCidade] = useState('');
  const [tipo, setTipo] = useState<'consumidor' | 'gerador'>('consumidor');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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
            cidade
          } 
        }
      });

      if (authError) throw new Error(authError.message);

      if (authData.user) {
        // 2. Inserir na tabela profiles
        await supabase.from('profiles').insert({
          id: authData.user.id,
          email,
          nome,
          tipo,
          whatsapp,
          cidade,
          created_at: new Date().toISOString()
        });

        // 3. Inserir na tabela leads
        await supabase.from('leads').insert({
          nome,
          email,
          whatsapp,
          cidade,
          tipo,
          status: 'pendente',
          created_at: new Date().toISOString()
        });

        setSuccess(true);
        setTimeout(() => router.push('/login'), 3000);
      }
    } catch (err: any) {
      console.error('Erro no cadastro:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Cadastro realizado!</h1>
          <p className="text-slate-400 mb-4">Sua conta foi criada com sucesso.</p>
          <Link href="/login" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition">
            Ir para o login →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-6">
        <Link href="/" className="text-slate-400 hover:text-emerald-400 inline-flex items-center gap-2 mb-6">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Criar Conta</h1>
          <p className="text-slate-400 text-sm">Junte-se à revolução da energia solar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Nome completo" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition" required />
          <input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition" required />
          <input type="tel" placeholder="WhatsApp (com DDD)" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition" required />
          <input type="text" placeholder="Cidade - UF" value={cidade} onChange={(e) => setCidade(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition" required />
          <input type="password" placeholder="Senha (mínimo 6 caracteres)" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition" required minLength={6} />
          
          <div className="flex gap-4">
            <button type="button" onClick={() => setTipo('consumidor')} className={`flex-1 py-3 rounded-xl font-bold transition ${tipo === 'consumidor' ? 'bg-emerald-500 text-slate-900' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
              💰 Consumidor
            </button>
            <button type="button" onClick={() => setTipo('gerador')} className={`flex-1 py-3 rounded-xl font-bold transition ${tipo === 'gerador' ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
              ⚡ Gerador
            </button>
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          
          <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-900 rounded-xl font-bold hover:from-emerald-400 hover:to-emerald-500 transition disabled:opacity-50">
            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Cadastrar'}
          </button>
        </form>

        <p className="text-center text-slate-500 text-xs mt-6">Ao cadastrar, você concorda com nossos Termos de Uso.</p>
      </div>
    </div>
  );
}