'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/app/hooks/useAuth';
import { getSupabase } from '@/lib/supabase/singleton';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  DollarSign,
  CreditCard,
  Zap,
  Ticket,
  Settings,
  LogOut,
  Loader2,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  MapPin,
  RefreshCw,
  Shield,
  ArrowUpRight,
  Edit3,
  Save,
  Calendar,
  TrendingUp,
  X,
  Coins,
  Globe,
  ExternalLink,
} from 'lucide-react';

type Section =
  | 'overview'
  | 'leads'
  | 'users'
  | 'geradores'
  | 'commissions'
  | 'finance'
  | 'matches'
  | 'coupons'
  | 'settings'
  | 'pages';

interface Lead {
  id: number;
  nome: string;
  email: string;
  whatsapp: string;
  cidade: string;
  estado: string;
  tipo: string;
  status: string;
  created_at: string;
}

interface ProfileRow {
  id: string;
  nome: string | null;
  email: string | null;
  tipo: string | null;
  role: string | null;
  whatsapp: string | null;
  cidade: string | null;
  estado: string | null;
  created_at: string;
}

interface Commission {
  id: number;
  valor_comissao: number;
  percentual: number;
  tipo_comissao: string;
  status_pagamento: string;
  mes_referencia: number;
  ano_referencia: number;
  profiles: { nome: string | null; email: string | null } | null;
  created_at: string;
}

interface Pagamento {
  id: number;
  user_id: string;
  tipo_pagamento: string;
  valor: number;
  status: string;
  description: string | null;
  stripe_payment_intent: string | null;
  created_at: string;
  processed_at: string | null;
}

interface Assinatura {
  id: number;
  user_id: string;
  nome_plano: string;
  tipo_plano: string;
  valor_mensal: number;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
}

interface MatchProposal {
  id: number;
  from_user_id: string;
  to_user_id: string;
  status: string;
  kwh_proposto: number | null;
  valor_proposto: number | null;
  created_at: string;
  responded_at: string | null;
  message: string | null;
}

interface Coupon {
  id: string;
  code: string;
  bonus_coins: number;
  inviter_bonus_coins: number;
  used_by: string | null;
  used_at: string | null;
  expires_at: string | null;
  created_at: string;
  created_by: string | null;
}

interface SystemSetting {
  key: string;
  value: any;
  description: string | null;
  category: string;
  is_public: boolean;
  updated_at: string;
}

interface GeradorRow {
  id: string;
  nome_usina: string;
  capacidade_kwp: number;
  excedente_mensal_kwh: number;
  concessionaria: string;
  cidade: string;
  estado: string;
  endereco: string | null;
  status: string;
  data_aprovacao: string | null;
  created_at: string;
  profiles: { nome: string | null; email: string | null; whatsapp: string | null; cidade: string | null; estado: string | null } | null;
}

interface Stats {
  totalUsuarios: number;
  totalLeads: number;
  leadsPendentes: number;
  leadsAprovados: number;
  leadsRecusados: number;
  totalComissoes: number;
  comissoesPendentes: number;
  embaixadores: number;
  geradores: number;
  geradoresPendentes: number;
  consumidores: number;
  faturamentoMensal: number;
  faturamentoTotal: number;
  assinaturasAtivas: number;
}

const SECTION_LABELS: Record<Section, string> = {
  overview: 'Visão Geral',
  leads: 'Leads',
  users: 'Usuários',
  geradores: 'Geradores',
  commissions: 'Comissões',
  finance: 'Financeiro',
  matches: 'Match',
  coupons: 'Cupons',
  settings: 'Configurações',
  pages: 'Páginas',
};

