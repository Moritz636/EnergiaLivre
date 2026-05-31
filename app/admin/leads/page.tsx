'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle, XCircle, Eye, RefreshCw, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Lead {
  id: number;
  nome: string;
  email: string;
  whatsapp: string;
  gasto_mensal: number;
  cidade: string;
  created_at: string;
  status?: string;
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todos');
  const supabase = createClient();

  useEffect(() => {
    carregarLeads();
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
    if (filter === 'todos') return true;
    if (filter === 'pendentes') return !lead.status || lead.status === 'pendente';
    if (filter === 'aprovados') return lead.status === 'aprovado';
    if (filter === 'recusados') return lead.status === 'recusado';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">📋 Gerenciar Leads</h1>
            <p className="text-slate-400 mt-1">Aprove ou recuse cadastros de consumidores e geradores</p>
          </div>
          <button 
            onClick={carregarLeads}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition"
          >
            <RefreshCw className="w-4 h-4" /> Atualizar
          </button>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-6">
          <button 
            onClick={() => setFilter('todos')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'todos' ? 'bg-emerald-500 text-slate-900' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
          >
            Todos ({leads.length})
          </button>
          <button 
            onClick={() => setFilter('pendentes')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'pendentes' ? 'bg-yellow-500 text-slate-900' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
          >
            Pendentes ({leads.filter(l => !l.status || l.status === 'pendente').length})
          </button>
          <button 
            onClick={() => setFilter('aprovados')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'aprovados' ? 'bg-emerald-500 text-slate-900' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
          >
            Aprovados ({leads.filter(l => l.status === 'aprovado').length})
          </button>
        </div>

        {/* Tabela de Leads */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/10 bg-white/5">
                <tr className="text-left text-slate-400 text-sm">
                  <th className="p-4">Nome</th>
                  <th className="p-4">E-mail</th>
                  <th className="p-4">WhatsApp</th>
                  <th className="p-4">Gasto</th>
                  <th className="p-4">Cidade</th>
                  <th className="p-4">Data</th>
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
                      <td className="p-4 font-medium text-white">{lead.nome || '—'}</td>
                      <td className="p-4 text-slate-300">{lead.email || '—'}</td>
                      <td className="p-4 text-slate-300">{lead.whatsapp || '—'}</td>
                      <td className="p-4 text-white">R$ {lead.gasto_mensal || '—'}</td>
                      <td className="p-4 text-slate-300">{lead.cidade || '—'}</td>
                      <td className="p-4 text-slate-500 text-sm">
                        {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          lead.status === 'aprovado' ? 'bg-emerald-500/20 text-emerald-400' :
                          lead.status === 'recusado' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {lead.status || 'pendente'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => atualizarStatus(lead.id, 'aprovado')}
                            className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition"
                            title="Aprovar"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => atualizarStatus(lead.id, 'recusado')}
                            className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                            title="Recusar"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Botão voltar */}
        <div className="mt-8 text-center">
          <Link href="/admin/dashboard" className="text-slate-500 text-sm hover:text-emerald-400 transition">
            ← Voltar para o Dashboard Admin
          </Link>
        </div>
      </div>
    </div>
  );
}