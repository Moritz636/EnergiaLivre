'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { getSupabase } from '@/lib/supabase/singleton';
import { LogOut, Zap, TrendingDown, DollarSign, Calendar, Award, Crown, ArrowRight, CheckCircle2, Leaf, Home, PiggyBank, BarChart3, ShieldCheck, Sparkles, Flame, Globe, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Metrics {
  economiaMensal: number;
  economiaAnual: number;
  kwhEconomizados: number;
  co2Evitado: number;
  arvoresSalvas: number;
  faturaAtual: number;
  faturaComDesconto: number;
  percentualEconomia: number;
  diasConectado: number;
  planoAtivo: boolean;
  nomePlano: string;
  proximaFatura: string | null;
}

export default function DashboardConsumidorPage() {
  const { user, profile, loading, logout } = useAuth();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const supabase = getSupabase();

  useEffect(() => {
    if (!user) return;

    async function loadMetrics() {
      try {
        // 1. Buscar dados do consumidor
        const { data: consumidor } = await supabase
          .from('consumidores')
          .select('*')
          .eq('id', user.id)
          .single();

        // 2. Buscar assinatura ativa
        const { data: assinatura } = await supabase
          .from('assinaturas')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle();

        // 3. Calcular métricas
        const kwh = assinatura?.kwh_mensais || 0;
        const valor = assinatura?.valor_mensal || 0;
        const economiaPercent = assinatura?.economia_percentual || 25;
        const faturaAtual = kwh * 0.95; // Tarifa média
        const economia = faturaAtual * (economiaPercent / 100);
        const faturaFinal = faturaAtual - economia;
        const diasConectado = consumidor?.created_at
          ? Math.floor((Date.now() - new Date(consumidor.created_at).getTime()) / 86400000)
          : 0;

        setMetrics({
          economiaMensal: Math.round(economia),
          economiaAnual: Math.round(economia * 12),
          kwhEconomizados: kwh,
          co2Evitado: Math.round(kwh * 0.0817),
          arvoresSalvas: Math.round(kwh * 0.0817 / 22),
          faturaAtual: Math.round(faturaAtual),
          faturaComDesconto: Math.round(faturaFinal),
          percentualEconomia: economiaPercent,
          diasConectado,
          planoAtivo: !!assinatura,
          nomePlano: assinatura?.nome_plano || 'Sem plano',
          proximaFatura: assinatura?.current_period_end || null,
        });
      } catch (err) {
        console.error('Erro ao carregar métricas:', err);
      } finally {
        setLoadingMetrics(false);
      }
    }

    loadMetrics();
  }, [user, supabase]);

  if (loading || loadingMetrics) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const m = metrics || {
    economiaMensal: 0,
    economiaAnual: 0,
    kwhEconomizados: 0,
    co2Evitado: 0,
    arvoresSalvas: 0,
    faturaAtual: 0,
    faturaComDesconto: 0,
    percentualEconomia: 0,
    diasConectado: 0,
    planoAtivo: false,
    nomePlano: 'Sem plano',
    proximaFatura: null,
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans overflow-x-hidden">

      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent -z-20" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -z-10" />
      <div className="fixed top-40 right-0 w-80 h-80 bg-yellow-500/5 rounded-full blur-[100px] -z-10" />

      <nav className="border-b border-white/10 bg-[#020617]/90 backdrop-blur-xl fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-emerald-400 rounded-lg flex items-center justify-center">
              <Zap className="text-slate-900 w-4 h-4 fill-current" />
            </div>
            <span className="text-xl font-black text-white">ENERGIA<span className="text-emerald-500">LIVRE</span></span>
            <div className="ml-3 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[9px] font-black text-emerald-400 uppercase tracking-wider">
              Consumidor
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400 hidden sm:block">
              Olá, <span className="text-white font-medium">{profile?.nome || 'Usuário'}</span>
            </span>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
            Sua economia em tempo real
          </h1>
          <p className="text-slate-400">
            {m.planoAtivo
              ? `Plano ${m.nomePlano} ativo. Você está economizando ${m.percentualEconomia}% na sua conta.`
              : 'Ative um plano para começar a economizar com energia solar.'}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 border border-emerald-500/30">
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">Economia Mensal</span>
            </div>
            <p className="text-3xl font-black text-white">
              R$ {m.economiaMensal.toLocaleString('pt-BR')}
            </p>
            <p className="text-xs text-emerald-300 mt-1">↓ {m.percentualEconomia}% na fatura</p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-yellow-400 mb-2">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">kWh Economizados</span>
            </div>
            <p className="text-3xl font-black text-white">
              {m.kwhEconomizados.toLocaleString('pt-BR')}
            </p>
            <p className="text-xs text-slate-400 mt-1">por mês</p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-green-400 mb-2">
              <Leaf className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">CO₂ Evitado</span>
            </div>
            <p className="text-3xl font-black text-white">
              {m.co2Evitado.toLocaleString('pt-BR')}
            </p>
            <p className="text-xs text-slate-400 mt-1">kg por mês</p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <Globe className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">Árvores Salvas</span>
            </div>
            <p className="text-3xl font-black text-white">
              {m.arvoresSalvas}
            </p>
            <p className="text-xs text-slate-400 mt-1">equivalentes</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              Comparativo de Fatura
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-xl bg-red-500/5 border border-red-500/20">
                <span className="text-slate-400 text-sm">Sem EnergiaLivre</span>
                <span className="text-red-400 font-bold">R$ {m.faturaAtual.toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <span className="text-slate-400 text-sm">Com EnergiaLivre</span>
                <span className="text-emerald-400 font-bold">R$ {m.faturaComDesconto.toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
                <span className="text-slate-400 text-sm">Economia anual estimada</span>
                <span className="text-yellow-400 font-bold">R$ {m.economiaAnual.toLocaleString('pt-BR')}</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-400" />
              Seu Plano
            </h3>
            {m.planoAtivo ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Plano</span>
                  <span className="text-white font-bold">{m.nomePlano}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Status</span>
                  <span className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">Ativo</span>
                </div>
                {m.proximaFatura && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Próxima fatura</span>
                    <span className="text-white text-sm">
                      {new Date(m.proximaFatura).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                )}
                <Link
                  href="/checkout"
                  className="w-full mt-3 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition flex items-center justify-center gap-2"
                >
                  Mudar Plano <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="text-center py-6">
                <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <p className="text-slate-300 mb-4">Você ainda não tem um plano ativo</p>
                <Link
                  href="/checkout"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-slate-900 rounded-xl font-bold hover:bg-emerald-400 transition"
                >
                  <Sparkles className="w-4 h-4" />
                  Escolher Plano
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-yellow-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-3 mb-3">
            <Award className="w-6 h-6 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Continue assim!</h3>
          </div>
          <p className="text-slate-300">
            Você está conectado há <strong className="text-emerald-400">{m.diasConectado} dias</strong> e já
            evitou a emissão de <strong className="text-emerald-400">{m.co2Evitado * m.diasConectado}kg de CO₂</strong>.
            Cada dia conta para um planeta mais limpo!
          </p>
        </div>

      </main>
    </div>
  );
}