export default function AdminDashboardPage() {
  const { user, loading, isAdmin, logout } = useAdminAuth();
  const router = useRouter();
  const [section, setSection] = useState<Section>('overview');

  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<ProfileRow[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [assinaturas, setAssinaturas] = useState<Assinatura[]>([]);
  const [matches, setMatches] = useState<MatchProposal[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [geradores, setGeradores] = useState<GeradorRow[]>([]);

  const [stats, setStats] = useState<Stats | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [leadFilter, setLeadFilter] = useState<'todos' | 'pendentes' | 'aprovados' | 'recusados'>('todos');
  const [userFilter, setUserFilter] = useState<'todos' | 'consumidor' | 'gerador' | 'parceiro'>('todos');
  const [financeTab, setFinanceTab] = useState<'pagamentos' | 'assinaturas'>('pagamentos');
  const [editingSetting, setEditingSetting] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setDataLoading(true);
    const supabase = getSupabase();

    const [
      leadsRes,
      usersRes,
      geradoresRes,
      commissionsRes,
      pagamentosRes,
      assinaturasRes,
      matchesRes,
      couponsRes,
      settingsRes,
    ] = await Promise.all([
      supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(500),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(500),
      supabase.from('geradores').select('*, profiles!geradores_id_fkey(nome, email, whatsapp, cidade, estado)').order('created_at', { ascending: false }).limit(500),
      (supabase.from('comissoes') as any)
        .select('*, profiles!comissoes_embaixador_id_fkey(nome, email)')
        .order('created_at', { ascending: false })
        .limit(500),
      supabase.from('pagamentos').select('*').order('created_at', { ascending: false }).limit(500),
      supabase.from('assinaturas').select('*').order('created_at', { ascending: false }).limit(500),
      (supabase.from('match_proposals') as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500),
      supabase.from('coupons').select('*').order('created_at', { ascending: false }).limit(500),
      supabase.from('system_settings').select('*').order('category', { ascending: true }),
    ]);

    if (leadsRes.data) setLeads(leadsRes.data as Lead[]);
    if (usersRes.data) setUsers(usersRes.data as ProfileRow[]);
    if (geradoresRes.data) setGeradores(geradoresRes.data as GeradorRow[]);
    if (commissionsRes.data) setCommissions(commissionsRes.data as Commission[]);
    if (pagamentosRes.data) setPagamentos(pagamentosRes.data as Pagamento[]);
    if (assinaturasRes.data) setAssinaturas(assinaturasRes.data as Assinatura[]);
    if (matchesRes.data) setMatches(matchesRes.data as MatchProposal[]);
    if (couponsRes.data) setCoupons(couponsRes.data as Coupon[]);
    if (settingsRes.data) setSettings(settingsRes.data as SystemSetting[]);

    const leadsList = (leadsRes.data || []) as Lead[];
    const usersList = (usersRes.data || []) as ProfileRow[];
    const geradoresList = (geradoresRes.data || []) as GeradorRow[];
    const commissionsList = (commissionsRes.data || []) as Commission[];
    const pagamentosList = (pagamentosRes.data || []) as Pagamento[];
    const assinaturasList = (assinaturasRes.data || []) as Assinatura[];

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const faturamentoMensal = pagamentosList
      .filter(p => p.status === 'succeeded' && p.created_at >= monthStart)
      .reduce((acc, p) => acc + Number(p.valor || 0), 0);
    const faturamentoTotal = pagamentosList
      .filter(p => p.status === 'succeeded')
      .reduce((acc, p) => acc + Number(p.valor || 0), 0);

    setStats({
      totalUsuarios: usersList.length,
      totalLeads: leadsList.length,
      leadsPendentes: leadsList.filter(l => !l.status || l.status === 'pendente').length,
      leadsAprovados: leadsList.filter(l => l.status === 'aprovado').length,
      leadsRecusados: leadsList.filter(l => l.status === 'recusado').length,
      totalComissoes: commissionsList
        .filter(c => c.status_pagamento === 'pago')
        .reduce((acc, c) => acc + Number(c.valor_comissao || 0), 0),
      comissoesPendentes: commissionsList.filter(c => c.status_pagamento === 'pendente').length,
      embaixadores: usersList.filter(u => u.tipo === 'parceiro').length,
      geradores: usersList.filter(u => u.tipo === 'gerador').length,
      geradoresPendentes: geradoresList.filter(g => g.status === 'pendente').length,
      consumidores: usersList.filter(u => u.tipo === 'consumidor' || !u.tipo).length,
      faturamentoMensal,
      faturamentoTotal,
      assinaturasAtivas: assinaturasList.filter(a => a.status === 'active').length,
    });

    setDataLoading(false);
  }, []);

  useEffect(() => {
    if (isAdmin) loadAll();
  }, [isAdmin, loadAll]);

  const updateLeadStatus = async (id: number, status: string) => {
    const supabase = getSupabase();
    const { error } = await (supabase.from('leads') as any).update({ status }).eq('id', id);
    if (!error) loadAll();
  };

  const updateSetting = async (key: string, value: any) => {
    const supabase = getSupabase();
    const { data: { user: u } } = await supabase.auth.getUser();
    const { error } = await (supabase.from('system_settings') as any)
      .update({ value, updated_by: u?.id })
      .eq('key', key);
    if (!error) {
      setEditingSetting(null);
      loadAll();
    }
  };

  useEffect(() => {
    if (!loading && user && !isAdmin) {
      router.push('/');
    }
  }, [loading, user, isAdmin, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Acesso Restrito</h2>
          <p className="text-slate-400 text-sm">Você não tem permissão para acessar o painel administrativo.</p>
        </div>
      </div>
    );
  }

  const navItems: { id: Section; name: string; icon: any; badge?: number }[] = [
    { id: 'overview', name: 'Visão Geral', icon: LayoutDashboard },
    { id: 'leads', name: 'Leads', icon: UserCheck, badge: stats?.leadsPendentes },
    { id: 'users', name: 'Usuários', icon: Users },
    { id: 'geradores', name: 'Geradores', icon: Zap, badge: stats?.geradoresPendentes },
    { id: 'commissions', name: 'Comissões', icon: DollarSign, badge: stats?.comissoesPendentes },
    { id: 'finance', name: 'Financeiro', icon: CreditCard },
    { id: 'matches', name: 'Match', icon: Zap },
    { id: 'coupons', name: 'Cupons', icon: Ticket },
    { id: 'pages', name: 'Páginas', icon: Globe },
    { id: 'settings', name: 'Configurações', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex">
      <aside className="w-60 border-r border-white/5 bg-slate-900/40 flex flex-col fixed h-full">
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Shield className="text-white w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Admin</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Modo Deus</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = section === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  active
                    ? 'bg-purple-500/15 text-white border border-purple-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="flex-1 text-left">{item.name}</span>
                {item.badge ? (
                  <span className="px-1.5 min-w-[18px] text-center text-[10px] font-bold rounded-full bg-purple-500 text-white">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}

          <div className="pt-2 mt-2 border-t border-white/5">
            <Link
              href="/admin/credits"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 border border-transparent transition"
            >
              <Coins className="w-4 h-4" />
              <span className="flex-1 text-left">Painel de Créditos</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </nav>

        <div className="p-3 border-t border-white/5">
          <div className="flex items-center gap-2 mb-2 px-2 py-1.5">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-[11px] font-bold">
              {user?.email?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] text-white truncate">{user?.email}</div>
              <div className="text-[9px] text-slate-500 uppercase tracking-wider">Administrador</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-[11px] font-medium hover:bg-red-500/20 transition"
          >
            <LogOut className="w-3 h-3" />
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-60">
        <header className="border-b border-white/5 bg-slate-950/80 backdrop-blur sticky top-0 z-10">
          <div className="px-8 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-white">{SECTION_LABELS[section]}</h1>
              <span className="text-[10px] text-slate-600 uppercase tracking-wider">/ EnergiaLivre</span>
            </div>
            <button
              onClick={loadAll}
              disabled={dataLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] text-slate-400 hover:text-white border border-white/10 rounded-lg hover:bg-white/5 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${dataLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
          </div>
        </header>

        <div className="p-8">
          {dataLoading && !stats ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
            </div>
          ) : (
            <>
              {section === 'overview' && stats && <OverviewSection stats={stats} leads={leads} commissions={commissions} pagamentos={pagamentos} />}
              {section === 'geradores' && (
                <GeradoresSection
                  geradores={geradores}
                  onUpdate={loadAll}
                />
              )}
              {section === 'leads' && (
                <LeadsSection
                  leads={leads}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  leadFilter={leadFilter}
                  setLeadFilter={setLeadFilter}
                  updateLeadStatus={updateLeadStatus}
                />
              )}
              {section === 'users' && (
                <UsersSection
                  users={users}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  userFilter={userFilter}
                  setUserFilter={setUserFilter}
                />
              )}
              {section === 'commissions' && (
                <CommissionsSection
                  commissions={commissions}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                />
              )}
              {section === 'finance' && (
                <FinanceSection
                  pagamentos={pagamentos}
                  assinaturas={assinaturas}
                  users={users}
                  tab={financeTab}
                  setTab={setFinanceTab}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                />
              )}
              {section === 'matches' && <MatchesSection matches={matches} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />}
              {section === 'coupons' && <CouponsSection coupons={coupons} users={users} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />}
              {section === 'pages' && <PagesSection />}
              {section === 'settings' && (
                <SettingsSection
                  settings={settings}
                  editing={editingSetting}
                  setEditing={setEditingSetting}
                  updateSetting={updateSetting}
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, accent }: { icon: any; label: string; value: string | number; sub?: string; accent: string }) {
  const accentMap: Record<string, string> = {
    purple: 'text-purple-400',
    yellow: 'text-yellow-400',
    emerald: 'text-emerald-400',
    blue: 'text-blue-400',
    pink: 'text-pink-400',
  };
  return (
    <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5">
      <div className="flex items-center justify-between mb-3">
        <Icon className={`w-4 h-4 ${accentMap[accent]}`} />
        <ArrowUpRight className="w-3 h-3 text-slate-600" />
      </div>
      <div className="text-2xl font-semibold text-white tracking-tight">{value}</div>
      <div className="text-[11px] text-slate-500 mt-0.5">{label}</div>
      {sub && <div className="text-[10px] text-slate-600 mt-1">{sub}</div>}
    </div>
  );
}

function OverviewSection({ stats, leads, commissions, pagamentos }: { stats: Stats; leads: Lead[]; commissions: Commission[]; pagamentos: Pagamento[] }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Users} label="Usuários" value={stats.totalUsuarios} sub={`${stats.embaixadores} parceiros`} accent="purple" />
        <StatCard icon={UserCheck} label="Leads pendentes" value={stats.leadsPendentes} sub={`${stats.totalLeads} no total`} accent="yellow" />
        <StatCard icon={CheckCircle} label="Leads aprovados" value={stats.leadsAprovados} accent="emerald" />
        <StatCard icon={DollarSign} label="Faturamento do mês" value={`R$ ${stats.faturamentoMensal.toFixed(2)}`} sub={`R$ ${stats.faturamentoTotal.toFixed(2)} total`} accent="blue" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={Zap} label="Geradores" value={stats.geradores} accent="yellow" />
        <StatCard icon={UserCheck} label="Parceiros" value={stats.embaixadores} accent="purple" />
        <StatCard icon={CreditCard} label="Assinaturas ativas" value={stats.assinaturasAtivas} accent="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-slate-900/40 border border-white/5">
          <h3 className="text-sm font-medium text-white mb-4">Leads recentes</h3>
          <div className="space-y-2">
            {leads.slice(0, 5).map(lead => (
              <div key={lead.id} className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02]">
                <div className="min-w-0">
                  <div className="text-[13px] text-white truncate">{lead.nome || '—'}</div>
                  <div className="text-[10px] text-slate-500 truncate">{lead.email}</div>
                </div>
                <div className="text-[10px] text-slate-500 ml-2 whitespace-nowrap">
                  {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                </div>
              </div>
            ))}
            {leads.length === 0 && <div className="text-[11px] text-slate-600 text-center py-4">Nenhum lead</div>}
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/40 border border-white/5">
          <h3 className="text-sm font-medium text-white mb-4">Pagamentos recentes</h3>
          <div className="space-y-2">
            {pagamentos.slice(0, 5).map(p => (
              <div key={p.id} className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02]">
                <div className="min-w-0">
                  <div className="text-[13px] text-emerald-400 font-mono">R$ {Number(p.valor).toFixed(2)}</div>
                  <div className="text-[10px] text-slate-500 truncate">{p.tipo_pagamento} · {p.description || '—'}</div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  p.status === 'succeeded' ? 'bg-emerald-500/15 text-emerald-400' :
                  p.status === 'pending' ? 'bg-yellow-500/15 text-yellow-400' :
                  'bg-red-500/15 text-red-400'
                }`}>
                  {p.status}
                </span>
              </div>
            ))}
            {pagamentos.length === 0 && <div className="text-[11px] text-slate-600 text-center py-4">Nenhum pagamento</div>}
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/40 border border-white/5">
          <h3 className="text-sm font-medium text-white mb-4">Comissões recentes</h3>
          <div className="space-y-2">
            {commissions.slice(0, 5).map(c => (
              <div key={c.id} className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02]">
                <div className="min-w-0">
                  <div className="text-[13px] text-emerald-400 font-mono">R$ {Number(c.valor_comissao).toFixed(2)}</div>
                  <div className="text-[10px] text-slate-500 truncate">{c.profiles?.nome || c.profiles?.email || '—'}</div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  c.status_pagamento === 'pago' ? 'bg-emerald-500/15 text-emerald-400' :
                  c.status_pagamento === 'pendente' ? 'bg-yellow-500/15 text-yellow-400' :
                  'bg-red-500/15 text-red-400'
                }`}>
                  {c.status_pagamento}
                </span>
              </div>
            ))}
            {commissions.length === 0 && <div className="text-[11px] text-slate-600 text-center py-4">Nenhuma comissão</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function LeadsSection({ leads, searchTerm, setSearchTerm, leadFilter, setLeadFilter, updateLeadStatus }: any) {
  const filtered = (leads as Lead[]).filter(l => {
    if (leadFilter === 'pendentes') return !l.status || l.status === 'pendente';
    if (leadFilter === 'aprovados') return l.status === 'aprovado';
    if (leadFilter === 'recusados') return l.status === 'recusado';
    return true;
  }).filter(l => {
    if (!searchTerm) return true;
    const t = searchTerm.toLowerCase();
    return (l.nome || '').toLowerCase().includes(t) || (l.email || '').toLowerCase().includes(t) || (l.whatsapp || '').includes(t);
  });

  const filters: { id: typeof leadFilter; label: string }[] = [
    { id: 'todos', label: 'Todos' },
    { id: 'pendentes', label: 'Pendentes' },
    { id: 'aprovados', label: 'Aprovados' },
    { id: 'recusados', label: 'Recusados' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex gap-1.5 flex-wrap">
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setLeadFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition ${
                leadFilter === f.id ? 'bg-purple-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por nome, e-mail ou WhatsApp..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/50 border border-white/10 rounded-lg py-1.5 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-purple-500 outline-none"
          />
        </div>
      </div>

      <div className="rounded-xl bg-slate-900/40 border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/5 text-slate-500 text-[10px] uppercase tracking-wider">
              <tr>
                <th className="p-3 text-left font-medium">Data</th>
                <th className="p-3 text-left font-medium">Nome</th>
                <th className="p-3 text-left font-medium">Contato</th>
                <th className="p-3 text-left font-medium">Local</th>
                <th className="p-3 text-left font-medium">Tipo</th>
                <th className="p-3 text-left font-medium">Status</th>
                <th className="p-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-slate-600 text-xs">Nenhum lead encontrado</td></tr>
              ) : (
                filtered.map(lead => (
                  <tr key={lead.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="p-3 text-[11px] text-slate-500 whitespace-nowrap">{new Date(lead.created_at).toLocaleDateString('pt-BR')}</td>
                    <td className="p-3 text-white text-[13px]">{lead.nome || '—'}</td>
                    <td className="p-3">
                      <div className="text-[11px] text-slate-400 flex items-center gap-1"><Mail className="w-3 h-3" />{lead.email}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" />{lead.whatsapp}</div>
                    </td>
                    <td className="p-3 text-[11px] text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3" />{lead.cidade}/{lead.estado}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 text-[10px] font-medium">{lead.tipo}</span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        lead.status === 'aprovado' ? 'bg-emerald-500/15 text-emerald-400' :
                        lead.status === 'recusado' ? 'bg-red-500/15 text-red-400' :
                        'bg-yellow-500/15 text-yellow-400'
                      }`}>
                        {lead.status || 'pendente'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {(!lead.status || lead.status === 'pendente') ? (
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => updateLeadStatus(lead.id, 'aprovado')} className="p-1.5 rounded bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25" title="Aprovar">
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => updateLeadStatus(lead.id, 'recusado')} className="p-1.5 rounded bg-red-500/15 text-red-400 hover:bg-red-500/25" title="Recusar">
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function UsersSection({ users, searchTerm, setSearchTerm, userFilter, setUserFilter }: any) {
  const filtered = (users as ProfileRow[]).filter(u => {
    if (userFilter === 'todos') return true;
    return u.tipo === userFilter;
  }).filter(u => {
    if (!searchTerm) return true;
    const t = searchTerm.toLowerCase();
    return (u.nome || '').toLowerCase().includes(t) || (u.email || '').toLowerCase().includes(t);
  });

  const filters: { id: typeof userFilter; label: string }[] = [
    { id: 'todos', label: 'Todos' },
    { id: 'consumidor', label: 'Consumidores' },
    { id: 'gerador', label: 'Geradores' },
    { id: 'parceiro', label: 'Parceiros' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex gap-1.5 flex-wrap">
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setUserFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition ${
                userFilter === f.id ? 'bg-purple-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar usuário..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/50 border border-white/10 rounded-lg py-1.5 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-purple-500 outline-none"
          />
        </div>
      </div>

      <div className="rounded-xl bg-slate-900/40 border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/5 text-slate-500 text-[10px] uppercase tracking-wider">
              <tr>
                <th className="p-3 text-left font-medium">Nome</th>
                <th className="p-3 text-left font-medium">Email</th>
                <th className="p-3 text-left font-medium">Tipo</th>
                <th className="p-3 text-left font-medium">Role</th>
                <th className="p-3 text-left font-medium">Local</th>
                <th className="p-3 text-left font-medium">Cadastro</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-600 text-xs">Nenhum usuário</td></tr>
              ) : (
                filtered.map(u => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="p-3 text-white text-[13px]">{u.nome || '—'}</td>
                    <td className="p-3 text-[11px] text-slate-400">{u.email || '—'}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 text-[10px] font-medium">{u.tipo || 'consumidor'}</span>
                    </td>
                    <td className="p-3">
                      {u.role === 'admin' ? (
                        <span className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 text-[10px] font-medium">admin</span>
                      ) : (
                        <span className="text-slate-600 text-[11px]">user</span>
                      )}
                    </td>
                    <td className="p-3 text-[11px] text-slate-400">{u.cidade || '—'}/{u.estado || '—'}</td>
                    <td className="p-3 text-[11px] text-slate-500">{new Date(u.created_at).toLocaleDateString('pt-BR')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CommissionsSection({ commissions, searchTerm, setSearchTerm }: any) {
  const filtered = (commissions as Commission[]).filter(c => {
    if (!searchTerm) return true;
    const t = searchTerm.toLowerCase();
    return (c.profiles?.nome || '').toLowerCase().includes(t) || (c.profiles?.email || '').toLowerCase().includes(t);
  });

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
        <input
          type="text"
          placeholder="Buscar por parceiro..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900/50 border border-white/10 rounded-lg py-1.5 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-purple-500 outline-none"
        />
      </div>

      <div className="rounded-xl bg-slate-900/40 border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/5 text-slate-500 text-[10px] uppercase tracking-wider">
              <tr>
                <th className="p-3 text-left font-medium">Parceiro</th>
                <th className="p-3 text-left font-medium">Valor</th>
                <th className="p-3 text-left font-medium">%</th>
                <th className="p-3 text-left font-medium">Tipo</th>
                <th className="p-3 text-left font-medium">Ref</th>
                <th className="p-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-600 text-xs">Nenhuma comissão</td></tr>
              ) : (
                filtered.map(c => (
                  <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="p-3 text-[13px] text-white">{c.profiles?.nome || c.profiles?.email || '—'}</td>
                    <td className="p-3 text-emerald-400 font-mono text-[13px]">R$ {Number(c.valor_comissao).toFixed(2)}</td>
                    <td className="p-3 text-[11px] text-slate-400">{c.percentual}%</td>
                    <td className="p-3 text-[11px] text-slate-400">{c.tipo_comissao}</td>
                    <td className="p-3 text-[11px] text-slate-500">{String(c.mes_referencia).padStart(2, '0')}/{c.ano_referencia}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        c.status_pagamento === 'pago' ? 'bg-emerald-500/15 text-emerald-400' :
                        c.status_pagamento === 'pendente' ? 'bg-yellow-500/15 text-yellow-400' :
                        'bg-red-500/15 text-red-400'
                      }`}>
                        {c.status_pagamento}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FinanceSection({ pagamentos, assinaturas, users, tab, setTab, searchTerm, setSearchTerm }: any) {
  const userById = new Map((users as ProfileRow[]).map(u => [u.id, u]));
  const filteredPag = (pagamentos as Pagamento[]).filter(p => {
    if (!searchTerm) return true;
    const t = searchTerm.toLowerCase();
    return (p.description || '').toLowerCase().includes(t) || (p.tipo_pagamento || '').toLowerCase().includes(t);
  });
  const filteredAss = (assinaturas as Assinatura[]).filter(a => {
    if (!searchTerm) return true;
    const t = searchTerm.toLowerCase();
    return (a.nome_plano || '').toLowerCase().includes(t) || (a.tipo_plano || '').toLowerCase().includes(t);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-white/5">
        {(['pagamentos', 'assinaturas'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-[12px] font-medium transition border-b-2 ${
              tab === t
                ? 'border-purple-500 text-white'
                : 'border-transparent text-slate-500 hover:text-white'
            }`}
          >
            {t === 'pagamentos' ? `Pagamentos (${pagamentos.length})` : `Assinaturas (${assinaturas.length})`}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
        <input
          type="text"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900/50 border border-white/10 rounded-lg py-1.5 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-purple-500 outline-none"
        />
      </div>

      {tab === 'pagamentos' ? (
        <div className="rounded-xl bg-slate-900/40 border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/5 text-slate-500 text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="p-3 text-left font-medium">Data</th>
                  <th className="p-3 text-left font-medium">Usuário</th>
                  <th className="p-3 text-left font-medium">Tipo</th>
                  <th className="p-3 text-left font-medium">Valor</th>
                  <th className="p-3 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredPag.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-600 text-xs">Nenhum pagamento</td></tr>
                ) : (
                  filteredPag.map(p => {
                    const u = userById.get(p.user_id);
                    return (
                      <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                        <td className="p-3 text-[11px] text-slate-500 whitespace-nowrap">{new Date(p.created_at).toLocaleDateString('pt-BR')}</td>
                        <td className="p-3 text-[13px] text-white">{u?.nome || u?.email || '—'}</td>
                        <td className="p-3 text-[11px] text-slate-400">{p.tipo_pagamento}</td>
                        <td className="p-3 text-emerald-400 font-mono text-[13px]">R$ {Number(p.valor).toFixed(2)}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            p.status === 'succeeded' ? 'bg-emerald-500/15 text-emerald-400' :
                            p.status === 'pending' ? 'bg-yellow-500/15 text-yellow-400' :
                            'bg-red-500/15 text-red-400'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-slate-900/40 border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/5 text-slate-500 text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="p-3 text-left font-medium">Plano</th>
                  <th className="p-3 text-left font-medium">Usuário</th>
                  <th className="p-3 text-left font-medium">Tipo</th>
                  <th className="p-3 text-left font-medium">Valor/mês</th>
                  <th className="p-3 text-left font-medium">Renova em</th>
                  <th className="p-3 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAss.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-slate-600 text-xs">Nenhuma assinatura</td></tr>
                ) : (
                  filteredAss.map(a => {
                    const u = userById.get(a.user_id);
                    return (
                      <tr key={a.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                        <td className="p-3 text-[13px] text-white">{a.nome_plano}</td>
                        <td className="p-3 text-[11px] text-slate-400">{u?.nome || u?.email || '—'}</td>
                        <td className="p-3 text-[11px] text-slate-400">{a.tipo_plano}</td>
                        <td className="p-3 text-emerald-400 font-mono text-[13px]">R$ {Number(a.valor_mensal).toFixed(2)}</td>
                        <td className="p-3 text-[11px] text-slate-500">{new Date(a.current_period_end).toLocaleDateString('pt-BR')}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            a.status === 'active' ? 'bg-emerald-500/15 text-emerald-400' :
                            a.status === 'past_due' ? 'bg-yellow-500/15 text-yellow-400' :
                            'bg-red-500/15 text-red-400'
                          }`}>
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function MatchesSection({ matches, searchTerm, setSearchTerm }: any) {
  const filtered = (matches as MatchProposal[]).filter(m => {
    if (!searchTerm) return true;
    return m.id.toString().includes(searchTerm);
  });

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
        <input
          type="text"
          placeholder="Buscar por ID..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900/50 border border-white/10 rounded-lg py-1.5 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-purple-500 outline-none"
        />
      </div>

      <div className="rounded-xl bg-slate-900/40 border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/5 text-slate-500 text-[10px] uppercase tracking-wider">
              <tr>
                <th className="p-3 text-left font-medium">ID</th>
                <th className="p-3 text-left font-medium">From</th>
                <th className="p-3 text-left font-medium">To</th>
                <th className="p-3 text-left font-medium">kWh</th>
                <th className="p-3 text-left font-medium">Valor</th>
                <th className="p-3 text-left font-medium">Status</th>
                <th className="p-3 text-left font-medium">Criado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-slate-600 text-xs">Nenhuma proposta</td></tr>
              ) : (
                filtered.map(m => (
                  <tr key={m.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="p-3 text-[11px] text-slate-500 font-mono">#{m.id}</td>
                    <td className="p-3 text-[10px] text-slate-400 font-mono">{m.from_user_id.slice(0, 8)}...</td>
                    <td className="p-3 text-[10px] text-slate-400 font-mono">{m.to_user_id.slice(0, 8)}...</td>
                    <td className="p-3 text-[11px] text-slate-300">{m.kwh_proposto ? `${m.kwh_proposto} kWh` : '—'}</td>
                    <td className="p-3 text-emerald-400 font-mono text-[12px]">{m.valor_proposto ? `R$ ${Number(m.valor_proposto).toFixed(2)}` : '—'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        m.status === 'accepted' ? 'bg-emerald-500/15 text-emerald-400' :
                        m.status === 'pending' ? 'bg-yellow-500/15 text-yellow-400' :
                        m.status === 'rejected' ? 'bg-red-500/15 text-red-400' :
                        'bg-slate-500/15 text-slate-400'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="p-3 text-[11px] text-slate-500">{new Date(m.created_at).toLocaleDateString('pt-BR')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CouponsSection({ coupons, users, searchTerm, setSearchTerm }: any) {
  const userById = new Map((users as ProfileRow[]).map(u => [u.id, u]));
  const filtered = (coupons as Coupon[]).filter(c => {
    if (!searchTerm) return true;
    const t = searchTerm.toLowerCase();
    return c.code.toLowerCase().includes(t);
  });

  const used = (coupons as Coupon[]).filter(c => c.used_by).length;
  const available = (coupons as Coupon[]).filter(c => !c.used_by).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={Ticket} label="Total" value={coupons.length} accent="purple" />
        <StatCard icon={CheckCircle} label="Resgatados" value={used} accent="emerald" />
        <StatCard icon={Clock} label="Disponíveis" value={available} accent="yellow" />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
        <input
          type="text"
          placeholder="Buscar por código..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900/50 border border-white/10 rounded-lg py-1.5 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-purple-500 outline-none"
        />
      </div>

      <div className="rounded-xl bg-slate-900/40 border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/5 text-slate-500 text-[10px] uppercase tracking-wider">
              <tr>
                <th className="p-3 text-left font-medium">Código</th>
                <th className="p-3 text-left font-medium">Criado por</th>
                <th className="p-3 text-left font-medium">Bônus</th>
                <th className="p-3 text-left font-medium">Usado por</th>
                <th className="p-3 text-left font-medium">Resgatado em</th>
                <th className="p-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-600 text-xs">Nenhum cupom</td></tr>
              ) : (
                filtered.map(c => {
                  const creator = c.created_by ? userById.get(c.created_by) : null;
                  const user = c.used_by ? userById.get(c.used_by) : null;
                  return (
                    <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="p-3 text-[13px] font-mono text-white">{c.code}</td>
                      <td className="p-3 text-[11px] text-slate-400">{creator?.nome || creator?.email?.slice(0, 12) || '—'}</td>
                      <td className="p-3 text-[11px] text-yellow-400">+{c.bonus_coins} moedas</td>
                      <td className="p-3 text-[11px] text-slate-400">{user?.nome || user?.email || '—'}</td>
                      <td className="p-3 text-[11px] text-slate-500">{c.used_at ? new Date(c.used_at).toLocaleDateString('pt-BR') : '—'}</td>
                      <td className="p-3">
                        {c.used_by ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-medium">resgatado</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 text-[10px] font-medium">disponível</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const PAGES_LIST = [
  { name: 'Home', path: '/', desc: 'Página inicial do marketplace' },
  { name: 'Login', path: '/login', desc: 'Login de usuários' },
  { name: 'Cadastro', path: '/cadastro', desc: 'Cadastro de novos usuários' },
  { name: 'Cadastro Gerador', path: '/cadastro-gerador', desc: 'Cadastro específico para geradores' },
  { name: 'Cadastro Parceiro', path: '/cadastro-embaixador', desc: 'Cadastro de parceiros' },
  { name: 'Dashboard Consumidor', path: '/dashboard-consumidor', desc: 'Painel do consumidor' },
  { name: 'Dashboard Gerador', path: '/dashboard-gerador', desc: 'Painel do gerador' },
  { name: 'Dashboard Parceiro', path: '/embaixador/dashboard', desc: 'Painel do parceiro' },
  { name: 'Match', path: '/match', desc: 'Página de match de usinas' },
  { name: 'Simulador', path: '/simulador', desc: 'Simulador de economia' },
  { name: 'Vender', path: '/vender', desc: 'Página para geradores' },
  { name: 'Token KWATT', path: '/token', desc: 'Página do token KWATT' },
  { name: 'Regulamentação', path: '/regulamentacao', desc: 'Regulamentação ANEEL' },
  { name: 'Manifesto', path: '/manifesto', desc: 'Manifesto da empresa' },
  { name: 'Termos', path: '/termos', desc: 'Termos de serviço' },
  { name: 'Para Geradores', path: '/para-geradores', desc: 'Landing para geradores' },
  { name: 'Painel Admin', path: '/admin/dashboard', desc: 'Este painel administrativo' },
  { name: 'Painel Créditos', path: '/admin/credits', desc: 'Gerenciamento de créditos' },
  { name: 'Painel Leads', path: '/admin/leads', desc: 'Gerenciamento de leads' },
];

function PagesSection() {
  const [filter, setFilter] = useState('')
  const filtered = PAGES_LIST.filter(p => 
    p.name.toLowerCase().includes(filter.toLowerCase()) || 
    p.path.toLowerCase().includes(filter.toLowerCase())
  )
  
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
        <input
          type="text"
          placeholder="Buscar página..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="w-full bg-slate-900/50 border border-white/10 rounded-lg py-1.5 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-purple-500 outline-none"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(page => (
          <Link
            key={page.path}
            href={page.path}
            target="_blank"
            rel="noopener noreferrer"
            className="group p-4 rounded-xl bg-slate-900/40 border border-white/5 hover:border-purple-500/30 hover:bg-slate-900/60 transition-all"
          >
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-white group-hover:text-purple-400 transition">{page.name}</h3>
              <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover:text-purple-400 transition" />
            </div>
            <p className="text-[10px] text-slate-500 font-mono">{page.path}</p>
            <p className="text-[11px] text-slate-400 mt-1">{page.desc}</p>
          </Link>
        ))}
      </div>
      <p className="text-[11px] text-slate-600">{filtered.length} página(s) encontrada(s)</p>
    </div>
  );
}

function GeradoresSection({ geradores, onUpdate }: { geradores: GeradorRow[]; onUpdate: () => void }) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setActionLoading(id);
    try {
      await fetch('/api/admin/geradores', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      onUpdate();
    } catch {
      // silent
    } finally {
      setActionLoading(null);
    }
  };

  const pendentes = geradores.filter(g => g.status === 'pendente');
  const aprovados = geradores.filter(g => g.status === 'aprovado');
  const ativos = geradores.filter(g => g.status === 'ativo');
  const inativos = geradores.filter(g => g.status === 'inativo');

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <StatCard icon={Clock} label="Pendentes" value={pendentes.length} accent="yellow" />
        <StatCard icon={CheckCircle} label="Aprovados" value={aprovados.length} accent="emerald" />
        <StatCard icon={Zap} label="Ativos" value={ativos.length} accent="blue" />
        <StatCard icon={XCircle} label="Inativos" value={inativos.length} accent="red" />
      </div>

      <div className="rounded-xl bg-slate-900/40 border border-white/5 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-white/5 bg-white/[0.02]">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Usinas Pendentes ({pendentes.length})
          </h3>
        </div>
        {pendentes.length === 0 ? (
          <div className="p-8 text-center text-slate-600 text-xs">Nenhuma usina pendente de aprovação</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/5 text-slate-500 text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="p-3 text-left font-medium">Usina</th>
                  <th className="p-3 text-left font-medium">Proprietário</th>
                  <th className="p-3 text-left font-medium">kWp</th>
                  <th className="p-3 text-left font-medium">Excedente</th>
                  <th className="p-3 text-left font-medium">Concessionária</th>
                  <th className="p-3 text-left font-medium">Local</th>
                  <th className="p-3 text-left font-medium">Data</th>
                  <th className="p-3 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {pendentes.map(g => (
                  <tr key={g.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="p-3 text-[13px] text-white font-medium">{g.nome_usina}</td>
                    <td className="p-3 text-[11px] text-slate-400">{g.profiles?.nome || g.profiles?.email || '—'}</td>
                    <td className="p-3 text-[11px] text-slate-300">{g.capacidade_kwp} kWp</td>
                    <td className="p-3 text-[11px] text-emerald-400">{g.excedente_mensal_kwh} kWh/mês</td>
                    <td className="p-3 text-[11px] text-slate-400">{g.concessionaria}</td>
                    <td className="p-3 text-[11px] text-slate-400">{g.cidade}/{g.estado}</td>
                    <td className="p-3 text-[11px] text-slate-500">{new Date(g.created_at).toLocaleDateString('pt-BR')}</td>
                    <td className="p-3 text-right">
                      <div className="flex gap-1 justify-end">
                        <button
                          onClick={() => handleAction(g.id, 'approve')}
                          disabled={actionLoading === g.id}
                          className="p-1.5 rounded bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 disabled:opacity-50"
                          title="Aprovar usina"
                        >
                          {actionLoading === g.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleAction(g.id, 'reject')}
                          disabled={actionLoading === g.id}
                          className="p-1.5 rounded bg-red-500/15 text-red-400 hover:bg-red-500/25 disabled:opacity-50"
                          title="Recusar usina"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {aprovados.length > 0 && (
        <div className="rounded-xl bg-slate-900/40 border border-white/5 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-white/5 bg-white/[0.02]">
            <h3 className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
              Usinas Aprovadas ({aprovados.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/5 text-slate-500 text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="p-3 text-left font-medium">Usina</th>
                  <th className="p-3 text-left font-medium">Proprietário</th>
                  <th className="p-3 text-left font-medium">kWp</th>
                  <th className="p-3 text-left font-medium">Excedente</th>
                  <th className="p-3 text-left font-medium">Aprovado em</th>
                </tr>
              </thead>
              <tbody>
                {aprovados.slice(0, 10).map(g => (
                  <tr key={g.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="p-3 text-[13px] text-white">{g.nome_usina}</td>
                    <td className="p-3 text-[11px] text-slate-400">{g.profiles?.nome || g.profiles?.email || '—'}</td>
                    <td className="p-3 text-[11px] text-slate-300">{g.capacidade_kwp} kWp</td>
                    <td className="p-3 text-[11px] text-emerald-400">{g.excedente_mensal_kwh} kWh/mês</td>
                    <td className="p-3 text-[11px] text-slate-500">{g.data_aprovacao ? new Date(g.data_aprovacao).toLocaleDateString('pt-BR') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsSection({ settings, editing, setEditing, updateSetting }: any) {
  const grouped = (settings as SystemSetting[]).reduce<Record<string, SystemSetting[]>>((acc, s) => {
    (acc[s.category] = acc[s.category] || []).push(s);
    return acc;
  }, {});

  const categoryLabels: Record<string, string> = {
    general: 'Geral',
    commissions: 'Comissões',
    email: 'E-mail',
    features: 'Features',
    integrations: 'Integrações',
  };

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat} className="rounded-xl bg-slate-900/40 border border-white/5 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-white/5 bg-white/[0.02]">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{categoryLabels[cat] || cat}</h3>
          </div>
          <div className="divide-y divide-white/5">
            {items.map(s => {
              const isEditing = editing === s.key;
              const displayValue = typeof s.value === 'string' ? s.value : JSON.stringify(s.value);
              return (
                <div key={s.key} className="p-4 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] text-white font-mono">{s.key}</div>
                    {s.description && <div className="text-[11px] text-slate-500 mt-0.5">{s.description}</div>}
                  </div>
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          defaultValue={displayValue}
                          autoFocus
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              const v = (e.target as HTMLInputElement).value;
                              try {
                                updateSetting(s.key, JSON.parse(v));
                              } catch {
                                updateSetting(s.key, v);
                              }
                            }
                            if (e.key === 'Escape') setEditing(null);
                          }}
                          className="bg-slate-800 border border-purple-500/50 rounded px-2 py-1 text-[12px] text-white font-mono w-40 outline-none"
                        />
                        <button onClick={() => setEditing(null)} className="p-1.5 text-slate-400 hover:text-white">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <code className="text-[12px] text-emerald-400 font-mono bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/20 max-w-[200px] truncate">
                          {displayValue}
                        </code>
                        {s.is_public && <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 uppercase tracking-wider">público</span>}
                        <button onClick={() => setEditing(s.key)} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
