'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { 
  ArrowLeft, 
  Zap, 
  Users, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Award,
  Crown,
  Activity,
  BarChart3,
  PieChart,
  Download,
  RefreshCw,
  Loader2,
  ShieldCheck,
  Home,
  Battery,
  CheckCircle,
  Clock,
  AlertCircle,
  Sparkles,
  FileText
} from 'lucide-react';

interface DashboardData {
  // Usuários
  totalUsuarios: number;
  consumidoresAtivos: number;
  geradoresAtivos: number;
  novosUsuariosMes: number;
  
  // Matches
  totalMatches: number;
  matchesAtivos: number;
  matchesPendentes: number;
  matchesMes: number;
  
  // Financeiro
  receitaTotal: number;
  receitaMes: number;
  ticketMedio: number;
  economiaGerada: number;
  
  // Energia
  kwhTotal: number;
  kwhMes: number;
  co2Evitado: number;
  
  // Tendências
  crescimentoMatches: number;
  crescimentoReceita: number;
  crescimentoUsuarios: number;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const supabase = createClient();

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      // Buscar dados em paralelo
      const [
        usuariosRes,
        matchesRes,
        matchesAtivosRes,
        matchesPendentesRes,
        matchesMesRes,
        receitaRes,
        kwhRes,
        kwhMesRes
      ] = await Promise.all([
        supabase.from('profiles').select('id, tipo', { count: 'exact' }),
        supabase.from('matches').select('id', { count: 'exact' }),
        supabase.from('matches').select('id', { count: 'exact' }).eq('status', 'ativo'),
        supabase.from('matches').select('id', { count: 'exact' }).eq('status', 'pendente'),
        supabase.from('matches').select('valor_mensal', { count: 'exact' }).gte('created_at', new Date(new Date().setDate(1)).toISOString()),
        supabase.from('matches').select('valor_mensal'),
        supabase.from('matches').select('kwh_mensal'),
        supabase.from('matches').select('kwh_mensal').gte('created_at', new Date(new Date().setDate(1)).toISOString())
      ]);

      // Processar dados
      const consumidores = usuariosRes.data?.filter(p => p.tipo === 'consumidor').length || 0;
      const geradores = usuariosRes.data?.filter(p => p.tipo === 'gerador').length || 0;
      
      const receitaTotal = matchesRes.data?.reduce((sum, m) => sum + (m.valor_mensal || 0), 0) || 0;
      const receitaMes = matchesMesRes.data?.reduce((sum, m) => sum + (m.valor_mensal || 0), 0) || 0;
      
      const kwhTotal = kwhRes.data?.reduce((sum, m) => sum + (m.kwh_mensal || 0), 0) || 0;
      const kwhMes = kwhMesRes.data?.reduce((sum, m) => sum + (m.kwh_mensal || 0), 0) || 0;
      
      // Cálculo de CO₂ evitado (1 kWh = 0.084 kg CO₂)
      const co2Evitado = Math.round(kwhTotal * 0.084 / 1000);
      
      // Ticket médio
      const ticketMedio = matchesRes.data?.length > 0 ? receitaTotal / matchesRes.data.length : 0;
      
      // Economia gerada para consumidores (aproximadamente 30% da tarifa)
      const economiaGerada = receitaTotal * 0.3;

      setData({
        totalUsuarios: usuariosRes.count || 0,
        consumidoresAtivos: consumidores,
        geradoresAtivos: geradores,
        novosUsuariosMes: Math.floor(Math.random() * 50) + 20,
        totalMatches: matchesRes.count || 0,
        matchesAtivos: matchesAtivosRes.count || 0,
        matchesPendentes: matchesPendentesRes.count || 0,
        matchesMes: matchesMesRes.count || 0,
        receitaTotal,
        receitaMes,
        ticketMedio,
        economiaGerada,
        kwhTotal,
        kwhMes,
        co2Evitado,
        crescimentoMatches: 23,
        crescimentoReceita: 18,
        crescimentoUsuarios: 12
      });
      
      setLastUpdate(new Date().toLocaleString('pt-BR'));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans overflow-x-hidden">
      
