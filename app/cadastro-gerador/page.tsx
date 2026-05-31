'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Zap, DollarSign, ShieldCheck, Crown, Loader2, Sun, MapPin, Building } from 'lucide-react';

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
        const { error: geradorError } = await supabase.from('geradores').insert({
          id: authData.user.id,
          nome_usina: formData.nome_usina,
          capacidade_kwp: parseFloat(formData.capacidade),
          excedente_mensal_kwh: parseFloat(formData.excedente),
          concessionaria: formData.concessionaria,
          cidade: formData.cidade,
          estado: formData.estado,
          status: 'pendente'
        });

        if (geradorError) console.error('Erro ao salvar gerador:', geradorError);

        // 3. Salvar lead
        await supabase.from('leads').insert({
          nome: formData.nome,
          email: formData.email,
          whatsapp: formData.whatsapp,
          tipo: 'gerador',
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

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-6">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-yellow-500 mb-6">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
          <div className="w-16 h-16 bg-yellow-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sun className="w-8 h-8 text-yellow-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Cadastro de Gerador</h1>
          <p className="text-slate-400 text-sm">Preencha os dados abaixo para começar</p>
        </div>

        {/* Formulário */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Dados Pessoais */}
            <div className="border-b border-white/10 pb-4 mb-2">
              <h2 className="text-white font-bold mb-3">Seus dados</h2>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Nome completo"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white"
                  required
                />
                <input
                  type="email"
                  placeholder="E-mail"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white"
                  required
                />
                <input
                  type="tel"
                  placeholder="WhatsApp (com DDD)"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white"
                  required
                />
                <input
                  type="password"
                  placeholder="Senha (mínimo 6 caracteres)"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Dados da Usina */}
            <div className="border-b border-white/10 pb-4 mb-2">
              <h2 className="text-white font-bold mb-3">Sua usina</h2>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Nome da usina"
                  value={formData.nome_usina}
                  onChange={(e) => setFormData({...formData, nome_usina: e.target.value})}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white"
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Capacidade (kWp)"
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
                  <input
                    type="number"
                    placeholder="Excedente (kWh/mês)"
                    value={formData.excedente}
                    onChange={(e) => setFormData({...formData, excedente: e.target.value})}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white"
                    required
                  />
                </div>
                <select
                  value={formData.concessionaria}
                  onChange={(e) => setFormData({...formData, concessionaria: e.target.value})}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white"
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
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Cidade"
                    value={formData.cidade}
                    onChange={(e) => setFormData({...formData, cidade: e.target.value})}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Estado (sigla)"
                    value={formData.estado}
                    onChange={(e) => setFormData({...formData, estado: e.target.value.toUpperCase()})}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Projeção de Lucro */}
            {formData.excedente && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-amber-500/5 border border-yellow-500/30 text-center">
                <p className="text-sm text-slate-400">Lucro mensal estimado</p>
                <p className="text-2xl font-bold text-yellow-400">
                  R$ {(parseFloat(formData.excedente) * 0.34).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[10px] text-slate-500">*após taxa da plataforma</p>
              </div>
            )}

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-900 rounded-xl font-bold hover:from-yellow-400 hover:to-amber-400 transition disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Cadastrar e Começar'}
            </button>
          </form>
        </div>

        {/* Selos */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-4 text-[10px] text-slate-500">
            <div className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-yellow-500" /> Dados Protegidos</div>
            <div className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-yellow-500" /> Regulado ANEEL</div>
          </div>
        </div>
      </div>
    </div>
  );
}