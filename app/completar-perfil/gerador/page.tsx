'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Zap, MapPin, DollarSign, Sun, Battery, Loader2, TrendingUp, AlertCircle } from 'lucide-react';

// Lista completa de concessionárias do Brasil
const CONCESSIONARIAS = [
  { nome: "Neoenergia Cosern", estado: "RN", regiao: "Nordeste", grupo: "Neoenergia" },
  { nome: "Neoenergia Coelba", estado: "BA", regiao: "Nordeste", grupo: "Neoenergia" },
  { nome: "Neoenergia Elektro", estado: "SP/MS", regiao: "Sudeste/Centro-Oeste", grupo: "Neoenergia" },
  { nome: "Neoenergia Pernambuco", estado: "PE", regiao: "Nordeste", grupo: "Neoenergia" },
  { nome: "CPFL Paulista", estado: "SP", regiao: "Sudeste", grupo: "CPFL" },
  { nome: "CPFL Piratininga", estado: "SP", regiao: "Sudeste", grupo: "CPFL" },
  { nome: "EDP São Paulo", estado: "SP", regiao: "Sudeste", grupo: "EDP" },
  { nome: "Light", estado: "RJ", regiao: "Sudeste", grupo: "Light" },
  { nome: "Energisa Paraíba", estado: "PB", regiao: "Nordeste", grupo: "Energisa" },
  { nome: "Energisa Sergipe", estado: "SE", regiao: "Nordeste", grupo: "Energisa" },
  { nome: "Energisa Mato Grosso", estado: "MT", regiao: "Centro-Oeste", grupo: "Energisa" },
  { nome: "Energisa Mato Grosso do Sul", estado: "MS", regiao: "Centro-Oeste", grupo: "Energisa" },
  { nome: "Equatorial Maranhão", estado: "MA", regiao: "Nordeste", grupo: "Equatorial" },
  { nome: "Equatorial Pará", estado: "PA", regiao: "Norte", grupo: "Equatorial" },
  { nome: "RGE Sul", estado: "RS", regiao: "Sul", grupo: "CPFL" },
  { nome: "Cemig", estado: "MG", regiao: "Sudeste", grupo: "Cemig" },
  { nome: "Copel", estado: "PR", regiao: "Sul", grupo: "Copel" },
  { nome: "CEEE", estado: "RS", regiao: "Sul", grupo: "CEEE" },
];

