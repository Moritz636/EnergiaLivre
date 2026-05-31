'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Zap, Loader2, ShieldCheck, Sun, MapPin, Building, CheckCircle2 } from 'lucide-react';

// Lista completa de concessionárias atualizada Maio/2026
const CONCESSIONARIAS = [
  // Neoenergia
  { nome: "Neoenergia Cosern", estado: "RN", regiao: "Nordeste", grupo: "Neoenergia" },
  { nome: "Neoenergia Coelba", estado: "BA", regiao: "Nordeste", grupo: "Neoenergia" },
  { nome: "Neoenergia Elektro", estado: "SP/MS", regiao: "Sudeste", grupo: "Neoenergia" },
  { nome: "Neoenergia Pernambuco", estado: "PE", regiao: "Nordeste", grupo: "Neoenergia" },
  // CPFL
  { nome: "CPFL Paulista", estado: "SP", regiao: "Sudeste", grupo: "CPFL" },
  { nome: "CPFL Piratininga", estado: "SP", regiao: "Sudeste", grupo: "CPFL" },
  { nome: "RGE Sul", estado: "RS", regiao: "Sul", grupo: "CPFL" },
  // EDP
  { nome: "EDP São Paulo", estado: "SP", regiao: "Sudeste", grupo: "EDP" },
  { nome: "EDP Espírito Santo", estado: "ES", regiao: "Sudeste", grupo: "EDP" },
  // Light
  { nome: "Light", estado: "RJ", regiao: "Sudeste", grupo: "Light" },
  // Energisa
  { nome: "Energisa Paraíba", estado: "PB", regiao: "Nordeste", grupo: "Energisa" },
  { nome: "Energisa Sergipe", estado: "SE", regiao: "Nordeste", grupo: "Energisa" },
  { nome: "Energisa Mato Grosso", estado: "MT", regiao: "Centro-Oeste", grupo: "Energisa" },
  { nome: "Energisa Mato Grosso do Sul", estado: "MS", regiao: "Centro-Oeste", grupo: "Energisa" },
  // Equatorial
  { nome: "Equatorial Maranhão", estado: "MA", regiao: "Nordeste", grupo: "Equatorial" },
  { nome: "Equatorial Pará", estado: "PA", regiao: "Norte", grupo: "Equatorial" },
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
  const supabase = createClient();

  const handleConcessionariaChange = (value: string) => {
    const selected = CONCESSIONARIAS.find(c => c.nome === value);
    setFormData({
      ...formData,
      concessionaria: value,
      estado: selected?.estado || ''
    });
  };

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
          concessionaria: formData.concessionaria,
          capacidade: formData.capacidade,
          estado: formData.estado,
          status: 'pendente'
        });

        setSuccess(true);
        setTimeout(() => router.push('/'), 3000);
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Cadastro realizado!</h1>
          <p className="text-slate-400">Redirecionando para a página inicial...</p>
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
              <Building className="w-3 h-3" /> Concessionárias renovadas por 30 anos
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <input type="text" placeholder="Nome completo" value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white" required />
              <input type="email" placeholder="E-mail" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white" required />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <input type="tel" placeholder="WhatsApp (com DDD)" value={formData.whatsapp} onChange={(e) => setFormData({...formData, whatsapp: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white" required />
              <input type="password" placeholder="Senha (mínimo 6 caracteres)" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white" required minLength={6} />
            </div>

            <input type="text" placeholder="Nome da usina" value={formData.nome_usina} onChange={(e) => setFormData({...formData, nome_usina: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white" required />

            <div className="grid md:grid-cols-2 gap-4">
              <input type="number" placeholder="Capacidade (kWp)" value={formData.capacidade} onChange={(e) => {
                setFormData({...formData, capacidade: e.target.value});
                if (e.target.value && !formData.excedente) {
                  setFormData(prev => ({...prev, excedente: (parseFloat(e.target.value) * 140).toString()}));
                }
              }} className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white" required />
              <input type="number" placeholder="Excedente (kWh/mês)" value={formData.excedente} onChange={(e) => setFormData({...formData, excedente: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white" required />
            </div>

            <select value={formData.concessionaria} onChange={(e) => handleConcessionariaChange(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white" required>
              <option value="">Selecione a concessionária</option>
              {CONCESSIONARIAS.map((c) => (
                <option key={c.nome} value={c.nome}>
                  {c.nome} ({c.estado}) - {c.regiao}
                </option>
              ))}
            </select>

            <div className="grid md:grid-cols-2 gap-4">
              <input type="text" placeholder="Cidade" value={formData.cidade} onChange={(e) => setFormData({...formData, cidade: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white" required />
              <input type="text" placeholder="Estado (sigla)" value={formData.estado} onChange={(e) => setFormData({...formData, estado: e.target.value.toUpperCase()})} className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white" required />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-900 rounded-xl font-bold hover:from-yellow-400 hover:to-amber-400 transition disabled:opacity-50">
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Cadastrar e Começar a Lucrar'}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center flex flex-wrap items-center justify-center gap-4 text-[10px] text-slate-500">
          <div className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-yellow-500" /> Dados Protegidos (LGPD)</div>
          <div className="flex items-center gap-1"><Building className="w-3 h-3 text-yellow-500" /> Concessões renovadas até 2056</div>
        </div>
      </div>
    </div>
  );
}