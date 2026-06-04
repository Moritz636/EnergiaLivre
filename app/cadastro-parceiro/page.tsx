'use client';

import { useState, type FormEvent } from 'react';
import { getSupabase } from '@/lib/supabase/singleton';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, CheckCircle, User } from 'lucide-react';
import Link from 'next/link';

export default function CadastroParceiroPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [cidade, setCidade] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const router = useRouter();
  const supabase = getSupabase();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Cria usuário no Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            nome,
            tipo: 'gerador', // Parceiros são geradores
            whatsapp,
            cidade
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Salva na tabela leads
        await (supabase as any).from('leads').insert({
          user_id: authData.user.id,
          nome,
          email,
          whatsapp,
          cidade,
          tipo: 'gerador',
          status: 'pendente'
        });

        setSuccess(true);
        setTimeout(() => router.push('/login'), 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
        <div className="text-center bg-white/5 p-8 rounded-3xl border border-white/10">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Cadastro Realizado!</h1>
          <p className="text-slate-400">Redirecionando para o login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-8">
        <Link href="/parceiros" className="text-slate-500 hover:text-emerald-400 inline-flex items-center gap-2 mb-8">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
        
        <h1 className="text-3xl font-bold text-white text-center mb-2">Ser Embaixador</h1>
        <p className="text-slate-400 text-center mb-8">Preencha seus dados para começar</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" 
            placeholder="Nome completo" 
            value={nome} 
            onChange={e => setNome(e.target.value)} 
            className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white" 
            required 
          />
          <input 
            type="email" 
            placeholder="E-mail" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white" 
            required 
          />
          <input 
            type="tel" 
            placeholder="WhatsApp" 
            value={whatsapp} 
            onChange={e => setWhatsapp(e.target.value)} 
            className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white" 
            required 
          />
          <input 
            type="text" 
            placeholder="Cidade - UF" 
            value={cidade} 
            onChange={e => setCidade(e.target.value)} 
            className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white" 
            required 
          />
          <input 
            type="password" 
            placeholder="Senha (mínimo 6)" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white" 
            required 
            minLength={6} 
          />
          
          {error && <p className="text-red-400 text-sm text-center bg-red-500/10 p-2 rounded-lg">{error}</p>}
          
          <button 
            disabled={loading} 
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-yellow-500 text-slate-900 rounded-xl font-bold hover:opacity-90 transition disabled:opacity-50 flex justify-center items-center"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Cadastrar'}
          </button>
        </form>
        
        <p className="text-slate-500 text-xs text-center mt-6">
          Ao cadastrar, você concorda com nossos termos e políticas.
        </p>
      </div>
    </div>
  );
}