'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { 
  ArrowLeft, 
  Download, 
  Calendar, 
  BarChart3, 
  PieChart,
  TrendingUp,
  Users,
  Zap,
  DollarSign,
  FileText,
  Loader2,
  CheckCircle,
  Filter,
  Printer
} from 'lucide-react';

interface RelatorioData {
  periodo: string;
  totalMatches: number;
  totalEconomia: number;
  totalEnergia: number;
  totalUsuarios: number;
  ticketsPorMes: { mes: string; valor: number }[];
  matchesPorMes: { mes: string; quantidade: number }[];
  topGeradores: { nome: string; matches: number; receita: number }[];
  topConsumidores: { nome: string; economia: number; kwh: number }[];
}

export default function AdminRelatoriosPage() {
  const [periodo, setPeriodo] = useState('mes');
  const [loading, setLoading] = useState(true);
  const [relatorio, setRelatorio] = useState<RelatorioData | null>(null);
  const supabase = createClient();

  useEffect(() => {
    carregarRelatorio();
  }, [periodo]);

  const carregarRelatorio = async () => {
    setLoading(true);
    try {
      // Simular dados do relatório (integração com Supabase real)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setRelatorio({
        periodo: periodo === 'mes' ? 'Último mês' : periodo === 'ano' ? 'Último ano' : 'Todos os períodos',
        totalMatches: 47,
        totalEconomia: 15230,
        totalEnergia: 47500,
        totalUsuarios: 128,
        ticketsPorMes: [
          { mes: 'Jan', valor: 3200 },
          { mes: 'Fev', valor: 4100 },
          { mes: 'Mar', valor: 5800 },
          { mes: 'Abr', valor: 7200 },
          { mes: 'Mai', valor: 8900 },
          { mes: 'Jun', valor: 10400 },
        ],
        matchesPorMes: [
          { mes: 'Jan', quantidade: 8 },
          { mes: 'Fev', quantidade: 12 },
          { mes: 'Mar', quantidade: 15 },
          { mes: 'Abr', quantidade: 22 },
          { mes: 'Mai', quantidade: 28 },
          { mes: 'Jun', quantidade: 35 },
        ],
        topGeradores: [
          { nome: 'Usina Solar Sul', matches: 12, receita: 3840 },
          { nome: 'Fazenda Solar Norte', matches: 10, receita: 3200 },
          { nome: 'Energia Limpa MG', matches: 8, receita: 2560 },
        ],
        topConsumidores: [
          { nome: 'Indústria Nova Esperança', economia: 1890, kwh: 5900 },
          { nome: 'Supermercado Bom Preço', economia: 1550, kwh: 4840 },
          { nome: 'Condomínio Solar', economia: 1260, kwh: 3940 },
        ],
      });
    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!relatorio) return;
    
    const dadosExport = {
      periodo: relatorio.periodo,
      totalMatches: relatorio.totalMatches,
      totalEconomia: relatorio.totalEconomia,
      totalEnergia: relatorio.totalEnergia,
      totalUsuarios: relatorio.totalUsuarios,
      ticketsPorMes: relatorio.ticketsPorMes,
      matchesPorMes: relatorio.matchesPorMes,
      topGeradores: relatorio.topGeradores,
      topConsumidores: relatorio.topConsumidores,
      exportadoEm: new Date().toLocaleString('pt-BR')
    };
    
    const blob = new Blob([JSON.stringify(dadosExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_energialivre_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans print:bg-white print:text-black">
      
      {/* Navbar - esconder na impressão */}
      <nav className="border-b border-white/10 bg-[#020617]/90 backdrop-blur-xl fixed top-0 w-full z-50 print:hidden">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white transition">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Voltar</span>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Zap className="text-slate-900 w-4 h-4 fill-current" />
              </div>
              <span className="text-xl font-black text-white">ENERGIA<span className="text-purple-500">LIVRE</span></span>
              <div className="ml-3 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-[9px] font-black text-purple-400 uppercase tracking-wider">
                Relatórios
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 text-sm hover:bg-white/10 transition"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium hover:from-purple-400 hover:to-pink-400 transition"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>
        </div>
      </nav>

      <div className="pt-20 px-6 pb-20 print:pt-0 print:px-0">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="mb-8 print:mb-4">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white print:text-black">📊 Relatórios e Analytics</h1>
                <p className="text-slate-400 print:text-gray-600 mt-1">
                  Análise completa do desempenho da plataforma
                </p>
              </div>
              
              {/* Seletor de período */}
              <div className="flex gap-2 print:hidden">
                <button
                  onClick={() => setPeriodo('mes')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${periodo === 'mes' ? 'bg-purple-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                >
                  Último mês
                </button>
                <button
                  onClick={() => setPeriodo('ano')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${periodo === 'ano' ? 'bg-purple-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                >
                  Último ano
                </button>
                <button
                  onClick={() => setPeriodo('todo')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${periodo === 'todo' ? 'bg-purple-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                >
                  Todo período
                </button>
              </div>
            </div>
          </div>

          {/* Cards de Resumo */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/5 border border-purple-500/30">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span className="text-xs text-slate-400">Total Matches</span>
              </div>
              <p className="text-2xl font-bold text-white">{relatorio?.totalMatches}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <span className="text-xs text-slate-400">Economia Gerada</span>
              </div>
              <p className="text-2xl font-bold text-white">R$ {relatorio?.totalEconomia.toLocaleString('pt-BR')}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="text-xs text-slate-400">Energia Compartilhada</span>
              </div>
              <p className="text-2xl font-bold text-white">{relatorio?.totalEnergia.toLocaleString('pt-BR')} kWh</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span className="text-xs text-slate-400">Usuários Ativos</span>
              </div>
              <p className="text-2xl font-bold text-white">{relatorio?.totalUsuarios}</p>
            </div>
          </div>

          {/* Gráficos */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            
            {/* Tickets por Mês */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-white">Receita por Mês</h2>
              </div>
              <div className="space-y-3">
                {relatorio?.ticketsPorMes.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">{item.mes}</span>
                      <span className="text-white">R$ {item.valor.toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full"
                        style={{ width: `${(item.valor / 10400) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Matches por Mês */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-bold text-white">Matches por Mês</h2>
              </div>
              <div className="space-y-3">
                {relatorio?.matchesPorMes.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">{item.mes}</span>
                      <span className="text-white">{item.quantidade} matches</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                        style={{ width: `${(item.quantidade / 35) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Rankings */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            
            {/* Top Geradores */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-yellow-400" />
                <h2 className="text-lg font-bold text-white">Top Geradores</h2>
              </div>
              <div className="space-y-4">
                {relatorio?.topGeradores.map((gerador, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 text-xs font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-white font-medium">{gerador.nome}</p>
                        <p className="text-xs text-slate-500">{gerador.matches} matches</p>
                      </div>
                    </div>
                    <p className="text-emerald-400 font-bold">R$ {gerador.receita.toLocaleString('pt-BR')}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Consumidores */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-white">Top Consumidores</h2>
              </div>
              <div className="space-y-4">
                {relatorio?.topConsumidores.map((consumidor, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-white font-medium">{consumidor.nome}</p>
                        <p className="text-xs text-slate-500">{consumidor.kwh} kWh</p>
                      </div>
                    </div>
                    <p className="text-emerald-400 font-bold">R$ {consumidor.economia.toLocaleString('pt-BR')}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Rodapé do relatório */}
          <div className="text-center text-slate-500 text-xs print:text-gray-400">
            <p>Relatório gerado em {new Date().toLocaleString('pt-BR')}</p>
            <p className="mt-1">EnergiaLivre - Marketplace de Energia Solar Compartilhada</p>
          </div>
        </div>
      </div>

      {/* Estilos para impressão */}
      <style jsx global>{`
        @media print {
          body {
            background: white;
            color: black;
          }
          .print\\:bg-white {
            background: white;
          }
          .print\\:text-black {
            color: black;
          }
          .print\\:text-gray-600 {
            color: #4b5563;
          }
          .print\\:text-gray-400 {
            color: #9ca3af;
          }
          .print\\:p-0 {
            padding: 0;
          }
          .print\\:mb-4 {
            margin-bottom: 1rem;
          }
        }
      `}</style>
    </div>
  );
}