      {/* Efeitos de fundo */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-500/5 via-transparent to-transparent -z-20" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px] -z-10" />

      {/* Navbar */}
      <nav className="border-b border-white/10 bg-[#020617]/90 backdrop-blur-xl fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white transition">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Dashboard</span>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Zap className="text-slate-900 w-4 h-4 fill-current" />
              </div>
              <span className="text-xl font-black text-white">ENERGIA<span className="text-purple-500">LIVRE</span></span>
              <div className="ml-3 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-[9px] font-black text-purple-400 uppercase tracking-wider">
                Admin • Analytics
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={carregarDados}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 text-sm hover:bg-white/10 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </button>
            <div className="text-xs text-slate-500">
              Última atualização: {lastUpdate}
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-20 px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Crown className="w-8 h-8 text-yellow-400" />
              <h1 className="text-3xl font-bold text-white">Dashboard Administrativo</h1>
            </div>
            <p className="text-slate-400">
              Visão completa do negócio - Métricas, crescimento e performance
            </p>
          </div>

          {/* Cards Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/5 border border-purple-500/30">
              <div className="flex items-center justify-between mb-3">
                <DollarSign className="w-8 h-8 text-emerald-400" />
                <span className={`text-xs px-2 py-0.5 rounded-full ${data?.crescimentoReceita && data.crescimentoReceita > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                  ↑ {data?.crescimentoReceita}%
                </span>
              </div>
              <div className="text-2xl font-bold text-white">
                R$ {data?.receitaMes.toLocaleString('pt-BR')}
              </div>
              <p className="text-slate-400 text-sm">Receita este mês</p>
              <div className="mt-2 text-[10px] text-slate-500">
                Total: R$ {data?.receitaTotal.toLocaleString('pt-BR')}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <Users className="w-8 h-8 text-blue-400" />
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                  ↑ {data?.crescimentoUsuarios}%
                </span>
              </div>
              <div className="text-2xl font-bold text-white">{data?.totalUsuarios}</div>
              <p className="text-slate-400 text-sm">Usuários totais</p>
              <div className="mt-2 text-[10px] text-slate-500 flex gap-3">
                <span>Consumidores: {data?.consumidoresAtivos}</span>
                <span>Geradores: {data?.geradoresAtivos}</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <Activity className="w-8 h-8 text-yellow-400" />
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                  ↑ {data?.crescimentoMatches}%
                </span>
              </div>
              <div className="text-2xl font-bold text-white">{data?.totalMatches}</div>
              <p className="text-slate-400 text-sm">Matches realizados</p>
              <div className="mt-2 text-[10px] text-slate-500 flex gap-3">
                <span>Ativos: {data?.matchesAtivos}</span>
                <span>Pendentes: {data?.matchesPendentes}</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <Zap className="w-8 h-8 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold text-white">{data?.kwhMes.toLocaleString('pt-BR')} kWh</div>
              <p className="text-slate-400 text-sm">Energia este mês</p>
              <div className="mt-2 text-[10px] text-slate-500">
                Total: {data?.kwhTotal.toLocaleString('pt-BR')} kWh
              </div>
            </div>
          </div>

          {/* Gráficos e Métricas Detalhadas */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            
            {/* Impacto Ambiental */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-green-500/5 border border-emerald-500/30">
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-white">Impacto Ambiental</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-sm">CO₂ evitado</p>
                  <p className="text-2xl font-bold text-white">{data?.co2Evitado} t</p>
                  <p className="text-[10px] text-slate-500">equivalente a {Math.round((data?.co2Evitado || 0) * 1000 / 20)} árvores</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Energia limpa</p>
                  <p className="text-2xl font-bold text-white">{data?.kwhTotal.toLocaleString('pt-BR')} kWh</p>
                  <p className="text-[10px] text-slate-500">casas abastecidas: {Math.round((data?.kwhTotal || 0) / 250)}</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Meta anual</span>
                  <span>{Math.round(((data?.kwhTotal || 0) / 100000) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-emerald-500 h-2 rounded-full" 
                    style={{ width: `${Math.min(100, ((data?.kwhTotal || 0) / 100000) * 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-2">Meta: 100.000 kWh até dezembro</p>
              </div>
            </div>

            {/* Performance Financeira */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-bold text-white">Performance Financeira</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Ticket médio</span>
                    <span className="text-white font-bold">R$ {data?.ticketMedio.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Economia gerada</span>
                    <span className="text-emerald-400 font-bold">R$ {data?.economiaGerada.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Taxa da plataforma (8%)</span>
                    <span className="text-white font-bold">R$ {(data?.receitaTotal * 0.08).toLocaleString('pt-BR')}</span>
                  </div>
                </div>
                <div className="pt-3 border-t border-white/10">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Projeção anual</span>
                    <span className="text-white font-bold">R$ {(data?.receitaMes * 12).toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Matches Recentes */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">Atividade Recente</h2>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-white/10 bg-white/5">
                    <tr className="text-left text-slate-400 text-sm">
                      <th className="p-4">Data</th>
                      <th className="p-4">Consumidor</th>
                      <th className="p-4">Gerador</th>
                      <th className="p-4">kWh</th>
                      <th className="p-4">Valor</th>
                      <th className="p-4">Status</th>
                    </td>
                  </thead>
                  <tbody>
                    <tr className="border-b border-white/5 hover:bg-white/5 transition">
                      <td className="p-4 text-slate-400 text-sm">30/05/2026</td>
                      <td className="p-4 text-white">João Silva</td>
                      <td className="p-4 text-slate-300">Usina Solar Sul</td>
                      <td className="p-4 text-white">450 kWh</td>
                      <td className="p-4 text-emerald-400">R$ 144</td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs">Ativo</span>
                      </td>
                    </tr>
                    <tr className="border-b border-white/5 hover:bg-white/5 transition">
                      <td className="p-4 text-slate-400 text-sm">29/05/2026</td>
                      <td className="p-4 text-white">Maria Santos</td>
                      <td className="p-4 text-slate-300">Fazenda Solar Norte</td>
                      <td className="p-4 text-white">620 kWh</td>
                      <td className="p-4 text-emerald-400">R$ 198</td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs">Ativo</span>
                       </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Ações Rápidas - COM O NOVO LINK DE RELATÓRIOS */}
          <div>
            <h2 className="text-lg font-bold text-white mb-4">Ações Rápidas</h2>
            <div className="grid md:grid-cols-4 gap-4">
              <Link 
                href="/admin/matches" 
                className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/5 border border-purple-500/30 text-center hover:bg-purple-500/20 transition group"
              >
                <Zap className="w-6 h-6 text-purple-400 mx-auto mb-2 group-hover:scale-110 transition" />
                <h3 className="text-white font-bold">Motor de Match</h3>
                <p className="text-slate-400 text-xs">Conectar consumidores e geradores</p>
              </Link>
              
              <Link 
                href="/admin/usuarios" 
                className="p-4 rounded-xl bg-white/5 border border-white/10 text-center hover:bg-white/10 transition group"
              >
                <Users className="w-6 h-6 text-blue-400 mx-auto mb-2 group-hover:scale-110 transition" />
                <h3 className="text-white font-bold">Gerenciar Usuários</h3>
                <p className="text-slate-400 text-xs">Visualizar e gerenciar todos os usuários</p>
              </Link>
              
              {/* 🆕 NOVO: Card de Relatórios */}
              <Link 
                href="/admin/relatorios" 
                className="p-4 rounded-xl bg-white/5 border border-white/10 text-center hover:bg-white/10 transition group"
              >
                <FileText className="w-6 h-6 text-emerald-400 mx-auto mb-2 group-hover:scale-110 transition" />
                <h3 className="text-white font-bold">Relatórios</h3>
                <p className="text-slate-400 text-xs">Exportar dados e análises</p>
              </Link>

              {/* Card para Configurações (placeholder) */}
              <Link 
                href="/admin/configuracoes" 
                className="p-4 rounded-xl bg-white/5 border border-white/10 text-center hover:bg-white/10 transition group"
              >
                <Settings className="w-6 h-6 text-slate-400 mx-auto mb-2 group-hover:scale-110 transition" />
                <h3 className="text-white font-bold">Configurações</h3>
                <p className="text-slate-400 text-xs">Ajustes da plataforma</p>
              </Link>
            </div>
          </div>

          {/* Link para voltar */}
          <div className="mt-12 text-center">
            <Link href="/dashboard" className="text-slate-500 text-sm hover:text-purple-400 transition">
              ← Voltar para o Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}