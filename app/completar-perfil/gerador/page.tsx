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
  Award,
  Loader2,
  Sun,
  Battery,
  MapPin,
  Building,
  FileText,
  Upload,
  Clock,
  Users,
  TrendingUp
} from 'lucide-react';

export default function CompletarPerfilGeradorPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    // Dados Pessoais
    nome: '',
    email: '',
    whatsapp: '',
    password: '',
    // Dados da Usina
    nome_usina: '',
    capacidade: '',
    excedente: '',
    concessionaria: '',
    cidade: '',
    estado: '',
    cep: '',
    // Documentação
    documento: null as File | null,
    comprovante: null as File | null
  });

  const router = useRouter();
  const supabase = createClient();

  const handleNext = () => setStep(step + 1);
  const handlePrev = () => setStep(step - 1);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'documento' | 'comprovante') => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, [field]: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
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

      if (authError) throw new Error(authError.message);

      if (authData.user) {
        // 2. Salvar dados do gerador
        await supabase.from('geradores').insert({
          id: authData.user.id,
          nome_usina: formData.nome_usina,
          capacidade_kwp: parseFloat(formData.capacidade),
          excedente_mensal_kwh: parseFloat(formData.excedente),
          concessionaria: formData.concessionaria,
          cidade: formData.cidade,
          estado: formData.estado,
          cep: formData.cep,
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

        // 4. Redirecionar para o dashboard
        router.push('/dashboard-gerador');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const faturamentoEstimado = parseFloat(formData.excedente || '0') * 0.34;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0a0f2a] to-[#020617] text-slate-200 font-sans">
      
      {/* Efeitos de fundo */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-yellow-500/5 via-transparent to-transparent -z-20" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-yellow-500/5 rounded-full blur-[100px] -z-10" />

      {/* Navbar */}
      <nav className="border-b border-white/10 bg-[#020617]/80 backdrop-blur-xl fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-lg flex items-center justify-center">
              <Zap className="text-slate-900 w-4 h-4 fill-current" />
            </div>
            <span className="text-xl font-black text-white">ENERGIA<span className="text-yellow-500">LIVRE</span></span>
          </Link>
          <div className="text-sm text-slate-500">
            {step}/3 · Cadastro de Gerador
          </div>
        </div>
      </nav>

      <div className="pt-24 px-6 pb-20">
        <div className="max-w-3xl mx-auto">
          
          {/* Progresso */}
          <div className="mb-8">
            <div className="flex gap-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className={`flex-1 h-2 rounded-full transition-all duration-500 ${s <= step ? 'bg-gradient-to-r from-yellow-500 to-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-slate-800'}`} />
              ))}
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-2 px-1">
              <span className={step >= 1 ? "text-yellow-400" : ""}>📋 Dados da Usina</span>
              <span className={step >= 2 ? "text-yellow-400" : ""}>💰 Projeção</span>
              <span className={step >= 3 ? "text-yellow-400" : ""}>✅ Finalização</span>
            </div>
          </div>

          {/* STEP 1 - Dados da Usina */}
          {step === 1 && (
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-sm">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-yellow-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sun className="w-8 h-8 text-yellow-400" />
                </div>
                <h1 className="text-2xl font-bold text-white">Sua Usina Solar</h1>
                <p className="text-slate-400">Vamos começar conhecendo seu potencial de geração</p>
                <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-[10px] font-bold">
                  <Flame className="w-3 h-3" /> Vagas Prioritárias para sua região
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Nome da usina *</label>
                  <input
                    type="text"
                    placeholder="Ex: Usina Solar do Seridó"
                    value={formData.nome_usina}
                    onChange={(e) => setFormData({...formData, nome_usina: e.target.value})}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Capacidade (kWp) *</label>
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
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition"
                      required
                    />
                    <p className="text-[10px] text-slate-500 mt-1">1 kWp gera ~140 kWh/mês no RN</p>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Excedente mensal (kWh) *</label>
                    <input
                      type="number"
                      placeholder="Ex: 2500"
                      value={formData.excedente}
                      onChange={(e) => setFormData({...formData, excedente: e.target.value})}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-sm mb-2">Concessionária *</label>
                  <select
                    value={formData.concessionaria}
                    onChange={(e) => setFormData({...formData, concessionaria: e.target.value})}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition"
                    required
                  >
                    <option value="">Selecione a concessionária</option>
                    <option value="Neoenergia Cosern">Neoenergia Cosern (RN)</option>
                    <option value="Neoenergia Coelba">Neoenergia Coelba (BA)</option>
                    <option value="Neoenergia Elektro">Neoenergia Elektro (SP/MS)</option>
                    <option value="CPFL Paulista">CPFL Paulista (SP)</option>
                    <option value="Light">Light (RJ)</option>
                    <option value="Cemig">Cemig (MG)</option>
                    <option value="Equatorial">Equatorial (MA/PA)</option>
                  </select>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">CEP</label>
                    <input
                      type="text"
                      placeholder="Ex: 59000-000"
                      value={formData.cep}
                      onChange={(e) => setFormData({...formData, cep: e.target.value})}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Cidade *</label>
                    <input
                      type="text"
                      placeholder="Ex: Natal"
                      value={formData.cidade}
                      onChange={(e) => setFormData({...formData, cidade: e.target.value})}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Estado *</label>
                    <input
                      type="text"
                      placeholder="Ex: RN"
                      maxLength={2}
                      value={formData.estado}
                      onChange={(e) => setFormData({...formData, estado: e.target.value.toUpperCase()})}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Card de Escassez (Lei 16) */}
              <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-amber-500/5 border border-yellow-500/30">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-yellow-400 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Vagas Prioritárias Limitadas</h4>
                    <p className="text-xs text-slate-400">Apenas 12 vagas restantes para geradores na sua região este mês.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleNext}
                  disabled={!formData.nome_usina || !formData.capacidade || !formData.excedente || !formData.concessionaria}
                  className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-900 rounded-xl font-bold hover:from-yellow-400 hover:to-amber-400 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Continuar <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 - Projeção de Lucro + Documentos (Lei 32) */}
          {step === 2 && (
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-sm">
              <div className="text-center mb-8">
                <TrendingUp className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-white">Seu Potencial de Lucro</h1>
                <p className="text-slate-400">Veja quanto você pode ganhar por mês</p>
              </div>

              <div className="space-y-6">
                {/* Cards de Projeção */}
                <div className="p-6 rounded-2xl bg-gradient-to-r from-yellow-500/10 to-amber-500/5 border border-yellow-500/30">
                  <p className="text-sm text-slate-400 mb-1">Excedente mensal</p>
                  <p className="text-3xl font-bold text-white">{parseFloat(formData.excedente || '0').toLocaleString('pt-BR')} kWh</p>
                </div>
                <div className="p-6 rounded-2xl bg-gradient-to-r from-yellow-500/10 to-amber-500/5 border border-yellow-500/30">
                  <p className="text-sm text-slate-400 mb-1">Faturamento bruto estimado</p>
                  <p className="text-3xl font-bold text-yellow-400">R$ {faturamentoEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>

                {/* Seção de Documentos Persuasiva */}
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-white font-bold">Documentação Necessária</h3>
                  </div>
                  <p className="text-slate-400 text-sm mb-4">
                    Para agilizar a ativação e você começar a lucrar em até <strong className="text-yellow-400">48h</strong>, anexe os documentos:
                  </p>
                  
                  <div className="space-y-4">
                    <div className="border border-white/10 rounded-xl p-4 hover:border-yellow-500/50 transition">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <Upload className="w-5 h-5 text-yellow-400" />
                        <span className="text-sm text-white">CNPJ ou CPF do titular da usina</span>
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => handleFileChange(e, 'documento')}
                          accept=".pdf,.jpg,.png"
                        />
                        {formData.documento && <CheckCircle2 className="w-4 h-4 text-green-400 ml-auto" />}
                      </label>
                    </div>
                    <div className="border border-white/10 rounded-xl p-4 hover:border-yellow-500/50 transition">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <Upload className="w-5 h-5 text-yellow-400" />
                        <span className="text-sm text-white">Conta de luz da usina (última fatura)</span>
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => handleFileChange(e, 'comprovante')}
                          accept=".pdf,.jpg,.png"
                        />
                        {formData.comprovante && <CheckCircle2 className="w-4 h-4 text-green-400 ml-auto" />}
                      </label>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-500">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Seus documentos estão seguros. Análise em até 24h.</span>
                  </div>
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
                  className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-900 rounded-xl font-bold hover:from-yellow-400 hover:to-amber-400 transition flex items-center gap-2"
                >
                  Continuar <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 - Dados Pessoais e Finalização */}
          {step === 3 && (
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-sm">
              <div className="text-center mb-8">
                <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-white">Quase lá!</h1>
                <p className="text-slate-400">Preencha seus dados para finalizar o cadastro</p>
                <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-[10px] font-bold">
                  <Award className="w-3 h-3" /> Selo de Parceiro Estratégico
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Nome completo *</label>
                  <input
                    type="text"
                    placeholder="Ex: João Silva"
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">E-mail *</label>
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">WhatsApp (com DDD) *</label>
                  <input
                    type="tel"
                    placeholder="Ex: 84999999999"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Senha (mínimo 6 caracteres) *</label>
                  <input
                    type="password"
                    placeholder="••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition"
                    required
                    minLength={6}
                  />
                </div>

                {/* Resumo dos valores */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-amber-500/5 border border-yellow-500/30">
                  <p className="text-sm text-slate-400">Resumo do seu cadastro</p>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-slate-400">Capacidade:</span>
                    <span className="text-white">{formData.capacidade} kWp</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Excedente:</span>
                    <span className="text-white">{formData.excedente} kWh/mês</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Lucro estimado:</span>
                    <span className="text-yellow-400 font-bold">R$ {faturamentoEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês</span>
                  </div>
                </div>

                {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-900 rounded-xl font-bold hover:from-yellow-400 hover:to-amber-400 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Cadastrar e Começar a Lucrar'}
                </button>
              </form>

              <div className="flex justify-between mt-6">
                <button
                  onClick={handlePrev}
                  className="text-sm text-slate-500 hover:text-yellow-400 transition"
                >
                  ← Voltar
                </button>
              </div>
            </div>
          )}

          {/* Selos de Confiança */}
          <div className="mt-8 text-center">
            <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] text-slate-500">
              <div className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-yellow-500" /> Dados Protegidos (LGPD)</div>
              <div className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-yellow-500" /> Regulado pela ANEEL</div>
              <div className="flex items-center gap-1"><Award className="w-3 h-3 text-yellow-500" /> Plataforma Segura</div>
              <div className="flex items-center gap-1"><Users className="w-3 h-3 text-yellow-500" /> +2.400 Consumidores Ativos</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}