export default function CompletarPerfilGerador() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nome_usina: '',
    capacidade_kwp: '',
    excedente_mensal_kwh: '',
    preco_por_kwh: '0.34',
    concessionaria: 'Neoenergia Cosern',
    cidade: '',
    estado: 'RN',
    cep: ''
  });

  // Buscar estado automaticamente ao mudar concessionária
  const handleConcessionariaChange = (concessionariaNome: string) => {
    const selected = CONCESSIONARIAS.find(c => c.nome === concessionariaNome);
    setFormData({
      ...formData,
      concessionaria: concessionariaNome,
      estado: selected?.estado || ''
    });
  };

  // Projeção automática de excedente baseado na capacidade
  const excedenteProjetado = formData.capacidade_kwp ? 
    Math.round(parseFloat(formData.capacidade_kwp) * 140) : 0;

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!data.user) {
        router.push('/login');
      } else {
        setUser(data.user);
        await carregarPerfilExistente(data.user.id);
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const carregarPerfilExistente = async (userId: string) => {
    const { data } = await supabase
      .from('geradores')
      .select('*')
      .eq('id', userId)
      .single();

    if (data) {
      setFormData({
        nome_usina: data.nome_usina || '',
        capacidade_kwp: data.capacidade_kwp || '',
        excedente_mensal_kwh: data.excedente_mensal_kwh || '',
        preco_por_kwh: data.preco_por_kwh || '0.34',
        concessionaria: data.concessionaria || 'Neoenergia Cosern',
        cidade: data.cidade || '',
        estado: data.estado || 'RN',
        cep: data.cep || ''
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await supabase
        .from('profiles')
        .update({ tipo: 'gerador', nome: user.email?.split('@')[0] })
        .eq('id', user.id);

      const excedenteFinal = parseFloat(formData.excedente_mensal_kwh) || excedenteProjetado;

      const { error } = await supabase
        .from('geradores')
        .upsert({
          id: user.id,
          nome_usina: formData.nome_usina,
          capacidade_kwp: parseFloat(formData.capacidade_kwp),
          excedente_mensal_kwh: excedenteFinal,
          preco_por_kwh: parseFloat(formData.preco_por_kwh),
          concessionaria: formData.concessionaria,
          cidade: formData.cidade,
          estado: formData.estado,
          cep: formData.cep,
          status: 'disponivel'
        });

      if (error) throw error;

      await supabase.from('leads').insert({
        nome: formData.nome_usina,
        email: user.email,
        tipo: 'gerador',
        capacidade: formData.capacidade_kwp,
        estado: formData.estado,
        cidade: formData.cidade,
        concessionaria: formData.concessionaria,
        status: 'pendente'
      });

      router.push('/dashboard-gerador');
    } catch (error) {
      alert('Erro ao salvar perfil. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  // Cálculo do faturamento mensal projetado
  const excedenteFinal = parseFloat(formData.excedente_mensal_kwh) || excedenteProjetado;
  const faturamentoBruto = excedenteFinal * parseFloat(formData.preco_por_kwh);
  const taxaPlataforma = faturamentoBruto * 0.08;
  const faturamentoLiquido = faturamentoBruto - taxaPlataforma;

  const selectedConcessionaria = CONCESSIONARIAS.find(c => c.nome === formData.concessionaria);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-blue-400 mb-8 transition">
          <ArrowLeft className="w-4 h-4" /> Voltar ao Dashboard
        </Link>

        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sun className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">Complete seu perfil</h1>
            <p className="text-slate-400 mt-2">Como gerador de energia solar</p>
            <p className="text-slate-500 text-sm mt-1">Cadastre sua usina e comece a vender seu excedente em todo o Brasil</p>
          </div>

          {/* Info Box sobre o mercado de energia no Brasil */}
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/5 border border-blue-500/30">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-white">Mercado de Energia no Brasil</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Em 2026, as distribuidoras de energia renovaram suas concessões por mais 30 anos, garantindo estabilidade 
                  para o setor [citation:6]. O reajuste tarifário médio da Neoenergia Cosern foi de <strong className="text-blue-400">5,40%</strong>, 
                  com impacto de <strong className="text-blue-400">3,74% para residências</strong> [citation:1][citation:7].
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  💡 A energia solar se torna ainda mais competitiva com o aumento das tarifas. Seu preço de venda de R$ {formData.preco_por_kwh}/kWh 
                  representa uma economia de até 60% para o consumidor final!
                </p>
              </div>
            </div>
          </div>

          {/* Aviso sobre Lei 14.300/2022 */}
          <div className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-white">Marco Legal da Geração Distribuída</h3>
                <p className="text-xs text-slate-400 mt-1">
                  A <strong className="text-yellow-400">Lei 14.300/2022</strong> regulamenta a compensação de créditos de energia solar em todo o Brasil.
                  Seu excedente pode ser compartilhado com consumidores da mesma concessionária, gerando créditos na fatura do consumidor final.
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  ✅ Benefícios para o consumidor: economia de até 32% na conta de luz.<br />
                  ✅ Benefícios para você: monetização do excedente que seria desperdiçado.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-slate-400 text-sm mb-2">Nome da usina *</label>
                <div className="relative">
                  <Sun className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Ex: Usina Solar do Seridó"
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                    value={formData.nome_usina}
                    onChange={(e) => setFormData({...formData, nome_usina: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-2">Capacidade (kWp) *</label>
                <div className="relative">
                  <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="number"
                    step="10"
                    placeholder="Ex: 150"
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                    value={formData.capacidade_kwp}
                    onChange={(e) => {
                      setFormData({...formData, capacidade_kwp: e.target.value});
                      if (!formData.excedente_mensal_kwh && e.target.value) {
                        const capacidade = parseFloat(e.target.value);
                        if (!isNaN(capacidade)) {
                          setFormData(prev => ({
                            ...prev,
                            excedente_mensal_kwh: Math.round(capacidade * 140).toString()
                          }));
                        }
                      }
                    }}
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">1 kWp gera em média 120-160 kWh por mês (dependendo da região)</p>
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-2">Excedente mensal (kWh) *</label>
                <div className="relative">
                  <Battery className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="number"
                    placeholder={`Ex: ${excedenteProjetado || 2500}`}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                    value={formData.excedente_mensal_kwh}
                    onChange={(e) => setFormData({...formData, excedente_mensal_kwh: e.target.value})}
                    required
                  />
                </div>
                {formData.capacidade_kwp && !formData.excedente_mensal_kwh && (
                  <p className="text-[10px] text-blue-400 mt-1">
                    Sugestão: {excedenteProjetado} kWh (baseado na capacidade informada)
                  </p>
                )}
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-2">Preço por kWh (R$) *</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ex: 0.34"
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                    value={formData.preco_por_kwh}
                    onChange={(e) => setFormData({...formData, preco_por_kwh: e.target.value})}
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  💡 Recomendação: R$ 0,32 a R$ 0,36 por kWh. Com reajustes tarifários em 2026, a economia para o consumidor pode chegar a 60% .
                </p>
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-2">Concessionária *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <select
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                    value={formData.concessionaria}
                    onChange={(e) => handleConcessionariaChange(e.target.value)}
                    required
                  >
                    {CONCESSIONARIAS.map((c) => (
                      <option key={c.nome} value={c.nome}>
                        {c.nome} ({c.estado}) - {c.regiao}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  {selectedConcessionaria?.grupo} atende {selectedConcessionaria?.estado} - {selectedConcessionaria?.regiao}
                </p>
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-2">CEP</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Ex: 59000-000"
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                    value={formData.cep}
                    onChange={(e) => setFormData({...formData, cep: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-2">Cidade *</label>
                <input
                  type="text"
                  placeholder="Ex: Natal"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                  value={formData.cidade}
                  onChange={(e) => setFormData({...formData, cidade: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-2">Estado *</label>
                <input
                  type="text"
                  placeholder="Ex: RN"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                  value={formData.estado}
                  onChange={(e) => setFormData({...formData, estado: e.target.value.toUpperCase()})}
                  required
                />
                <p className="text-[10px] text-slate-500 mt-1">Preenchido automaticamente ao selecionar a concessionária</p>
              </div>
            </div>

            {/* Resumo da projeção de lucro */}
            {excedenteFinal > 0 && (
              <div className="p-5 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/5 border border-blue-500/30">
                <h3 className="text-sm font-bold text-white mb-3">📊 Projeção de faturamento mensal</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400">Excedente mensal</p>
                    <p className="text-xl font-bold text-white">{excedenteFinal.toLocaleString('pt-BR')} kWh</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Valor por kWh</p>
                    <p className="text-xl font-bold text-white">R$ {parseFloat(formData.preco_por_kwh).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Faturamento bruto</p>
                    <p className="text-xl font-bold text-blue-400">R$ {faturamentoBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Taxa plataforma (8%)</p>
                    <p className="text-sm text-yellow-400">- R$ {taxaPlataforma.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-white/10">
                    <p className="text-sm text-slate-400">💰 Faturamento líquido estimado</p>
                    <p className="text-2xl font-bold text-emerald-400">R$ {faturamentoLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    <p className="text-[10px] text-slate-500 mt-1">*Valores sujeitos a variação conforme demanda e consumo real</p>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-slate-900 rounded-xl font-bold hover:from-blue-400 hover:to-cyan-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Salvando...' : 'Salvar e continuar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}