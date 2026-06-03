'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import {
  DollarSign,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  BarChart3,
  Sparkles,
  Target,
  Gift,
  ArrowUpRight,
  Download,
  RefreshCw,
  Eye,
  Share2
} from 'lucide-react';
import Link from 'next/link';

interface Comissao {
  id: number;
  valor_comissao: number;
  percentual: number;
  tipo_comissao: 'cadastro' | 'recorrente';
  status_pagamento: 'pendente' | 'pago' | 'cancelado';
  data_pagamento?: string;
  mes_referencia: number;
  ano_referencia: number;
  profiles: {
    nome: string;
    email: string;
  };
}

interface Estatisticas {
  totalPendente: number;
  totalPago: number;
  totalCancelado: number;
  cadastrosMes: number;
  recorrentesMes: number;
}

interface Meta {
  cadastros: number;
  bonus: number;
  descricao: string;
}

const METAS: Meta[] = [
  { cadastros: 10, bonus: 100, descricao: 'Iniciante' },
  { cadastros: 25, bonus: 250, descricao: 'Bronze' },
  { cadastros: 50, bonus: 500, descricao: 'Prata' },
  { cadastros: 100, bonus: 1000, descricao: 'Ouro' },
  { cadastros: 250, bonus: 2500, descricao: 'Diamante' },
  { cadastros: 500, bonus: 5000, descricao: 'Elite' },
];

