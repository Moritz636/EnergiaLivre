'use client';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { getSupabase } from '@/lib/supabase/singleton';
import { LogOut, Zap, DollarSign, Users, Loader2, TrendingUp, Award, Copy, Check, Share2, Calendar, Target, Crown, Sparkles, ArrowRight, Handshake, MessageCircle, Heart, FileText } from 'lucide-react';
import Link from 'next/link';
import type { Database } from '@/lib/database.types';

type Lead = Database['public']['Tables']['leads']['Row']
type Comissao = Database['public']['Tables']['comissoes']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

interface Metrics {
  leadsCount: number
  aprovadosCount: number
  totalPago: number
  totalPendente: number
  totalEstimado: number
  indicadosMes: number
  meta: number
  createdAt: string | null
}

const META_MENSAL = 20

export default function DashboardEmbaixadorPage() {
  const { user, profile, loading, logout } = useAuth();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [recentComissoes, setRecentComissoes] = useState<Comissao[]>([]);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [copied, setCopied] = useState(false);
  const supabase = getSupabase();

  const referralLink = useMemo(() => {
    if (typeof window === 'undefined' || !user) return ''
    return `${window.location.origin}/?ref=${user.id}`
  }, [user])

  useEffect(() => {
    if (!user) return;

    async function load() {
      try {
        const { count: leadsCount } = await supabase
          .from('leads')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('tipo', 'parceiro');

        const { count: aprovadosCount } = await supabase
          .from('leads')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('tipo', 'parceiro')
          .eq('status', 'aprovado');

        const { data: comissoes } = await supabase
          .from('comissoes')
          .select('*')
          .eq('embaixador_id', user.id);

        const allComissoes = (comissoes as Comissao[] | null) ?? []
        const totalPago = allComissoes
          .filter((c) => c.status_pagamento === 'pago')
          .reduce((sum, c) => sum + Number(c.valor_comissao ?? 0), 0)
        const totalPendente = allComissoes
          .filter((c) => c.status_pagamento === 'pendente')
          .reduce((sum, c) => sum + Number(c.valor_comissao ?? 0), 0)

        const inicioMes = new Date()
        inicioMes.setDate(1)
        inicioMes.setHours(0, 0, 0, 0)
        const indicadosMes = allComissoes.filter(
          (c) => new Date(c.created_at) >= inicioMes,
        ).length

        const { data: leads } = await supabase
          .from('leads')
          .select('*')
          .eq('user_id', user.id)
          .eq('tipo', 'parceiro')
          .order('created_at', { ascending: false })
          .limit(5);

        setRecentLeads((leads as Lead[] | null) ?? [])
        setRecentComissoes(
          allComissoes
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5),
        )

        setMetrics({
          leadsCount: leadsCount ?? 0,
          aprovadosCount: aprovadosCount ?? 0,
          totalPago,
          totalPendente,
          totalEstimado: totalPago + totalPendente,
          indicadosMes,
          meta: META_MENSAL,
          createdAt: (profile as Profile | null)?.created_at ?? null,
        })
      } catch (err) {
        console.error('Erro ao carregar dashboard do embaixador:', err)
      } finally {
        setLoadingMetrics(false)
      }
    }

    load()
  }, [user, supabase, profile]);

  if (loading || loadingMetrics) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
      </div>
    );
  }

  if (!user) return null

  const m: Metrics = metrics ?? {
    leadsCount: 0,
    aprovadosCount: 0,
    totalPago: 0,
    totalPendente: 0,
    totalEstimado: 0,
    indicadosMes: 0,
    meta: META_MENSAL,
    createdAt: null,
  }
  const progressoMeta = Math.min((m.indicadosMes / m.meta) * 100, 100)
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard bloqueado */
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans overflow-x-hidden">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-yellow-500/5 via-transparent to-transparent -z-20" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -z-10" />
      <div className="fixed top-40 right-0 w-80 h-80 bg-yellow-500/5 rounded-full blur-[100px] -z-10" />

      <nav className="border-b border-white/10 bg-[#020617]/90 backdrop-blur-xl fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-yellow-400 rounded-lg flex items-center justify-center">
              <Zap className="text-slate-900 w-4 h-4 fill-current" />
            </div>
            <span className="text-xl font-black text-white">ENERGIA<span className="text-emerald-500">LIVRE</span></span>
            <div className="ml-3 px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-[9px] font-black text-yellow-400 uppercase tracking-wider">
              Embaixador
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400 hidden sm:block">
              Olá, <span className="text-white font-medium">{profile?.nome || 'Embaixador'}</span>
            </span>
            <Link
              href="/comissoes"
              className="hidden sm:inline-flex items-center gap-1 text-xs text-yellow-400 hover:text-yellow-300 transition"
            >
              <DollarSign className="w-3 h-3" /> Comissões
            </Link>
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
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Handshake className="w-6 h-6 text-yellow-400" />
              <h1 className="text-3xl md:text-4xl font-black text-white">Painel do Embaixador</h1>
            </div>
            <p className="text-slate-400">
              {profile?.cidade && profile?.estado
                ? `Base: ${profile.cidade}/${profile.estado}`
                : 'Complete seu perfil para ativar as indicações.'}
            </p>
          </div>
          <Link
            href="/embaixador#simulador"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-500 text-slate-900 rounded-xl font-bold hover:bg-yellow-400 transition"
          >
            <Sparkles className="w-4 h-4" /> Simular Ganhos
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 border border-emerald-500/30">
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">Total Ganho</span>
            </div>
            <p className="text-3xl font-black text-white">
              R$ {m.totalEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-emerald-300 mt-1">pago + pendente</p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-yellow-400 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">Pago</span>
            </div>
            <p className="text-3xl font-black text-white">
              R$ {m.totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-400 mt-1">já recebido</p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-cyan-400 mb-2">
              <Users className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">Indicados</span>
            </div>
            <p className="text-3xl font-black text-white">{m.indicadosMes}</p>
            <p className="text-xs text-slate-400 mt-1">este mês</p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <Target className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">Conversão</span>
            </div>
            <p className="text-3xl font-black text-white">
              {m.leadsCount > 0 ? Math.round((m.aprovadosCount / m.leadsCount) * 100) : 0}<span className="text-base text-emerald-400">%</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">{m.aprovadosCount} de {m.leadsCount} leads</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-r from-yellow-500/10 to-emerald-500/5 border border-yellow-500/30 mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-yellow-400" />
              <h3 className="text-lg font-bold text-white">Meta mensal: {m.indicadosMes} / {m.meta}</h3>
            </div>
            <span className="text-sm text-yellow-400 font-bold">{Math.round(progressoMeta)}%</span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-500 to-emerald-500 transition-all duration-700"
              style={{ width: `${progressoMeta}%` }}
            />
          </div>
          {m.indicadosMes >= m.meta ? (
            <p className="text-xs text-emerald-400 mt-2">🎉 Meta batida! Continue assim para o próximo nível.</p>
          ) : (
            <p className="text-xs text-slate-500 mt-2">
              Faltam {m.meta - m.indicadosMes} indicados para bater a meta do mês.
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Share2 className="w-5 h-5 text-emerald-400" />
              Seu link de indicação
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              Compartilhe este link. Cada cadastro conta como sua indicação.
            </p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={referralLink}
                className="flex-1 bg-slate-900/50 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-slate-300 outline-none"
              />
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-900 rounded-xl font-bold transition"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
            <div className="flex gap-2 mt-3">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Olha essa plataforma de energia solar: ${referralLink}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm transition"
              >
                <Share2 className="w-4 h-4" /> WhatsApp
              </a>
              <Link
                href="/embaixador"
                className="flex-1 inline-flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm transition"
              >
                <Sparkles className="w-4 h-4" /> Materiais
              </Link>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-yellow-400" />
              Comissões recentes
            </h3>
            {recentComissoes.length === 0 ? (
              <div className="text-center py-6">
                <Crown className="w-10 h-10 text-yellow-500 mx-auto mb-2" />
                <p className="text-slate-300 mb-1">Nenhuma comissão ainda</p>
                <p className="text-xs text-slate-500">Compartilhe seu link para começar a ganhar.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {recentComissoes.map((c) => (
                  <li key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <div>
                      <p className="text-white text-sm font-medium">
                        {c.tipo_comissao === 'cadastro' ? 'Comissão de cadastro' : 'Comissão recorrente'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {c.percentual}% • {new Date(c.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-400 font-bold">
                        R$ {Number(c.valor_comissao).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <span className={`text-[10px] font-bold uppercase ${
                        c.status_pagamento === 'pago' ? 'text-emerald-400' :
                        c.status_pagamento === 'cancelado' ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {c.status_pagamento}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href="/comissoes"
              className="mt-3 inline-flex items-center gap-1 text-xs text-yellow-400 hover:text-yellow-300 transition"
            >
              Ver todas as comissões <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            Leads recentes
          </h3>
          {recentLeads.length === 0 ? (
            <div className="text-center py-6">
              <Target className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-slate-300 mb-1">Nenhum lead capturado ainda</p>
              <p className="text-xs text-slate-500">Indique pessoas pelo seu link para ver leads aqui.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {recentLeads.map((lead) => (
                <li key={lead.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <div>
                    <p className="text-white font-medium">{lead.nome}</p>
                    <p className="text-xs text-slate-500">
                      {lead.cidade}/{lead.estado} • {lead.canal || 'sem canal'} • {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full border ${
                    lead.status === 'aprovado' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                    lead.status === 'recusado' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                    'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                  }`}>
                    {lead.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {m.createdAt && (
          <div className="mt-6 flex items-center gap-2 text-xs text-slate-500">
            <Calendar className="w-3 h-3" />
            Embaixador desde {new Date(m.createdAt).toLocaleDateString('pt-BR')}
            {m.leadsCount > 0 && (
              <>
                <span className="mx-2">•</span>
                <Award className="w-3 h-3" />
                {m.leadsCount} lead{m.leadsCount === 1 ? '' : 's'} capturado{m.leadsCount === 1 ? '' : 's'}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
