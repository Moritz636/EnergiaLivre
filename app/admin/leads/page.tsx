// app/admin/leads/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

// Lista de e-mails autorizados (inclua o seu)
const ADMIN_EMAILS = ['energialivreofc@gmail.com'];

export default function AdminLeadsPage() {
  const [user, setUser] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      if (!ADMIN_EMAILS.includes(user.email)) {
        router.push('/dashboard');
        return;
      }

      setUser(user);
      carregarLeads();
    };
    checkUser();
  }, []);

  const carregarLeads = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setLeads(data);
    setLoading(false);
  };

  const atualizarStatus = async (id, status) => {
    await supabase.from('leads').update({ status }).eq('id', id);
    carregarLeads();
  };

  if (loading) return <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">Carregando...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">📋 Gerenciar Leads</h1>

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
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4 text-white">{lead.nome || '-'}</td>
                    <td className="p-4">{lead.email || '-'}</td>
                    <td className="p-4">{lead.whatsapp || '-'}</td>
                    <td className="p-4">R$ {lead.gasto_mensal || '-'}</td>
                    <td className="p-4">{lead.cidade || '-'}</td>
                    <td className="p-4 text-sm">{new Date(lead.created_at).toLocaleDateString('pt-BR')}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        lead.status === 'aprovado' ? 'bg-green-500/20 text-green-400' :
                        lead.status === 'recusado' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {lead.status || 'pendente'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button onClick={() => atualizarStatus(lead.id, 'aprovado')} className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-sm hover:bg-green-500/30">Aprovar</button>
                        <button onClick={() => atualizarStatus(lead.id, 'recusado')} className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-sm hover:bg-red-500/30">Recusar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}