export default function ComissoesDashboardPage() {
  const { user, profile, loading } = useAuth();
  const [comissoes, setComissoes] = useState<Comissao[]>([]);
  const [estatisticas, setEstatisticas] = useState<Estatisticas>({
    totalPendente: 0,
    totalPago: 0,
    totalCancelado: 0,
    cadastrosMes: 0,
    recorrentesMes: 0,
  });
  const [loadingComissoes, setLoadingComissoes] = useState(true);
  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth() + 1);
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());

  useEffect(() => {
    if (user) {
      carregarComissoes();
    }
  }, [user, mesSelecionado, anoSelecionado]);

  const carregarComissoes = async () => {
    setLoadingComissoes(true);
    try {
      const response = await fetch(`/api/comissoes?userId=${user?.id}&status=all`);
      const data = await response.json();

      if (data.success) {
        setComissoes(data.comissoes);
        setEstatisticas(data.totais);
      }
    } catch (error) {
      console.error('Error loading commissions:', error);
    } finally {
      setLoadingComissoes(false);
    }
  };

  const formatarData = (data: string | undefined) => {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const getMetaAtual = (cadastros: number): Meta => {
    return METAS.reduce((meta, atual) => {
      return cadastros >= atual.cadastros ? atual : meta;
    }, METAS[0]);
  };

  const cadastrosTotais = estatisticas.cadastrosMes + estatisticas.recorrentesMes;
  const metaAtual = getMetaAtual(cadastrosTotais);
  const progressoMeta = Math.min((cadastrosTotais / metaAtual.cadastros) * 100, 100);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile || profile.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-8 text-center">
          <Sparkles className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Acesso Restrito</h1>
          <p className="text-slate-400">Você não tem permissão para acessar o painel de comissões.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
      {/* Header */}
      <nav className="border-b border-white/10 bg-[#020617]/90 backdrop-blur-xl fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-lg flex items-center justify-center">
              <DollarSign className="text-white w-4 h-4" />
            </div>
            <span className="text-xl font-bold text-white">ENERGIA<span className="text-yellow-500">LIVRE</span></span>
            <div className="ml-3 px-2 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-[9px] font-black text-yellow-400 uppercase tracking-wider">
              Em baixador
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm text-slate-400">
              <span>{profile?.nome}</span>
            </div>
            <Link href="/dashboard" className="text-slate-400 hover:text-yellow-400 transition">
              Voltar
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-white mb-2">Painel de Comissões</h1>
            <p className="text-slate-400">Monetize sua rede e ganhe dinheiro com cada cliente indicado</p>
          </div>

          {/* Estatísticas Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-green-500/5 border border-emerald-500/30">
              <div className="flex items-center justify-between mb-3">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">Pago</span>
              </div>
              <div className="text-3xl font-bold text-white">R$ {estatisticas.totalPago.toFixed(2)}</div>
              <p className="text-slate-400 text-sm">Comissões pagas</p>
              <div className="mt-3 text-[10px] text-emerald-400/80">
                <ArrowUpRight className="w-3 h-3 inline mr-1" /> +12% este mês
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-amber-600/5 border border-yellow-500/30">
              <div className="flex items-center justify-between mb-3">
                <Clock className="w-8 h-8 text-yellow-400" />
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">Pendente</span>
              </div>
              <div className="text-3xl font-bold text-white">R$ {estatisticas.totalPendente.toFixed(2)}</div>
              <p className="text-slate-400 text-sm">A receber</p>
              <div className="mt-3 text-[10px] text-yellow-400/80">
                Processando pagamento
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-600/5 border border-blue-500/30">
              <div className="flex items-center justify-between mb-3">
                <Users className="w-8 h-8 text-blue-400" />
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">Indicações</span>
              </div>
              <div className="text-3xl font-bold text-white">{cadastrosTotais}</div>
              <p className="text-slate-400 text-sm">Clientes indicados</p>
              <div className="mt-3 text-[10px] text-blue-400/80">
                {estatisticas.cadastrosMes} novos este mês
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-600/5 border border-purple-500/30">
              <div className="flex items-center justify-between mb-3">
                <Target className="w-8 h-8 text-purple-400" />
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">Meta</span>
              </div>
              <div className="text-3xl font-bold text-white">{metaAtual.descricao}</div>
              <p className="text-slate-400 text-sm">Nível atual</p>
              <div className="mt-3 text-[10px] text-purple-400/80">
                R$ {metaAtual.bonus} de bônus
              </div>
            </div>
          </div>

          {/* Progresso da Meta */}
          <div className="mb-10 p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Progresso da Meta</h3>
              </div>
              <div className="text-sm text-slate-400">
                {cadastrosTotais} / {metaAtual.cadastros} clientes
              </div>
            </div>
            
            <div className="mb-4">
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-green-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressoMeta}%` }}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-400">
                {progressoMeta >= 100 ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Meta atingida!
                  </span>
                ) : (
                  `Faltam ${metaAtual.cadastros - cadastrosTotais} clientes`
                )}
              </div>
              <div className="text-sm font-bold text-emerald-400">
                {progressoMeta.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Filtro de Data */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <select
                  value={mesSelecionado}
                  onChange={(e) => setMesSelecionado(parseInt(e.target.value))}
                  className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((mes) => (
                    <option key={mes} value={mes}>
                      {new Date(2024, mes - 1, 1).toLocaleDateString('pt-BR', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
              <select
                value={anoSelecionado}
                onChange={(e) => setAnoSelecionado(parseInt(e.target.value))}
                className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none"
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((ano) => (
                  <option key={ano} value={ano}>
                    {ano}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              onClick={carregarComissoes}
              disabled={loadingComissoes}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/10 rounded-lg hover:bg-white/20 transition disabled:opacity-50"
            >
              {loadingComissoes ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Atualizar
            </button>
          </div>

          {/* Tabela de Comissões */}
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/10 bg-white/5">
                  <tr className="text-left text-slate-400 text-sm">
                    <th className="p-4">Data</th>
                    <th className="p-4">Cliente</th>
                    <th className="p-4">Tipo</th>
                    <th className="p-4">Valor</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingComissoes ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-yellow-500" />
                      </td>
                    </tr>
                  ) : comissoes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        Nenhuma comissão encontrada
                      </td>
                    </tr>
                  ) : (
                    comissoes.map((comissao) => (
                      <tr key={comissao.id} className="border-b border-white/5 hover:bg-white/5 transition">
                        <td className="p-4 text-slate-500 text-sm">
                          {formatarData(comissao.data_pagamento)}
                        </td>
                        <td className="p-4">
                          <div>
                            <div className="font-medium text-white">{comissao.profiles.nome}</div>
                            <div className="text-xs text-slate-400">{comissao.profiles.email}</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            comissao.tipo_comissao === 'cadastro'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {comissao.tipo_comissao === 'cadastro' ? '🎯 Cadastro' : '🔄 Recorrente'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-white">R$ {comissao.valor_comissao.toFixed(2)}</div>
                          <div className="text-xs text-slate-400">{comissao.percentual}%</div>
                        </td>
                        <td className="p-4">
                          {comissao.status_pagamento === 'pago' && (
                            <span className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> Pago
                            </span>
                          )}
                          {comissao.status_pagamento === 'pendente' && (
                            <span className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Pendente
                            </span>
                          )}
                          {comissao.status_pagamento === 'cancelado' && (
                            <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-medium flex items-center gap-1">
                              <XCircle className="w-3 h-3" /> Cancelado
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button
                              className="p-2 rounded-lg bg-white/10 text-slate-400 hover:bg-white/20 transition"
                              title="Detalhes"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2 rounded-lg bg-white/10 text-slate-400 hover:bg-white/20 transition"
                              title="Compartilhar"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2 rounded-lg bg-white/10 text-slate-400 hover:bg-white/20 transition"
                              title="Baixar extrato"
                            >
                              <Download className="w-4 h-4" />
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
        </div>
      </div>
    </div>
  );
}