'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Zap, Loader2, ShieldCheck, Sun, Building, CheckCircle2, AlertCircle } from 'lucide-react';

// Lista completa de concessionárias
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

    // Validações básicas
    if (!formData.email || !formData.password || !formData.nome) {
      setError('Preencha todos os campos obrigatórios');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      console.log('1. Tentando criar usuário:', formData.email);

      // 1. Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { 
          data: { 
            nome: formData.nome, 
            tipo: 'gerador' 
          } 
        }
      });

      if (authError) {
        console.error('Erro Auth:', authError);
        throw new Error(authError.message);
      }

      console.log('2. Usuário criado:', authData.user?.id);

      if (authData.user) {
        // 2. Salvar na tabela leads
        const { error: leadError } = await supabase
          .from('leads')
          .insert({
            nome: formData.nome,
            email: formData.email,
            whatsapp: formData.whatsapp,
            tipo: 'gerador',
            concessionaria: formData.concessionaria,
            capacidade: formData.capacidade,
            estado: formData.estado,
            cidade: formData.cidade,
            status: 'pendente'
          });

        if (leadError) {
          console.error('Erro ao salvar lead:', leadError);
        } else {
          console.log('3. Lead salvo com sucesso');
        }

        // 3. Salvar na tabela geradores
        const { error: geradorError } = await supabase
          .from('geradores')
          .insert({
            id: authData.user.id,
            nome_usina: formData.nome_usina,
            capacidade_kwp: parseFloat(formData.capacidade) || 0,
            excedente_mensal_kwh: parseFloat(formData.excedente) || 0,
            concessionaria: formData.concessionaria,
            cidade: formData.cidade,
            estado: formData.estado,
            status: 'pendente'
          });

        if (geradorError) {
          console.error('Erro ao salvar gerador:', geradorError);
        } else {
          console.log('4. Gerador salvo com sucesso');
        }

        setSuccess(true);
        
        // Redirecionar após 3 segundos
        setTimeout(() => {
          router.push('/');
        }, 3000);
      }
    } catch (err: any) {
      console.error('Erro completo:', err);
      setError(err.message || 'Erro ao realizar cadastro. Tente novamente.');
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
          <Link href="/" className="text-emerald-400 hover:text-emerald-300 transition text-sm">
            Ir agora →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-yellow-500 mb-6 transition">
          <ArrowLeft className="w-4 h-4" /> Voltar ao início
        </Link>

        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6">
          
          {/* Cabeçalho Persuasivo */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sun className="w-8 h-8 text-yellow-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Transforme Sol em Dinheiro</h1>
            <p className="text-slate-400 text-sm mt-1">Cadastre sua usina e monetize o excedente</p>
            <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-[10px] font-bold">
              <Building className="w-3 h-3" /> Concessões renovadas por 30 anos
            </div>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-xs mb-1">Nome completo *</label>
                <input 
                  type="text" 
                  placeholder="Ex: João Silva" 
                  value={formData.nome} 
                  onChange={(e) => setFormData({...formData, nome: e.target.value})} 
                  className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-slate-600 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition" 
                  required 
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs mb-1">E-mail *</label>
                <input 
                  type="email" 
                  placeholder="seu@email.com" 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-slate-600 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition" 
                  required 
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-xs mb-1">WhatsApp (com DDD) *</label>
                <input 
                  type="tel" 
                  placeholder="Ex: 84999999999" 
                  value={formData.whatsapp} 
                  onChange={(e) => setFormData({...formData, whatsapp: e.target.value})} 
                  className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-slate-600 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition" 
                  required 
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs mb-1">Senha *</label>
                <input 
                  type="password" 
                  placeholder="Mínimo 6 caracteres" 
                  value={formData.password} 
                  onChange={(e) => setFormData({...formData, password: e.target.value})} 
                  className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-slate-600 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition" 
                  required 
                  minLength={6} 
                />
                <p className="text-[10px] text-slate-500 mt-1">Sua senha será usada para acessar o dashboard</p>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-xs mb-1">Nome da usina *</label>
              <input 
                type="text" 
                placeholder="Ex: Usina Solar do Seridó" 
                value={formData.nome_usina} 
                onChange={(e) => setFormData({...formData, nome_usina: e.target.value})} 
                className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-slate-600 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition" 
                required 
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-xs mb-1">Capacidade (kWp) *</label>
                <input 
                  type="number" 
                  placeholder="Ex: 150" 
                  value={formData.capacidade} 
                  onChange={(e) => {
                    setFormData({...formData, capacidade: e.target.value});
                    if (e.target.value && !formData.excedente) {
                      setFormData(prev => ({...prev, excedente: (parseFloat(e.target.value) * 140).toString()}));
                    }
                  }} 
                  className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-slate-600 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition" 
                  required 
                />
                <p className="text-[10px] text-slate-500 mt-1">1 kWp gera ~140 kWh/mês no Nordeste</p>
              </div>
              <div>
                <label className="block text-slate-400 text-xs mb-1">Excedente (kWh/mês) *</label>
                <input 
                  type="number" 
                  placeholder="Ex: 21000" 
                  value={formData.excedente} 
                  onChange={(e) => setFormData({...formData, excedente: e.target.value})} 
                  className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-slate-600 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition" 
                  required 
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-xs mb-1">Concessionária *</label>
              <select 
                value={formData.concessionaria} 
                onChange={(e) => handleConcessionariaChange(e.target.value)} 
                className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition" 
                required
              >
                <option value="">Selecione a concessionária</option>
                {CONCESSIONARIAS.map((c) => (
                  <option key={c.nome} value={c.nome}>
                    {c.nome} ({c.estado}) - {c.regiao}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-xs mb-1">Cidade *</label>
                <input 
                  type="text" 
                  placeholder="Ex: Natal" 
                  value={formData.cidade} 
                  onChange={(e) => setFormData({...formData, cidade: e.target.value})} 
                  className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-slate-600 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition" 
                  required 
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs mb-1">Estado (sigla) *</label>
                <input 
                  type="text" 
                  placeholder="Ex: RN" 
                  maxLength={2}
                  value={formData.estado} 
                  onChange={(e) => setFormData({...formData, estado: e.target.value.toUpperCase()})} 
                  className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-slate-600 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition" 
                  required 
                />
              </div>
            </div>

            {/* Projeção de Lucro (Lei 32 - Explore os Sonhos) */}
            {formData.excedente && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-amber-500/5 border border-yellow-500/30 text-center">
                <p className="text-xs text-slate-400">💰 Lucro mensal estimado</p>
                <p className="text-xl font-bold text-yellow-400">
                  R$ {(parseFloat(formData.excedente) * 0.34).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[10px] text-slate-500">*após taxa da plataforma</p>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-900 rounded-xl font-bold hover:from-yellow-400 hover:to-amber-400 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Cadastrar e Começar a Lucrar'}
            </button>
          </form>
        </div>

        {/* Selos de Confiança */}
        <div className="mt-6 text-center flex flex-wrap items-center justify-center gap-4 text-[10px] text-slate-500">
          <div className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-yellow-500" /> Dados Protegidos (LGPD)</div>
          <div className="flex items-center gap-1"><Building className="w-3 h-3 text-yellow-500" /> Concessões renovadas até 2056</div>
          <div className="flex items-center gap-1"><Zap className="w-3 h-3 text-yellow-500" /> Energia 100% Limpa</div>
        </div>
      </div>
    </div>
  );
}