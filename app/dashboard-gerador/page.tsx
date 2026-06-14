'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { getSupabase } from '@/lib/supabase/singleton';
import { LogOut, Zap, TrendingUp, DollarSign, Sun, Building2, MapPin, Users, Loader2, Sparkles, ArrowRight, ShieldCheck, Award, Crown, Calendar, BarChart3, MessageCircle, Heart, FileText } from 'lucide-react';
import { ConsentModal } from '@/components/ConsentModal';
import { CURRENT_TERMS_VERSION } from '@/lib/commissions';

import NotificationBell from '@/components/NotificationBell';
import { SimpleMatchSection } from '@/components/Map/SimpleMatchSection';
import Link from 'next/link';
import type { Database } from '@/lib/database.types';

type Gerador = Database['public']['Tables']['geradores']['Row']
type Lead = Database['public']['Tables']['leads']['Row']

interface Metrics {
  capacidadeKwp: number;
  excedenteKwh: number;
  lucroTotal: number;
  kwhVendidos: number;
  leadsCount: number;
  receitaProjetada: number;
  status: Gerador['status'] | 'pendente';
  nomeUsina: string;
  cidade: string;
  estado: string;
  concessionaria: string;
  createdAt: string | null;
}

const STATUS_LABEL: Record<Gerador['status'], string> = {
  pendente: 'Aguardando Aprovação',
  aprovado: 'Aprovado',
  ativo: 'Ativo',
  inativo: 'Inativo',
}

const STATUS_TONE: Record<Gerador['status'], string> = {
  pendente: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  aprovado: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  ativo: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  inativo: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
}

