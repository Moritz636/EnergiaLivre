'use client';
import { useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase/singleton';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  RefreshCw, 
  Loader2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Search,
  Filter,
  ArrowLeft
} from 'lucide-react';

// E-mails autorizados como admin
const ADMIN_EMAILS = ['energialivreofc@gmail.com', 'fiscaltecnico.qualidade@gmail.com'];

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

export default function AdminLeadsPage() {
  const [user, setUser] = useState<any>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pendentes');
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const supabase = getSupabase();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }
      
      if (!ADMIN_EMAILS.includes(user.email || '')) {
        router.push('/dashboard');
        return;
      }
      
      setUser(user);
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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link href="/admin/dashboard" className="text-slate-500 hover:text-emerald-400 transition">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <h1 className="text-2xl font-bold text-white">Gerenciar Leads</h1>
            </div>
            <p className="text-slate-400">Aprove ou recuse os cadastros de geradores e consumidores</p>
          </div>
          <button 
            onClick={carregarLeads}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition"
          >
            <RefreshCw className="w-4 h-4" /> Atualizar
          </button>
        </div>

        {/* Filtros e Busca */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex gap-2">
            <button 
              onClick={() => setFilter('pendentes')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'pendentes' ? 'bg-yellow-500 text-slate-900' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
            >
              Pendentes ({leads.filter(l => l.status === 'pendente' || !l.status).length})
            </button>
            <button 
              onClick={() => setFilter('aprovados')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'aprovados' ? 'bg-emerald-500 text-slate-900' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
            >
              Aprovados ({leads.filter(l => l.status === 'aprovado').length})
            </button>
            <button 
              onClick={() => setFilter('recusados')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'recusados' ? 'bg-red-500 text-slate-900' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
            >
              Recusados ({leads.filter(l => l.status === 'recusado').length})
            </button>
          </div>
          
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por nome, e-mail, WhatsApp ou cidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"
            />
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/30 text-center">
            <p className="text-2xl font-bold text-yellow-400">{leads.filter(l => l.status === 'pendente' || !l.status).length}</p>
            <p className="text-xs text-yellow-400 uppercase">Pendentes</p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/30 text-center">
            <p className="text-2xl font-bold text-emerald-400">{leads.filter(l => l.status === 'aprovado').length}</p>
            <p className="text-xs text-emerald-400 uppercase">Aprovados</p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/30 text-center">
            <p className="text-2xl font-bold text-red-400">{leads.filter(l => l.status === 'recusado').length}</p>
            <p className="text-xs text-red-400 uppercase">Recusados</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
            <p className="text-2xl font-bold text-white">{leads.length}</p>
            <p className="text-xs text-slate-400 uppercase">Total</p>
          </div>
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
                  <th className="p-4">Capacidade</th>
                  <th className="p-4">Tipo</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Ações</th>
                 </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : leadsFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500">
                      Nenhum lead encontrado
                    </td>
                  </tr>
                ) : (
                  leadsFiltrados.map((lead) => (
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
                          <MapPin className="w-3 h-3" /> {lead.cidade || '-'} / {lead.estado || '-'}
                        </div>
                      </td>
                      <td className="p-4 text-slate-300">{lead.capacidade ? `${lead.capacidade} kWp` : '-'}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          lead.tipo === 'gerador' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {lead.tipo === 'gerador' ? '⚡ Gerador' : '💰 Consumidor'}
                        </span>
                      </td>
                      <td className="p-4">{getStatusBadge(lead.status)}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          {(!lead.status || lead.status === 'pendente') && (
                            <>
                              <button
                                onClick={() => atualizarStatus(lead.id, 'aprovado')}
                                className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition group"
                                title="Aprovar"
                              >
                                <CheckCircle className="w-4 h-4 group-hover:scale-110 transition" />
                              </button>
                              <button
                                onClick={() => atualizarStatus(lead.id, 'recusado')}
                                className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition group"
                                title="Recusar"
                              >
                                <XCircle className="w-4 h-4 group-hover:scale-110 transition" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Link para voltar */}
        <div className="mt-8 text-center">
          <Link href="/admin/dashboard" className="text-slate-500 text-sm hover:text-emerald-400 transition">
            ← Voltar para o Dashboard Admin
          </Link>
        </div>
      </div>
    </div>
  );
}

// Componente de relógio para o badge
function Clock(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}