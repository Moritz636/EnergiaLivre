'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react';

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

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { nome, tipo, whatsapp, cidade } }
      });

      if (error) throw new Error(error.message);

      if (data.user) {
        await supabase.from('leads').insert({
          nome, email, whatsapp, cidade, tipo, status: 'pendente'
        });

        setSuccess(true);
        setTimeout(() => router.push('/login'), 3000);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="bg-white/5 p-8 rounded-2xl text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">Cadastro realizado!</h1>
          <p className="text-slate-400">Redirecionando para o login...</p>
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

        <h1 className="text-2xl font-bold text-white text-center mb-6">Criar Conta</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Nome completo" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white" required />
          <input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white" required />
          <input type="tel" placeholder="WhatsApp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white" required />
          <input type="text" placeholder="Cidade - UF" value={cidade} onChange={(e) => setCidade(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white" required />
          <input type="password" placeholder="Senha (mínimo 6)" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white" required minLength={6} />
          
          <div className="flex gap-4">
            <button type="button" onClick={() => setTipo('consumidor')} className={`flex-1 py-2 rounded-xl transition ${tipo === 'consumidor' ? 'bg-emerald-500 text-slate-900' : 'bg-slate-800 text-slate-400'}`}>💰 Consumidor</button>
            <button type="button" onClick={() => setTipo('gerador')} className={`flex-1 py-2 rounded-xl transition ${tipo === 'gerador' ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'}`}>⚡ Gerador</button>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="w-full py-3 bg-emerald-500 text-slate-900 rounded-xl font-bold hover:bg-emerald-400 transition">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Cadastrar'}
          </button>
        </form>

        <p className="text-center text-slate-500 text-xs mt-6">Ao cadastrar, você concorda com nossos Termos.</p>
      </div>
    </div>
  );
}