export default function DashboardGeradorPage() {
  const { user, profile, loading, logout } = useAuth();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [showConsent, setShowConsent] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
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
        const { data: gerador } = await supabase
          .from('geradores')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        const { count: leadsCount } = await supabase
          .from('leads')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('tipo', 'gerador');

        const { data: leads } = await supabase
          .from('leads')
          .select('*')
          .eq('user_id', user.id)
          .eq('tipo', 'gerador')
          .order('created_at', { ascending: false })
          .limit(5);

        const g = gerador as Gerador | null
        const cap = g?.capacidade_kwp ?? 0
        const excedente = g?.excedente_mensal_kwh ?? 0
        const receita = cap * 150

        setMetrics({
          capacidadeKwp: cap,
          excedenteKwh: excedente,
          lucroTotal: g?.lucro_total ?? 0,
          kwhVendidos: g?.kwh_vendidos_total ?? 0,
          leadsCount: leadsCount ?? 0,
          receitaProjetada: receita,
          status: g?.status ?? 'pendente',
          nomeUsina: g?.nome_usina ?? 'Sua Usina Solar',
          cidade: g?.cidade ?? '',
          estado: g?.estado ?? '',
          concessionaria: g?.concessionaria ?? '',
          createdAt: g?.created_at ?? null,
        })
        setRecentLeads((leads as Lead[] | null) ?? [])
      } catch (err) {
        console.error('Erro ao carregar métricas do gerador:', err)
      } finally {
        setLoadingMetrics(false)
      }
    }

    loadMetrics()
  }, [user, supabase, profile, consentChecked]);

  if (loading || loadingMetrics) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const m: Metrics = metrics ?? {
    capacidadeKwp: 0,
    excedenteKwh: 0,
    lucroTotal: 0,
    kwhVendidos: 0,
    leadsCount: 0,
    receitaProjetada: 0,
    status: 'pendente',
    nomeUsina: 'Sua Usina Solar',
    cidade: '',
    estado: '',
    concessionaria: '',
    createdAt: null,
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans overflow-x-hidden">
      <ConsentModal
        open={showConsent}
        onAccepted={() => { setShowConsent(false); window.location.reload(); }}
      />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent -z-20" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -z-10" />
      <div className="fixed top-40 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px] -z-10" />

      <nav className="border-b border-white/10 bg-[#020617]/90 backdrop-blur-xl fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
              <Zap className="text-slate-900 w-4 h-4 fill-current" />
            </div>
            <span className="text-xl font-black text-white">ENERGIA<span className="text-blue-500">LIVRE</span></span>
            <div className="ml-3 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-[9px] font-black text-blue-400 uppercase tracking-wider">
              Gerador
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
            <a
              href={`https://wa.me/5584987858668?text=${encodeURIComponent('Olá! Sou gerador parceiro e preciso de suporte.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-300 hover:text-emerald-400 transition"
              title="Suporte via WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Suporte</span>
            </a>
            <NotificationBell />
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
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Sun className="w-6 h-6 text-yellow-400" />
              <h1 className="text-3xl md:text-4xl font-black text-white">{m.nomeUsina}</h1>
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${STATUS_TONE[m.status]}`}>
                {STATUS_LABEL[m.status]}
              </span>
            </div>
            <p className="text-slate-400">
              {m.cidade && m.estado ? `${m.cidade}/${m.estado}` : 'Complete seu cadastro para começar a monetizar.'}
            </p>
          </div>
          <Link
            href="/vender"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-slate-900 rounded-xl font-bold hover:bg-blue-400 transition"
          >
            <Sparkles className="w-4 h-4" /> Atualizar Usina
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-600/5 border border-blue-500/30">
            <div className="flex items-center gap-2 text-blue-400 mb-2">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">Capacidade</span>
            </div>
            <p className="text-3xl font-black text-white">
              {m.capacidadeKwp.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} <span className="text-base text-blue-400">kWp</span>
            </p>
            <p className="text-xs text-blue-300 mt-1">instalados</p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-yellow-400 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">Excedente</span>
            </div>
            <p className="text-3xl font-black text-white">
              {m.excedenteKwh.toLocaleString('pt-BR')}
            </p>
            <p className="text-xs text-slate-400 mt-1">kWh / mês</p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">Receita Projetada</span>
            </div>
            <p className="text-3xl font-black text-white">
              R$ {m.receitaProjetada.toLocaleString('pt-BR')}
            </p>
            <p className="text-xs text-slate-400 mt-1">por mês (~R$ 150/kWp)</p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-cyan-400 mb-2">
              <Users className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">Leads Recebidos</span>
            </div>
            <p className="text-3xl font-black text-white">
              {m.leadsCount.toLocaleString('pt-BR')}
            </p>
            <p className="text-xs text-slate-400 mt-1">interessados na sua usina</p>
          </div>
        </div>

        <SimpleMatchSection supabase={supabase} userId={user.id} tipo="gerador" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-400" />
              Detalhes da Usina
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                <span className="text-slate-400 flex items-center gap-2"><MapPin className="w-4 h-4" /> Localização</span>
                <span className="text-white font-medium">{m.cidade || '—'}{m.estado ? `/${m.estado}` : ''}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                <span className="text-slate-400 flex items-center gap-2"><Zap className="w-4 h-4" /> Concessionária</span>
                <span className="text-white font-medium">{m.concessionaria || '—'}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                <span className="text-slate-400 flex items-center gap-2"><BarChart3 className="w-4 h-4" /> kWh Vendidos</span>
                <span className="text-white font-medium">{m.kwhVendidos.toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                <span className="text-slate-400 flex items-center gap-2"><DollarSign className="w-4 h-4" /> Lucro Total</span>
                <span className="text-emerald-400 font-bold">R$ {m.lucroTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Leads Recentes
            </h3>
            {recentLeads.length === 0 ? (
              <div className="text-center py-8">
                <ShieldCheck className="w-10 h-10 text-blue-500 mx-auto mb-3" />
                <p className="text-slate-300 mb-1">Nenhum lead ainda</p>
                <p className="text-xs text-slate-500">Leads capturados pelo formulário /vender aparecerão aqui.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {recentLeads.map((lead) => (
                  <li key={lead.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <div>
                      <p className="text-white font-medium">{lead.nome}</p>
                      <p className="text-xs text-slate-500">{lead.cidade}/{lead.estado} • {lead.capacidade_kwp ?? 0} kWp</p>
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full border ${
                      lead.status === 'aprovado'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : lead.status === 'recusado'
                          ? 'bg-red-500/20 text-red-400 border-red-500/30'
                          : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                    }`}>
                      {lead.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="lg:row-span-2 p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-yellow-500/5 to-cyan-500/10 border border-emerald-500/20">
            <h3 className="text-base font-black text-white mb-1">Saldo de Créditos</h3>
            <p className="text-2xl font-bold text-emerald-400 mb-3">R$ 0,00</p>
            <a
              href="https://buy.stripe.com/8x29ATgP7eCl6gB3hr7Vm0k"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-900 text-sm font-bold transition"
            >
              Comprar créditos
            </a>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 flex items-center gap-4 flex-wrap">
          <Crown className="w-8 h-8 text-yellow-400" />
          <div className="flex-1 min-w-[200px]">
            <h3 className="text-lg font-bold text-white">Sua usina está monetizando excedente</h3>
            <p className="text-slate-300 text-sm">
              {m.status === 'ativo'
                ? 'Continue gerando leads para escalar sua receita recorrente.'
                : 'Complete as informações técnicas para aprovação e ativação.'}
            </p>
          </div>
          <Link
            href="/vender"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition"
          >
            {m.status === 'ativo' ? 'Captar mais leads' : 'Concluir cadastro'}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/checkout-gerador"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white rounded-xl font-medium transition shadow-lg shadow-blue-500/20"
          >
            <Crown className="w-4 h-4 text-yellow-300" /> Ver Planos
          </Link>
        </div>

        {m.createdAt && (
          <div className="mt-6 flex items-center gap-2 text-xs text-slate-500">
            <Calendar className="w-3 h-3" />
            Cadastrado em {new Date(m.createdAt).toLocaleDateString('pt-BR')}
            {m.leadsCount > 0 && (
              <>
                <span className="mx-2">•</span>
                <Award className="w-3 h-3" />
                {m.leadsCount} lead{m.leadsCount === 1 ? '' : 's'} recebido{m.leadsCount === 1 ? '' : 's'}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
