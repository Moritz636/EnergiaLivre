'use client';
import { useState, type FormEvent } from 'react';
import { getSupabase } from '@/lib/supabase/singleton';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Zap, Loader2, ShieldCheck, Sun, Building, CheckCircle2 } from 'lucide-react';

const CONCESSIONARIAS = [
  { nome: "Neoenergia Cosern", estado: "RN", regiao: "Nordeste" },
  { nome: "Neoenergia Coelba", estado: "BA", regiao: "Nordeste" },
  { nome: "Neoenergia Elektro", estado: "SP", regiao: "Sudeste" },
  { nome: "Neoenergia Pernambuco", estado: "PE", regiao: "Nordeste" },
  { nome: "CPFL Paulista", estado: "SP", regiao: "Sudeste" },
  { nome: "CPFL Piratininga", estado: "SP", regiao: "Sudeste" },
  { nome: "RGE Sul", estado: "RS", regiao: "Sul" },
  { nome: "EDP São Paulo", estado: "SP", regiao: "Sudeste" },
  { nome: "EDP Espírito Santo", estado: "ES", regiao: "Sudeste" },
  { nome: "Light", estado: "RJ", regiao: "Sudeste" },
  { nome: "Energisa Paraíba", estado: "PB", regiao: "Nordeste" },
  { nome: "Energisa Sergipe", estado: "SE", regiao: "Nordeste" },
  { nome: "Energisa Mato Grosso", estado: "MT", regiao: "Centro-Oeste" },
  { nome: "Energisa Mato Grosso do Sul", estado: "MS", regiao: "Centro-Oeste" },
  { nome: "Equatorial Maranhão", estado: "MA", regiao: "Nordeste" },
  { nome: "Equatorial Pará", estado: "PA", regiao: "Norte" },
];

export default function CadastroGeradorPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
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
  const supabase = getSupabase();

  const handleConcessionariaChange = (value: string) => {
    const selected = CONCESSIONARIAS.find(c => c.nome === value);
    setFormData({
      ...formData,
      concessionaria: value,
      estado: selected?.estado || ''
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      // 1. Criar usuário
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            nome: formData.nome,
            tipo: 'gerador',
            whatsapp: formData.whatsapp,
            cidade: formData.cidade,
            estado: formData.estado,
            nome_usina: formData.nome_usina,
            capacidade_kwp: parseFloat(formData.capacidade) || 0,
            excedente_mensal_kwh: parseFloat(formData.excedente) || 0,
            concessionaria: formData.concessionaria,
          },
          emailRedirectTo: `${window.location.origin}/email-confirmado?from=gerador`,
        }
      });

      if (authError) throw new Error(authError.message);

      if (authData.user) {
        // 2. Criar lead (separado do auth para evitar conflito com trigger)
        await (supabase as any).from('leads').insert({
          user_id: authData.user.id,
          nome: formData.nome,
          email: formData.email,
          whatsapp: formData.whatsapp,
          tipo: 'gerador',
          capacidade_kwp: parseFloat(formData.capacidade) || 0,
          concessionaria: formData.concessionaria,
          estado: formData.estado,
          cidade: formData.cidade,
          status: 'pendente'
        });

        // 3. Criar gerador (o trigger pode ter criado - usar upsert)
        await (supabase as any).from('geradores').upsert({
          id: authData.user.id,
          nome_usina: formData.nome_usina,
          capacidade_kwp: parseFloat(formData.capacidade) || 0,
          excedente_mensal_kwh: parseFloat(formData.excedente) || 0,
          concessionaria: formData.concessionaria,
          cidade: formData.cidade,
          estado: formData.estado,
          status: 'pendente'
        }, { onConflict: 'id' });

        setSuccess(true);
        setTimeout(() => router.push('/login?cadastro=sucesso&from=gerador'), 3000);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Cadastro realizado!</h1>
          <p className="text-slate-400 mb-4">Redirecionando para a página inicial...</p>
          <Link href="/login" className="text-emerald-400 hover:text-emerald-300 transition text-sm">
            Ir para o login →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-yellow-500 mb-6">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>

        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sun className="w-8 h-8 text-yellow-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Cadastro de Gerador</h1>
            <p className="text-slate-400 text-sm">Monetize o excedente da sua usina solar</p>
            <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-[10px] font-bold">
              <Building className="w-3 h-3" /> Concessões renovadas por 30 anos
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <input type="text" placeholder="Nome completo" value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition" required />
              <input type="email" placeholder="E-mail" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition" required />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <input type="tel" placeholder="WhatsApp (com DDD)" value={formData.whatsapp} onChange={(e) => setFormData({...formData, whatsapp: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition" required />
              <input type="password" placeholder="Senha (mínimo 6 caracteres)" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition" required minLength={6} />
            </div>

            <input type="text" placeholder="Nome da usina" value={formData.nome_usina} onChange={(e) => setFormData({...formData, nome_usina: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition" required />

            <div className="grid md:grid-cols-2 gap-4">
              <input type="number" placeholder="Capacidade (kWp)" value={formData.capacidade} onChange={(e) => {
                setFormData({...formData, capacidade: e.target.value});
                if (e.target.value && !formData.excedente) {
                  setFormData(prev => ({...prev, excedente: (parseFloat(e.target.value) * 140).toString()}));
                }
              }} className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition" required />
              <input type="number" placeholder="Excedente (kWh/mês)" value={formData.excedente} onChange={(e) => setFormData({...formData, excedente: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition" required />
            </div>

            <select value={formData.concessionaria} onChange={(e) => handleConcessionariaChange(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition" required>
              <option value="">Selecione a concessionária</option>
              {CONCESSIONARIAS.map((c) => (
                <option key={c.nome} value={c.nome}>
                  {c.nome} ({c.estado}) - {c.regiao}
                </option>
              ))}
            </select>

            <div className="grid md:grid-cols-2 gap-4">
              <input type="text" placeholder="Cidade" value={formData.cidade} onChange={(e) => setFormData({...formData, cidade: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition" required />
              <input type="text" placeholder="Estado (sigla)" maxLength={2} value={formData.estado} onChange={(e) => setFormData({...formData, estado: e.target.value.toUpperCase()})} className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition" required />
            </div>

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-900 rounded-xl font-bold hover:from-yellow-400 hover:to-amber-400 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Cadastrar e Começar a Lucrar'}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center flex flex-wrap items-center justify-center gap-4 text-[10px] text-slate-500">
          <div className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-yellow-500" /> Dados Protegidos (LGPD)</div>
          <div className="flex items-center gap-1"><Building className="w-3 h-3 text-yellow-500" /> Concessões renovadas até 2056</div>
          <div className="flex items-center gap-1"><Zap className="w-3 h-3 text-yellow-500" /> Energia 100% Limpa</div>
        </div>
      </div>
    </div>
  );
}