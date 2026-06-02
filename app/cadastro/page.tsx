'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, CheckCircle, User, Zap, MapPin, Phone } from 'lucide-react';

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
      // 1. Criar usuário no Supabase Auth com Metadados
      // O TRIGGER que criamos no SQL vai pegar esses dados do 'options.data' e criar o perfil automaticamente
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

      if (authError) throw authError;

      if (authData.user) {
        // 2. Registrar na tabela de LEADS para o Admin
        const { error: leadError } = await supabase.from('leads').insert({
          user_id: authData.user.id,
          nome, 
          email, 
          whatsapp, 
          cidade, 
          tipo, 
          status: 'pendente'
        });

        if (leadError) console.error('Erro ao salvar lead:', leadError);

        setSuccess(true);
        setTimeout(() => router.push('/login'), 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao criar sua conta.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-8 text-center animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Conta Criada!</h1>
          <p className="text-slate-400 mb-8">Seu cadastro foi realizado com sucesso. Redirecionando para o login...</p>
          <Link href="/login" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-bold transition">
            Ir para o login agora <ArrowLeft className="w-4 h-4 rotate-180" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
        <Link href="/" className="text-slate-500 hover:text-emerald-400 inline-flex items-center gap-2 mb-8 transition-all group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Voltar ao início
        </Link>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
            <User className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">Crie sua conta</h1>
          <p className="text-slate-400 mt-2">Comece a economizar ou lucrar com energia solar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase mb-2 ml-1">Nome Completo</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input type="text" placeholder="Ex: Julio Macedo" value={nome} onChange={e => setNome(e.target.value)} className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition" required />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase mb-2 ml-1">E-mail Profissional</label>
            <div className="relative">
              <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 text-xs font-bold uppercase mb-2 ml-1">WhatsApp</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="tel" placeholder="(84) 99999..." value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition" required />
              </div>
            </div>
            <div>
              <label className="block text-slate-400 text-xs font-bold uppercase mb-2 ml-1">Cidade - UF</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="text" placeholder="Natal - RN" value={cidade} onChange={e => setCidade(e.target.value)} className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition" required />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase mb-2 ml-1">Senha de Acesso</label>
            <input type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition" required minLength={6} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setTipo('consumidor')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${tipo === 'consumidor' ? 'bg-emerald-500 text-slate-900 shadow-[0_0_15px_rgba(16,185,129,0.4)] scale-105' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
              💰 Consumidor
            </button>
            <button type="button" onClick={() => setTipo('gerador')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${tipo === 'gerador' ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)] scale-105' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
              ⚡ Gerador
            </button>
          </div>

          {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center font-medium">{error}</div>}

          <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-900 rounded-xl font-bold text-lg hover:from-emerald-400 hover:to-emerald-500 transition-all disabled:opacity-50 shadow-xl">
            {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'Finalizar Cadastro'}
          </button>
        </form>
      </div>
    </div>
  );
}
