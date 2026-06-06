'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { getSupabase } from '@/lib/supabase/singleton';
import { LogOut, Zap, TrendingDown, DollarSign, Calendar, Award, Crown, ArrowRight, CheckCircle2, Leaf, Home, PiggyBank, BarChart3, ShieldCheck, Sparkles, Flame, Globe, Loader2, MessageCircle, Heart, FileText, Camera, ScanLine, MapPin, Users, Scan, Plus } from 'lucide-react';
import { ConsentModal } from '@/components/ConsentModal';
import { CURRENT_TERMS_VERSION } from '@/lib/commissions';
import Link from 'next/link';
import type { Database } from '@/lib/database.types';

type Consumidor = Database['public']['Tables']['consumidores']['Row']
type Assinatura = Database['public']['Tables']['assinaturas']['Row']
type Invoice = Database['public']['Tables']['invoice_uploads']['Row']

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
  const [showConsent, setShowConsent] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const supabase = getSupabase();

  useEffect(() => {
    if (!user) return;
    if (consentChecked) return;
    if (profile) {
      const accepted = !!(profile as any).agreed_to_payment_terms_at;
      const version = (profile as any).last_terms_version;
      if (!accepted || version !== CURRENT_TERMS_VERSION) {
        setShowConsent(true);
      }
      setConsentChecked(true);
    }

    async function loadMetrics() {
      try {
        const { data: consumidor } = await supabase
          .from('consumidores')
          .select('*')
          .eq('id', user.id)
          .single();

        const { data: assinatura } = await supabase
          .from('assinaturas')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle();

        const consumidorRow = consumidor as Consumidor | null
        const assinaturaRow = assinatura as Assinatura | null

        const kwh = assinaturaRow?.kwh_mensais || 0;
        const valor = assinaturaRow?.valor_mensal || 0;
        const economiaPercent = assinaturaRow?.economia_percentual || 25;
        const faturaAtual = kwh * 0.95;
        const economia = faturaAtual * (economiaPercent / 100);
        const faturaFinal = faturaAtual - economia;
        const diasConectado = consumidorRow?.created_at
          ? Math.floor((Date.now() - new Date(consumidorRow.created_at).getTime()) / 86400000)
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
          planoAtivo: !!assinaturaRow,
          nomePlano: assinaturaRow?.nome_plano || 'Sem plano',
          proximaFatura: assinaturaRow?.current_period_end || null,
        });
      } catch (err) {
        console.error('Erro ao carregar métricas:', err);
      } finally {
        setLoadingMetrics(false);
      }
    }

    loadMetrics();
  }, [user, supabase, profile, consentChecked]);

  // Carregar faturas separadamente
  useEffect(() => {
    if (!user) return;
    async function loadInvoices() {
      try {
        const { data } = await supabase
          .from('invoice_uploads')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);
        setInvoices((data as Invoice[] | null) ?? []);
      } catch (err) {
        console.error('Erro ao carregar faturas:', err);
      } finally {
        setLoadingInvoices(false);
      }
    }
    loadInvoices();
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

  const hasMatchEligibleInvoice = invoices.some((inv) => inv.match_eligible);
  const totalKwh = invoices.reduce((s, inv) => s + (inv.kwh_mensal ?? 0), 0);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans overflow-x-hidden">
      <ConsentModal
        open={showConsent}
        onAccepted={() => { setShowConsent(false); window.location.reload(); }}
      />

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
            <Link
              href="/dashboard/propostas"
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-300 hover:text-pink-400 transition"
            >
              <Heart className="w-4 h-4" />
              <span className="hidden sm:inline">Propostas</span>
            </Link>
            <Link
              href="/dashboard/faturas"
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-300 hover:text-cyan-400 transition"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Faturas</span>
            </Link>
            <Link
              href="/dashboard/chat"
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-300 hover:text-emerald-400 transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Chat</span>
            </Link>
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

        {/* Ações rápidas em destaque */}
        <div className="grid md:grid-cols-2 gap-3 mb-6">
          <Link
            href="/dashboard/faturas/scan"
            className="group p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 to-cyan-500/10 border border-emerald-500/30 hover:border-emerald-500/50 transition flex items-center gap-3"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition">
              <Camera className="w-6 h-6 text-emerald-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-white">Escanear fatura</p>
              <p className="text-xs text-slate-400">Use a câmera para cadastrar pelo QR Code ou código de barras</p>
            </div>
            <ArrowRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition" />
          </Link>

          <Link
            href="/recargas"
            className="group p-4 rounded-2xl bg-gradient-to-r from-cyan-500/15 to-blue-500/10 border border-cyan-500/30 hover:border-cyan-500/50 transition flex items-center gap-3"
          >
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition">
              <ScanLine className="w-6 h-6 text-cyan-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-white">Recarga de celular</p>
              <p className="text-xs text-slate-400">Pague com PIX ou saldo da plataforma, cashback em KWATT</p>
            </div>
            <ArrowRight className="w-5 h-5 text-cyan-400 group-hover:translate-x-1 transition" />
          </Link>
        </div>

        {/* Match com geradores - destaque quando há fatura elegível */}
        {hasMatchEligibleInvoice && (
          <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-pink-500/15 to-amber-500/10 border border-pink-500/30 flex items-center gap-4 flex-wrap">
            <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center">
              <Heart className="w-6 h-6 text-pink-300" />
            </div>
            <div className="flex-1 min-w-[200px]">
              <h3 className="text-base font-bold text-white">Você está visível para geradores próximos!</h3>
              <p className="text-sm text-slate-300">
                {invoices.filter((i) => i.match_eligible).length} fatura(s) com consumo ≥ 300 kWh.
                Geradores podem te encontrar no mapa e enviar propostas.
              </p>
            </div>
            <Link
              href="/dashboard/match"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-amber-500 hover:from-pink-400 text-slate-900 rounded-xl font-bold transition shadow-lg shadow-pink-500/20"
            >
              <Sparkles className="w-4 h-4" /> Ver matches
            </Link>
          </div>
        )}

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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                Suas Faturas
              </h3>
              <Link href="/dashboard/faturas" className="text-xs text-emerald-400 hover:underline">Ver todas</Link>
            </div>
            {loadingInvoices ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
              </div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-6">
                <Scan className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-400 mb-3">Nenhuma fatura cadastrada</p>
                <Link
                  href="/dashboard/faturas/scan"
                  className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:underline"
                >
                  <Plus className="w-3 h-3" /> Escanear primeira
                </Link>
              </div>
            ) : (
              <ul className="space-y-2">
                {invoices.map((inv) => (
                  <li key={inv.id}>
                    <Link
                      href={`/dashboard/faturas/${inv.id}`}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          inv.match_eligible ? 'bg-emerald-500/20' : 'bg-white/5'
                        }`}>
                          <FileText className={`w-4 h-4 ${inv.match_eligible ? 'text-emerald-300' : 'text-slate-400'}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-white font-medium truncate">
                            {inv.concessionaria || 'Fatura'}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {inv.kwh_mensal ? `${inv.kwh_mensal} kWh` : '—'} ·{' '}
                            {inv.valor_total ? `R$ ${Number(inv.valor_total).toFixed(2)}` : '—'}
                          </p>
                        </div>
                      </div>
                      {inv.match_eligible && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] text-emerald-300 font-bold flex items-center gap-1 shrink-0">
                          <MapPin className="w-2.5 h-2.5" /> Match
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {totalKwh > 0 && (
              <p className="text-[10px] text-slate-500 mt-3">
                Consumo total cadastrado: <strong className="text-white">{totalKwh.toLocaleString('pt-BR')} kWh</strong>
              </p>
            )}
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

        {!hasMatchEligibleInvoice && (
          <div className="mt-6 p-6 rounded-2xl bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 flex items-center gap-4 flex-wrap">
            <Crown className="w-8 h-8 text-yellow-400 shrink-0" />
            <div className="flex-1 min-w-[200px]">
              <h3 className="text-lg font-bold text-white">Conecte-se a geradores próximos</h3>
              <p className="text-slate-300 text-sm">
                Com o Member Plus, você vê no mapa quem está gerando energia limpa perto de você e propõe conexões diretas.
              </p>
            </div>
            <Link
              href="/dashboard/match"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-900 rounded-xl font-bold transition shadow-lg shadow-yellow-500/20"
            >
              <Sparkles className="w-4 h-4" /> Abrir Match
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

      </main>
    </div>
  );
}
