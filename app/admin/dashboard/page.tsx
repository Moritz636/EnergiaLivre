'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, 
  Zap, 
  TrendingUp, 
  Activity,
  Shield,
  Loader2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Search,
  Filter,
  ArrowLeft,
  Download,
  RefreshCw,
  BarChart3,
  UserCheck,
  UserX,
  DollarSign,
  Award
} from 'lucide-react';

const ADMIN_EMAIL = 'energialivreofc@gmail.com';

interface Lead {
  id: number;
  nome: string;
  email: string;
  whatsapp: string;
  cidade: string;
  estado: string;
  capacidade: string;
  tipo: string;
  status: string;
  created_at: string;
}

export default function AdminDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [authChecking, setAuthChecking] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push('/admin-login');
        return;
      }
      
      setUser(user);
      setAuthChecking(false);
      carregarLeads();
    };
    
    checkAdmin();
  }, []);

  const carregarLeads = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setLeads(data);
    setLoading(false);
  };

  const atualizarStatus = async (id: number, status: string) => {
    const { error } = await supabase
      .from('leads')
      .update({ status })
      .eq('id', id);
    
    if (!error) carregarLeads();
  };

  const leadsFiltrados = leads.filter(lead => {
    if (filter === 'pendentes') return lead.status === 'pendente' || !lead.status;
    if (filter === 'aprovados') return lead.status === 'aprovado';
    if (filter === 'recusados') return lead.status === 'recusado';
    return true;
  }).filter(lead => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (lead.nome?.toLowerCase().includes(term) ||
            lead.email?.toLowerCase().includes(term) ||
            lead.whatsapp?.includes(term) ||
            lead.cidade?.toLowerCase().includes(term));
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'aprovado':
        return <span className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Aprovado</span>;
      case 'recusado':
        return <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-medium flex items-center gap-1"><XCircle className="w-3 h-3" /> Recusado</span>;
      default:
        return <span className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium flex items-center gap-1"><Clock className="w-3 h-3" /> Pendente</span>;
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  const stats = {
    total: leads.length,
    pendentes: leads.filter(l => l.status === 'pendente' || !l.status).length,
    aprovados: leads.filter(l => l.status === 'aprovado').length,
    recusados: leads.filter(l => l.status === 'recusado').length,
    geradores: leads.filter(l => l.tipo === 'gerador').length,
    consumidores: leads.filter(l => l.tipo === 'consumidor').length,
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
      
      {/* Navbar */}
      <nav className="border-b border-white/10 bg-[#020617]/90 backdrop-blur-xl fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Shield className="text-slate-900 w-4 h-4" />
            </div>
            <span className="text-xl font-black text-white">ENERGIA<span className="text-purple-500">LIVRE</span></span>
            <div className="ml-3 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-[9px] font-black text-purple-400 uppercase">
              Admin
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm text-slate-400">
              <Shield className="w-4 h-4 text-purple-400" />
              <span>{user?.email}</span>
            </div>
            <button
              onClick={() => supabase.auth.signOut()}
              className="px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-sm hover:bg-red-500/20 transition-all"
            >
              Sair
            </button>
          </div>
        </div>
      </nav>

      <div className="pt-20 px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Painel Administrativo</h1>
            <p className="text-slate-400 mt-1">Gerencie leads, visualize estatísticas e controle o fluxo de cadastros</p>
          </div>

          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/5 border border-purple-500/30 text-center">
              <Users className="w-5 h-5 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-xs text-slate-400">Total Leads</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 to-amber-500/5 border border-yellow-500/30 text-center">
              <Clock className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats.pendentes}</p>
              <p className="text-xs text-slate-400">Pendentes</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/5 border border-emerald-500/30 text-center">
              <CheckCircle className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats.aprovados}</p>
              <p className="text-xs text-slate-400">Aprovados</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/30 text-center">
              <XCircle className="w-5 h-5 text-red-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats.recusados}</p>
              <p className="text-xs text-slate-400">Recusados</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
              <Zap className="w-5 h-5 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats.geradores}</p>
              <p className="text-xs text-slate-400">Geradores</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
              <Users className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats.consumidores}</p>
              <p className="text-xs text-slate-400">Consumidores</p>
            </div>
          </div>

          {/* Filtros e Busca */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex gap-2">
              <button onClick={() => setFilter('todos')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'todos' ? 'bg-purple-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>Todos ({stats.total})</button>
              <button onClick={() => setFilter('pendentes')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'pendentes' ? 'bg-yellow-500 text-slate-900' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>Pendentes ({stats.pendentes})</button>
              <button onClick={() => setFilter('aprovados')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'aprovados' ? 'bg-emerald-500 text-slate-900' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>Aprovados ({stats.aprovados})</button>
            </div>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input type="text" placeholder="Buscar por nome, e-mail, WhatsApp ou cidade..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-900/50 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition" />
            </div>
            <button onClick={carregarLeads} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-400 hover:bg-white/10 transition flex items-center gap-2"><RefreshCw className="w-4 h-4" /> Atualizar</button>
          </div>

          {/* Tabela de Leads */}
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
                    <tr><td colSpan={7} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></td></tr>
                  ) : leadsFiltrados.length === 0 ? (
                    <tr><td colSpan={7} className="p-8 text-center text-slate-500">Nenhum lead encontrado</td></tr>
                  ) : (
                    leadsFiltrados.map((lead) => (
                      <tr key={lead.id} className="border-b border-white/5 hover:bg-white/5 transition">
                        <td className="p-4 text-slate-500 text-sm">{new Date(lead.created_at).toLocaleDateString('pt-BR')}</td>
                        <td className="p-4 font-medium text-white">{lead.nome || '-'}</td>
                        <td className="p-4"><div className="space-y-1"><div className="flex items-center gap-1 text-xs text-slate-300"><Mail className="w-3 h-3" /> {lead.email || '-'}</div><div className="flex items-center gap-1 text-xs text-slate-300"><Phone className="w-3 h-3" /> {lead.whatsapp || '-'}</div></div></td>
                        <td className="p-4"><div className="flex items-center gap-1 text-slate-300 text-sm"><MapPin className="w-3 h-3" /> {lead.cidade || '-'} / {lead.estado || '-'}</div></td>
                        <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${lead.tipo === 'gerador' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>{lead.tipo === 'gerador' ? '⚡ Gerador' : '💰 Consumidor'}</span></td>
                        <td className="p-4">{getStatusBadge(lead.status)}</td>
                        <td className="p-4"><div className="flex gap-2">{(lead.status === 'pendente' || !lead.status) && (<><button onClick={() => atualizarStatus(lead.id, 'aprovado')} className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition" title="Aprovar"><CheckCircle className="w-4 h-4" /></button><button onClick={() => atualizarStatus(lead.id, 'recusado')} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition" title="Recusar"><XCircle className="w-4 h-4" /></button></>)}</div></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Links Rápidos */}
          <div className="mt-8 grid md:grid-cols-4 gap-4">
            <Link href="/admin-login" className="p-4 rounded-xl bg-white/5 border border-white/10 text-center hover:bg-white/10 transition group"><Shield className="w-5 h-5 text-purple-400 mx-auto mb-2 group-hover:scale-110 transition" /><h3 className="text-white font-medium">Login Admin</h3><p className="text-slate-500 text-xs">Página de login</p></Link>
            <Link href="/dashboard" className="p-4 rounded-xl bg-white/5 border border-white/10 text-center hover:bg-white/10 transition group"><BarChart3 className="w-5 h-5 text-blue-400 mx-auto mb-2 group-hover:scale-110 transition" /><h3 className="text-white font-medium">Dashboard Geral</h3><p className="text-slate-500 text-xs">Visão geral do usuário</p></Link>
            <Link href="/" className="p-4 rounded-xl bg-white/5 border border-white/10 text-center hover:bg-white/10 transition group"><ArrowLeft className="w-5 h-5 text-slate-400 mx-auto mb-2 group-hover:scale-110 transition" /><h3 className="text-white font-medium">Home Page</h3><p className="text-slate-500 text-xs">Voltar para o site</p></Link>
            <Link href="/cadastro" className="p-4 rounded-xl bg-white/5 border border-white/10 text-center hover:bg-white/10 transition group"><Users className="w-5 h-5 text-emerald-400 mx-auto mb-2 group-hover:scale-110 transition" /><h3 className="text-white font-medium">Novo Cadastro</h3><p className="text-slate-500 text-xs">Criar nova conta</p></Link>
          </div>
        </div>
      </div>
    </div>
  );
}