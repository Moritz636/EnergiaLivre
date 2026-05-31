'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Zap, Loader2, ShieldCheck } from 'lucide-react';

export default function CadastroGeradorPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    whatsapp: '',
    password: '',
    nome_usina: '',
    capacidade: '',
    excedente: '',
    concessionaria: '',
    cidade: '',
    estado: ''
  });

  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: { nome: formData.nome, tipo: 'gerador' } }
      });

      if (authError) throw new Error(authError.message);

      if (authData.user) {
        await supabase.from('geradores').insert({
          id: authData.user.id,
          nome_usina: formData.nome_usina,
          capacidade_kwp: parseFloat(formData.capacidade),
          excedente_mensal_kwh: parseFloat(formData.excedente),
          concessionaria: formData.concessionaria,
          cidade: formData.cidade,
          estado: formData.estado,
          status: 'pendente'
        });

        await supabase.from('leads').insert({
          nome: formData.nome,
          email: formData.email,
          whatsapp: formData.whatsapp,
          tipo: 'gerador',
          status: 'pendente'
        });

        router.push('/dashboard-gerador');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-yellow-500 mb-6">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white">Cadastro de Gerador</h1>
            <p className="text-slate-400 text-sm">Preencha os dados para começar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Nome completo" value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white" required />
            <input type="email" placeholder="E-mail" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white" required />
            <input type="tel" placeholder="WhatsApp" value={formData.whatsapp} onChange={(e) => setFormData({...formData, whatsapp: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white" required />
            <input type="password" placeholder="Senha (mínimo 6 caracteres)" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white" required minLength={6} />

            <input type="text" placeholder="Nome da usina" value={formData.nome_usina} onChange={(e) => setFormData({...formData, nome_usina: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white" required />
            
            <div className="grid grid-cols-2 gap-3">
              <input type="number" placeholder="Capacidade (kWp)" value={formData.capacidade} onChange={(e) => setFormData({...formData, capacidade: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white" required />
              <input type="number" placeholder="Excedente (kWh)" value={formData.excedente} onChange={(e) => setFormData({...formData, excedente: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white" required />
            </div>

            <select value={formData.concessionaria} onChange={(e) => setFormData({...formData, concessionaria: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white" required>
              <option value="">Selecione a concessionária</option>
              <option value="Neoenergia Cosern">Neoenergia Cosern (RN)</option>
              <option value="Neoenergia Coelba">Neoenergia Coelba (BA)</option>
              <option value="CPFL Paulista">CPFL Paulista (SP)</option>
              <option value="Light">Light (RJ)</option>
              <option value="Cemig">Cemig (MG)</option>
            </select>

            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="Cidade" value={formData.cidade} onChange={(e) => setFormData({...formData, cidade: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white" required />
              <input type="text" placeholder="Estado (sigla)" value={formData.estado} onChange={(e) => setFormData({...formData, estado: e.target.value.toUpperCase()})} className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white" required />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button type="submit" disabled={loading} className="w-full py-3 bg-yellow-500 text-slate-900 rounded-xl font-bold hover:bg-yellow-400 transition disabled:opacity-50">
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Cadastrar'}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center text-[10px] text-slate-500">
          <div className="flex items-center justify-center gap-2"><ShieldCheck className="w-3 h-3" /> Dados protegidos (LGPD)</div>
        </div>
      </div>
    </div>
  );
}