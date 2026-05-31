'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Zap, User, Briefcase, Loader2, CheckCircle, Shield, Award, Sparkles } from 'lucide-react';

export default function CadastroPage() {
  const [tipo, setTipo] = useState<'consumidor' | 'gerador' | null>(null);
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [cidade, setCidade] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      // 1. Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            nome: nome,
            tipo: tipo,
            whatsapp: whatsapp,
            cidade: cidade
          }
        }
      });

      if (authError) throw new Error(authError.message);

      if (authData.user) {
        // 2. Salvar na tabela leads
        await supabase.from('leads').insert({
          nome: nome,
          email: email,
          whatsapp: whatsapp,
          cidade: cidade,
          tipo: tipo,
          status: 'pendente'
        });

        setSuccess(true);
        
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl p-8 text-center">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Cadastro realizado!</h1>
          <p className="text-slate-400 mb-4">
            Sua conta foi criada com sucesso. Você será redirecionado para o login.
          </p>
          <Link href="/login" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition">
            Ir para o login <ArrowLeft className="w-4 h-4 rotate-180" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] to-[#0a122e] flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
        
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition mb-6">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">Criar Conta</h1>
          <p className="text-slate-400 text-sm mt-1">Junte-se à revolução da energia solar</p>
        </div>

        {!tipo ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <span className="text-xs text-slate-500 uppercase tracking-wider">Escolha seu perfil</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>
            
            <button
              onClick={() => setTipo('consumidor')}
              className="w-full p-6 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/30 rounded-2xl text-center hover:bg-emerald-500/20 transition-all group hover:scale-[1.02]"
            >
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition">
                <User className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition">💰 Consumidor</h3>
              <p className="text-slate-400 text-sm mt-1">Quero economizar na conta de luz</p>
              <p className="text-[10px] text-emerald-400/70 mt-2">Economia de até 32% • Sem investimento</p>
            </button>
            
            <button
              onClick={() => setTipo('gerador')}
              className="w-full p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/30 rounded-2xl text-center hover:bg-blue-500/20 transition-all group hover:scale-[1.02]"
            >
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition">
                <Briefcase className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition">⚡ Gerador</h3>
              <p className="text-slate-400 text-sm mt-1">Tenho energia solar para compartilhar</p>
              <p className="text-[10px] text-blue-400/70 mt-2">Monetize seu excedente • Lucro mensal garantido</p>
            </button>
          </div>
        ) : (
          <form onSubmit={handleCadastro} className="space-y-4">
            {/* Barra de progresso */}
            <div className="flex items-center gap-2 mb-4">
              <div className={`flex-1 h-1 rounded-full transition-all ${step >= 1 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-slate-700'}`} />
              <div className={`flex-1 h-1 rounded-full transition-all ${step >= 2 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-slate-700'}`} />
              <div className={`flex-1 h-1 rounded-full transition-all ${step >= 3 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-slate-700'}`} />
            </div>

            {/* Step 1 - Dados Básicos */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Nome completo</label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"
                    placeholder="Como você quer ser chamado?"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Senha</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"
                    placeholder="Mínimo 6 caracteres"
                    required
                    minLength={6}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!nome || !email || !password}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-900 rounded-xl font-bold hover:from-emerald-400 hover:to-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continuar
                </button>
              </div>
            )}

            {/* Step 2 - Contato e Localização */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">WhatsApp</label>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"
                    placeholder="(84) 99999-9999"
                    required
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Usaremos para enviar atualizações importantes</p>
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Cidade e Estado</label>
                  <input
                    type="text"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"
                    placeholder="Ex: Natal - RN"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700 transition"
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={!whatsapp || !cidade}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-900 rounded-xl font-bold hover:from-emerald-400 hover:to-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continuar
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 - Confirmação */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h3 className="text-white font-bold mb-3">Resumo do cadastro</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Nome:</span>
                      <span className="text-white">{nome}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">E-mail:</span>
                      <span className="text-white">{email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">WhatsApp:</span>
                      <span className="text-white">{whatsapp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Localização:</span>
                      <span className="text-white">{cidade}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Perfil:</span>
                      <span className={`${tipo === 'consumidor' ? 'text-emerald-400' : 'text-blue-400'} font-bold`}>
                        {tipo === 'consumidor' ? '💰 Consumidor' : '⚡ Gerador'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700 transition"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-900 rounded-xl font-bold hover:from-emerald-400 hover:to-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Finalizar Cadastro'}
                  </button>
                </div>
              </div>
            )}

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            
            <button
              type="button"
              onClick={() => setTipo(null)}
              className="w-full text-center text-sm text-slate-500 hover:text-emerald-400 transition mt-2"
            >
              ← Voltar e escolher outro tipo
            </button>
          </form>
        )}

        {/* Selos de confiança */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] text-slate-500">
            <div className="flex items-center gap-1"><Shield className="w-3 h-3 text-emerald-500" /> Dados Protegidos (LGPD)</div>
            <div className="flex items-center gap-1"><Award className="w-3 h-3 text-emerald-500" /> Plataforma Segura</div>
            <div className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-emerald-500" /> Energia 100% Limpa</div>
          </div>
        </div>
      </div>
    </div>
  );
}