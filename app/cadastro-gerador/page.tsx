'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Zap, 
  DollarSign, 
  ShieldCheck, 
  Crown,
  Flame,
  CheckCircle2,
  TrendingUp,
  Award,
  Loader2,
  Sun,
  Battery,
  MapPin,
  Building,
  AlertCircle,
  Sparkles
} from 'lucide-react';

export default function CadastroGeradorPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome_usina: '',
    capacidade: '',
    excedente: '',
    preco: '0.34',
    concessionaria: '',
    cidade: '',
    estado: '',
    nome: '',
    email: '',
    whatsapp: '',
    password: ''
  });
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleNext = () => setStep(step + 1);
  const handlePrev = () => setStep(step - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Criar usuário no Supabase
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

      if (authError) throw new Error(authError.message);

      if (authData.user) {
        // 2. Salvar dados do gerador
        await supabase.from('geradores').upsert({
          id: authData.user.id,
          nome_usina: formData.nome_usina,
          capacidade_kwp: parseFloat(formData.capacidade),
          excedente_mensal_kwh: parseFloat(formData.excedente),
          preco_por_kwh: parseFloat(formData.preco),
          concessionaria: formData.concessionaria,
          cidade: formData.cidade,
          estado: formData.estado,
          status: 'pendente'
        });

        // 3. Salvar lead
        await supabase.from('leads').insert({
          nome: formData.nome,
          email: formData.email,
          whatsapp: formData.whatsapp,
          tipo: 'gerador',
          capacidade: formData.capacidade,
          estado: formData.estado,
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

  // Projeção de lucro baseada no excedente
  const faturamentoEstimado = parseFloat(formData.excedente || '0') * parseFloat(formData.preco);
  const taxaPlataforma = faturamentoEstimado * 0.08;
  const lucroLiquido = faturamentoEstimado - taxaPlataforma;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans">
      
      {/* Efeitos de fundo */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-yellow-500/5 via-transparent to-transparent -z-20" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-yellow-500/5 rounded-full blur-[100px] -z-10" />

      {/* Navbar */}
      <nav className="border-b border-white/10 bg-[#020617]/90 backdrop-blur-xl fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-lg flex items-center justify-center">
              <Zap className="text-slate-900 w-4 h-4 fill-current" />
            </div>
            <span className="text-xl font-black text-white">ENERGIA<span className="text-yellow-500">LIVRE</span></span>
          </Link>
          <div className="text-sm text-slate-500">
            {step}/3
          </div>
        </div>
      </nav>

      <div className="pt-24 px-6 pb-20">
        <div className="max-w-3xl mx-auto">
          
          {/* Progresso */}
          <div className="mb-8">
            <div className="flex gap-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className={`flex-1 h-2 rounded-full transition-all ${s <= step ? 'bg-gradient-to-r from-yellow-500 to-amber-500' : 'bg-slate-800'}`} />
              ))}
            </div>
          </div>

          {/* STEP 1 - Informações da Usina */}
          {step === 1 && (
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl p-8">
              <div className="text-center mb-8">
                <Sun className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-white">Sua Usina Solar</h1>
                <p className="text-slate-400">Vamos começar conhecendo seu potencial de geração</p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Nome da usina</label>
                  <input
                    type="text"
                    placeholder="Ex: Usina Solar do Seridó"
                    value={formData.nome_usina}
                    onChange={(e) => setFormData({...formData, nome_usina: e.target.value})}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white"
                    required
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Capacidade (kWp)</label>
                    <input
                      type="number"
                      placeholder="Ex: 150"
                      value={formData.capacidade}
                      onChange={(e) => {
                        setFormData({...formData, capacidade: e.target.value});
                        if (e.target.value && !formData.excedente) {
                          setFormData(prev => ({
                            ...prev,
                            excedente: (parseFloat(e.target.value) * 140).toString()
                          }));
                        }
                      }}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white"
                      required
                    />
                    <p className="text-[10px] text-slate-500 mt-1">No RN, 1 kWp gera ~140 kWh/mês</p>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Excedente mensal (kWh)</label>
                    <input
                      type="number"
                      placeholder="Ex: 2500"
                      value={formData.excedente}
                      onChange={(e) => setFormData({...formData, excedente: e.target.value})}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white"
                      required
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Preço por kWh (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.34"
                      value={formData.preco}
                      onChange={(e) => setFormData({...formData, preco: e.target.value})}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Concessionária</label>
                    <select
                      value={formData.concessionaria}
                      onChange={(e) => setFormData({...formData, concessionaria: e.target.value})}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white"
                      required
                    >
                      <option value="">Selecione</option>
                      <option value="Neoenergia Cosern">Neoenergia Cosern (RN)</option>
                      <option value="Neoenergia Coelba">Neoenergia Coelba (BA)</option>
                      <option value="Neoenergia Elektro">Neoenergia Elektro (SP/MS)</option>
                      <option value="CPFL Paulista">CPFL Paulista (SP)</option>
                      <option value="Light">Light (RJ)</option>
                      <option value="Cemig">Cemig (MG)</option>
                      <option value="Equatorial">Equatorial (MA/PA)</option>
                    </select>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Cidade</label>
                    <input
                      type="text"
                      placeholder="Ex: Natal"
                      value={formData.cidade}
                      onChange={(e) => setFormData({...formData, cidade: e.target.value})}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Estado</label>
                    <select
                      value={formData.estado}
                      onChange={(e) => setFormData({...formData, estado: e.target.value})}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white"
                      required
                    >
                      <option value="">Selecione</option>
                      <option value="RN">Rio Grande do Norte</option>
                      <option value="BA">Bahia</option>
                      <option value="SP">São Paulo</option>
                      <option value="RJ">Rio de Janeiro</option>
                      <option value="MG">Minas Gerais</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleNext}
                  disabled={!formData.nome_usina || !formData.capacidade || !formData.excedente}
                  className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-900 rounded-xl font-bold hover:from-yellow-400 hover:to-amber-400 transition disabled:opacity-50"
                >
                  Continuar <ArrowRight className="w-4 h-4 inline ml-2" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 - Projeção de Lucro (Lei 32: Explore os Sonhos) */}
          {step === 2 && (
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl p-8">
              <div className="text-center mb-8">
                <TrendingUp className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-white">Seu Lucro Estimado</h1>
                <p className="text-slate-400">Veja quanto você pode ganhar por mês</p>
              </div>

              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-gradient-to-r from-yellow-500/10 to-amber-500/5 border border-yellow-500/30">
                  <p className="text-sm text-slate-400 mb-1">Excedente mensal</p>
                  <p className="text-3xl font-bold text-white">{parseFloat(formData.excedente || '0').toLocaleString('pt-BR')} kWh</p>
                </div>
                <div className="p-6 rounded-2xl bg-gradient-to-r from-yellow-500/10 to-amber-500/5 border border-yellow-500/30">
                  <p className="text-sm text-slate-400 mb-1">Faturamento bruto</p>
                  <p className="text-3xl font-bold text-yellow-400">R$ {faturamentoEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-sm text-slate-400 mb-1">Taxa da plataforma (8%)</p>
                  <p className="text-xl text-red-400">- R$ {taxaPlataforma.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-green-500/5 border border-emerald-500/30">
                  <p className="text-sm text-slate-400 mb-1">💰 Seu lucro líquido mensal</p>
                  <p className="text-3xl font-bold text-emerald-400">R$ {lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <p className="text-[10px] text-slate-500 mt-2">*Valor estimado, sujeito à demanda real</p>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={handlePrev}
                  className="px-8 py-3 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700 transition"
                >
                  Voltar
                </button>
                <button
                  onClick={handleNext}
                  className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-900 rounded-xl font-bold hover:from-yellow-400 hover:to-amber-400 transition"
                >
                  Continuar <ArrowRight className="w-4 h-4 inline ml-2" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 - Seus Dados e Cadastro */}
          {step === 3 && (
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl p-8">
              <div className="text-center mb-8">
                <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-white">Quase lá!</h1>
                <p className="text-slate-400">Preencha seus dados para finalizar o cadastro</p>
                <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-[10px] font-bold">
                  <Flame className="w-3 h-3" /> Últimas vagas para sua região
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Seu nome completo</label>
                  <input
                    type="text"
                    placeholder="Ex: João Silva"
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">E-mail</label>
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">WhatsApp (com DDD)</label>
                  <input
                    type="tel"
                    placeholder="Ex: 84999999999"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Senha (mínimo 6 caracteres)</label>
                  <input
                    type="password"
                    placeholder="••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white"
                    required
                    minLength={6}
                  />
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-900 rounded-xl font-bold hover:from-yellow-400 hover:to-amber-400 transition disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Cadastrar e Começar a Lucrar'}
                </button>
              </form>

              <div className="mt-6 flex justify-between">
                <button
                  onClick={handlePrev}
                  className="text-sm text-slate-500 hover:text-yellow-400 transition"
                >
                  ← Voltar
                </button>
              </div>
            </div>
          )}

          {/* Selos de confiança */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center gap-6 text-[10px] text-slate-500">
              <div className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-yellow-500" /> Dados Protegidos (LGPD)</div>
              <div className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-yellow-500" /> Regulado pela ANEEL</div>
              <div className="flex items-center gap-1"><Award className="w-3 h-3 text-yellow-500" /> Plataforma Segura</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}