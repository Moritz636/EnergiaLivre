'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/app/hooks/useAuth';
import { getSupabase } from '@/lib/supabase/singleton';
import {
  Users,
  TrendingUp,
  DollarSign,
  Activity,
  LogOut,
  Loader2,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  MapPin,
  Calendar,
  RefreshCw,
  BarChart3,
  UserCheck,
  Zap,
  Target,
  Sparkles,
  ArrowUpRight,
  AlertCircle,
  Eye,
  Settings,
  Download,
  Share2,
  Shield,
} from 'lucide-react';

interface Lead {
  id: number;
  nome: string;
  email: string;
  whatsapp: string;
  cidade: string;
  tipo: string;
  status: string;
  created_at: string;
}

interface Estatisticas {
  total_usuarios: number;
  total_geradores: number;
  total_consumidores: number;
  total_leads: number;
  leads_aprovados: number;
  assinaturas_ativas: number;
  faturamento_mensal: number;
  total_comissoes: number;
  volume_transacoes: number;
}

export default function AdminDashboardPage() {
  const { user, profile, loading, isAdmin, logout } = useAdminAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const [filter, setFilter] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingStats, setLoadingStats] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');
  const supabase = getSupabase();

  useEffect(() => {
    if (isAdmin) {
      loadLeads();
      loadEstatisticas();
    }
  }, [isAdmin]);

  const loadLeads = async () => {
    setLoadingStats(true);
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setLeads(data);
    setLoadingStats(false);
  };

  const loadEstatisticas = async () => {
    setLoadingStats(true);
    try {
      const { data } = await (supabase as any)
        .from('view_estatisticas_sistema')
        .select('*')
        .single();

      if (data) setEstatisticas(data as Estatisticas);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    const { error } = await (supabase as any)
      .from('leads')
      .update({ status })
      .eq('id', id);

    if (!error) loadLeads();
  };

  const filteredLeads = leads.filter(lead => {
    if (filter === 'pendentes') return lead.status === 'pendente' || !lead.status;
    if (filter === 'aprovados') return lead.status === 'aprovado';
    if (filter === 'recusados') return lead.status === 'recusado';
    return true;
  }).filter(lead => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      lead.nome?.toLowerCase().includes(term) ||
      lead.email?.toLowerCase().includes(term) ||
      lead.whatsapp?.includes(term) ||
      lead.cidade?.toLowerCase().includes(term)
    );
  });

  const stats = {
    total: leads.length,
    pendentes: leads.filter(l => l.status === 'pendente' || !l.status).length,
    aprovados: leads.filter(l => l.status === 'aprovado').length,
    recusados: leads.filter(l => l.status === 'recusado').length,
  };

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Visão Geral', icon: BarChart3 },
    { id: 'leads', name: 'Leads', icon: Users },
    { id: 'comissoes', name: 'Comissões', icon: DollarSign },
    { id: 'config', name: 'Configurações', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200">
      {/* Navbar */}
      <nav className="border-b border-white/10 bg-slate-900/90 backdrop-blur-xl fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Shield className="text-white w-4 h-4" />
            </div>
            <span className="text-xl font-bold text-white">ENERGIA<span className="text-purple-500">LIVRE</span></span>
            <div className="ml-3 px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-[9px] font-bold text-purple-300 uppercase">
              Admin
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm text-slate-400">
              <Shield className="w-4 h-4 text-purple-500" />
              <span>{user?.email}</span>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-sm hover:bg-red-500/30 transition-all flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="pt-20 px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Painel Administrativo</h1>
            <p className="text-slate-400">Gerencie leads, visualize estatísticas e controle o sistema</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 border-b border-white/10">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-t-lg transition ${
                    selectedTab === tab.id
                      ? 'bg-purple-500/20 text-purple-300 border-b-2 border-purple-500'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          {selectedTab === 'overview' && (
            <>
              {/* Estatísticas Principais */}
              {estatisticas && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30">
                    <Users className="w-6 h-6 text-purple-400 mb-2" />
                    <p className="text-3xl font-bold text-white">{estatisticas.total_usuarios}</p>
                    <p className="text-xs text-slate-400">Total de Usuários</p>
                    <div className="mt-3 text-[10px] text-purple-400/80 flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3" /> +15% este mês
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-600/10 border border-emerald-500/30">
                    <CheckCircle className="w-6 h-6 text-emerald-400 mb-2" />
                    <p className="text-3xl font-bold text-white">{estatisticas.leads_aprovados}</p>
                    <p className="text-xs text-slate-400">Leads Aprovados</p>
                    <div className="mt-3 text-[10px] text-emerald-400/80">
                      {((estatisticas.leads_aprovados / estatisticas.total_leads) * 100).toFixed(1)}% taxa
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-amber-600/10 border border-yellow-500/30">
                    <DollarSign className="w-6 h-6 text-yellow-400 mb-2" />
                    <p className="text-3xl font-bold text-white">R$ {estatisticas.faturamento_mensal.toFixed(2)}</p>
                    <p className="text-xs text-slate-400">Faturamento Mensal</p>
                    <div className="mt-3 text-[10px] text-yellow-400/80">
                      <ArrowUpRight className="w-3 h-3" /> +8% este mês
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-600/10 border border-blue-500/30">
                    <Sparkles className="w-6 h-6 text-blue-400 mb-2" />
                    <p className="text-3xl font-bold text-white">{estatisticas.total_comissoes.toFixed(2)}</p>
                    <p className="text-xs text-slate-400">Comissões Pagas</p>
                    <div className="mt-3 text-[10px] text-blue-400/80">
                      {estatisticas.assinaturas_ativas} ativos
                    </div>
                  </div>
                </div>
              )}

              {/* Leads Table */}
              <div className="mb-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-2">Leids Pendentes</h2>
                    <p className="text-slate-400">Aprove ou recuse os cadastros pendentes</p>
                  </div>
                  <button
                    onClick={loadLeads}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition"
                  >
                    <RefreshCw className="w-4 h-4" /> Atualizar
                  </button>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setFilter('todos')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        filter === 'todos' 
                          ? 'bg-purple-500 text-white' 
                          : 'bg-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      Todos ({stats.total})
                    </button>
                    <button
                      onClick={() => setFilter('pendentes')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        filter === 'pendentes' 
                          ? 'bg-yellow-500 text-slate-900' 
                          : 'bg-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      Pendentes ({stats.pendentes})
                    </button>
                    <button
                      onClick={() => setFilter('aprovados')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        filter === 'aprovados' 
                          ? 'bg-emerald-500 text-slate-900' 
                          : 'bg-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      Aprovados ({stats.aprovados})
                    </button>
                  </div>
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Buscar por nome, e-mail, WhatsApp..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition"
                    />
                  </div>
                </div>

                {/* Table */}
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-white/10 bg-white/5">
                        <tr className="text-left text-slate-400 text-sm">
                          <th className="p-4">Data</th>
                          <th className="p-4">Nome</th>
                          <th className="p-4">Contato</th>
                          <th className="p-4">Local</th>
                          <th className="p-4">Tipo</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan={7} className="p-8 text-center">
                              <Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-500" />
                            </td>
                          </tr>
                        ) : filteredLeads.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-slate-500">
                              Nenhum lead encontrado
                            </td>
                          </tr>
                        ) : (
                          filteredLeads.map((lead) => (
                            <tr key={lead.id} className="border-b border-white/5 hover:bg-white/5 transition">
                              <td className="p-4 text-slate-500 text-sm">
                                {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                              </td>
                              <td className="p-4 font-medium text-white">{lead.nome || '-'}</td>
                              <td className="p-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1 text-xs text-slate-300">
                                    <Mail className="w-3 h-3" /> {lead.email || '-'}
                                  </div>
                                  <div className="flex items-center gap-1 text-xs text-slate-300">
                                    <Phone className="w-3 h-3" /> {lead.whatsapp || '-'}
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-1 text-slate-300 text-sm">
                                  <MapPin className="w-3 h-3" /> {lead.cidade || '-'}
                                </div>
                              </td>
                              <td className="p-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  lead.tipo === 'gerador' 
                                    ? 'bg-blue-500/20 text-blue-400' 
                                    : 'bg-emerald-500/20 text-emerald-400'
                                }`}>
                                  {lead.tipo === 'gerador' ? '⚡ Gerador' : '💰 Consumidor'}
                                </span>
                              </td>
                              <td className="p-4">
                                {lead.status === 'aprovado' && (
                                  <span className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-1 w-fit">
                                    <CheckCircle className="w-3 h-3" /> Aprovado
                                  </span>
                                )}
                                {lead.status === 'recusado' && (
                                  <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-medium flex items-center gap-1 w-fit">
                                    <XCircle className="w-3 h-3" /> Recusado
                                  </span>
                                )}
                                {(lead.status === 'pendente' || !lead.status) && (
                                  <span className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium flex items-center gap-1 w-fit">
                                    <Clock className="w-3 h-3" /> Pendente
                                  </span>
                                )}
                              </td>
                              <td className="p-4">
                                {(lead.status === 'pendente' || !lead.status) && (
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => updateStatus(lead.id, 'aprovado')}
                                      className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition"
                                      title="Aprovar"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => updateStatus(lead.id, 'recusado')}
                                      className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition"
                                      title="Recusar"
                                    >
                                      <XCircle className="w-4 h-4" />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}

          {selectedTab === 'leads' && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">Gestão de Leads</h2>
              <p className="text-slate-400 mb-6">Gerencie todos os leads do sistema</p>
              <button
                onClick={loadLeads}
                className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-400 transition"
              >
                Recarregar Leads
              </button>
            </div>
          )}

          {selectedTab === 'comissoes' && (
            <div className="text-center py-12">
              <DollarSign className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">Comissões</h2>
              <p className="text-slate-400 mb-6">Monitore e gerencie as comissões dos embaixadores</p>
              <button
                onClick={() => window.location.href = '/comissoes'}
                className="px-6 py-3 bg-yellow-500 text-slate-900 rounded-lg hover:bg-yellow-400 transition"
              >
                Ir para Comissões
              </button>
            </div>
          )}

          {selectedTab === 'config' && (
            <div className="text-center py-12">
              <Settings className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">Configurações</h2>
              <p className="text-slate-400 mb-6">Configure o sistema e suas preferências</p>
              <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition">
                Acessar Configurações
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}