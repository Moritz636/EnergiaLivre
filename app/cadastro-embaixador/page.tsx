'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, CheckCircle, Briefcase, Megaphone, Users } from 'lucide-react';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase/singleton';
import { saveLead, type SaveLeadInput } from '@/app/actions';
import { splitCidadeEstado } from '@/lib/leads';

const NICHO_OPTIONS = [
  { value: 'imoveis', label: 'Imóveis' },
  { value: 'marketing', label: 'Marketing Digital' },
  { value: 'educacao', label: 'Educação' },
  { value: 'consultoria', label: 'Consultoria' },
  { value: 'vendas', label: 'Vendas' },
  { value: 'outro', label: 'Outro' },
] as const

const CANAL_OPTIONS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'indicacao', label: 'Indicação Direta' },
  { value: 'outro', label: 'Outro' },
] as const

export default function CadastroEmbaixadorPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [nicho, setNicho] = useState('');
  const [canal, setCanal] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const router = useRouter();
  const supabase = getSupabase();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome,
            tipo: 'parceiro',
            whatsapp,
            cidade,
            estado,
          },
          emailRedirectTo: `${window.location.origin}/login?cadastro=sucesso&from=parceiro`,
        },
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          setError('Este e-mail já está cadastrado. Tente fazer login.');
        } else {
          setError(authError.message);
        }
        setLoading(false);
        return;
      }

      if (authData.user) {
        const leadPayload: SaveLeadInput = {
          tipo: 'parceiro',
          nome,
          email,
          whatsapp,
          cidade,
          estado: estado || splitCidadeEstado(cidade).estado || 'ND',
          nicho: nicho || undefined,
          canal: canal || undefined,
        }
        const leadResult = await saveLead(leadPayload)
        if (!leadResult.success) {
          console.warn('Lead não salvo (cadastro seguiu):', leadResult.message)
        }

        setSuccess(true);
        setTimeout(() => router.push('/login?cadastro=sucesso&from=parceiro'), 2500);
      }
    } catch (err: any) {
      console.error('Erro no cadastro:', err);
      setError(err?.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
        <div className="text-center bg-white/5 p-8 rounded-3xl border border-white/10 max-w-md">
          <CheckCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Cadastro de Embaixador Realizado!</h1>
          <p className="text-slate-400 mb-4">Verifique seu e-mail para confirmar a conta e acessar o painel de comissões.</p>
          <p className="text-slate-500 text-sm">Redirecionando para login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-8">
        <Link href="/embaixador" className="text-slate-500 hover:text-yellow-400 inline-flex items-center gap-2 mb-8 transition">
          <ArrowLeft className="w-4 h-4" /> Voltar para Embaixadores
        </Link>

        <h1 className="text-3xl font-bold text-white text-center mb-2">Ser Embaixador</h1>
        <p className="text-slate-400 text-center mb-8">Preencha seus dados para começar a indicar</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nome completo"
            value={nome}
            onChange={e => setNome(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-slate-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition"
            required
          />
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-slate-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition"
            required
          />
          <input
            type="tel"
            placeholder="WhatsApp (com DDD)"
            value={whatsapp}
            onChange={e => setWhatsapp(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-slate-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition"
            required
          />
          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="Cidade"
              value={cidade}
              onChange={e => setCidade(e.target.value)}
              className="col-span-2 w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-slate-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition"
              required
            />
            <input
              type="text"
              placeholder="UF"
              maxLength={2}
              value={estado}
              onChange={e => setEstado(e.target.value.toUpperCase())}
              className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-slate-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <select
                value={nicho}
                onChange={(e) => setNicho(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-9 pr-3 text-white text-sm focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition appearance-none"
              >
                <option value="">Nicho (opcional)</option>
                {NICHO_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="relative">
              <Megaphone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <select
                value={canal}
                onChange={(e) => setCanal(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-9 pr-3 text-white text-sm focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition appearance-none"
              >
                <option value="">Canal (opcional)</option>
                {CANAL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          <input
            type="password"
            placeholder="Senha (mínimo 6)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-slate-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition"
            required
            minLength={6}
          />

          {error && <p className="text-red-400 text-sm text-center bg-red-500/10 p-2 rounded-lg border border-red-500/20">{error}</p>}

          <button
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-yellow-500 to-yellow-400 text-slate-900 rounded-xl font-bold hover:opacity-90 transition disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Users className="w-4 h-4" /> Criar conta de Embaixador</>}
          </button>
        </form>

        <p className="text-slate-500 text-xs text-center mt-6">
          Ao cadastrar, você concorda com nossos termos e políticas.
        </p>
      </div>
    </div>
  );
}
