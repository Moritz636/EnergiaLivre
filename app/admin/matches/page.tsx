'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Users, 
  Zap, 
  Home, 
  CheckCircle, 
  Plus,
  Search,
  MapPin,
  DollarSign,
  Battery,
  Loader2,
  Sparkles
} from 'lucide-react';

interface Consumidor {
  id: string;
  consumo_mensal_kwh: number;
  fatura_mensal: number;
  concessionaria: string;
  cidade: string;
  estado: string;
  status: string;
  profiles: { nome: string; email: string; whatsapp: string };
}

interface Gerador {
  id: string;
  nome_usina: string;
  capacidade_kwp: number;
  excedente_mensal_kwh: number;
  preco_por_kwh: number;
  concessionaria: string;
  cidade: string;
  estado: string;
  status: string;
  profiles: { nome: string; email: string; whatsapp: string };
}

interface Match {
  id: string;
  kwh_mensal: number;
  valor_mensal: number;
  status: string;
  data_inicio: string;
  created_at: string;
  consumidor: { consumidor: { profiles: { nome: string } } };
  gerador: { gerador: { profiles: { nome: string; nome_usina: string } } };
}

export default function AdminMatchesPage() {
  const [consumidores, setConsumidores] = useState<Consumidor[]>([]);
  const [geradores, setGeradores] = useState<Gerador[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoMatching, setAutoMatching] = useState(false);
  const [selectedConsumidor, setSelectedConsumidor] = useState<Consumidor | null>(null);
  const [selectedGerador, setSelectedGerador] = useState<Gerador | null>(null);
  const [kwhMatch, setKwhMatch] = useState('');
  const [showMatchForm, setShowMatchForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterConcessionaria, setFilterConcessionaria] = useState('');
  const [creating, setCreating] = useState(false);

  // Carregar dados do Supabase
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [consumidoresRes, geradoresRes, matchesRes] = await Promise.all([
        fetch('/api/matches?tipo=consumidores'),
        fetch('/api/matches?tipo=geradores'),
        fetch('/api/matches?tipo=matches')
      ]);
      
      const consumidoresData = await consumidoresRes.json();
      const geradoresData = await geradoresRes.json();
      const matchesData = await matchesRes.json();
      
      if (consumidoresData.success) setConsumidores(consumidoresData.data);
      if (geradoresData.success) setGeradores(geradoresData.data);
      if (matchesData.success) setMatches(matchesData.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // FUNÇÃO DO MATCH AUTOMÁTICO
  const handleAutoMatch = async () => {
    setAutoMatching(true);
    try {
      const response = await fetch('/api/matches/auto', { method: 'POST' });
      const result = await response.json();
      
      if (result.success) {
        alert(`✅ ${result.total} matches criados automaticamente!`);
        await carregarDados(); // Recarregar todos os dados
        setShowMatchForm(false); // Fechar formulário se estiver aberto
      } else {
        alert('❌ Erro no match automático: ' + result.error);
      }
    } catch (error) {
      alert('❌ Erro ao executar match automático');
    } finally {
      setAutoMatching(false);
    }
  };

  const handleCreateMatch = async () => {
    if (!selectedConsumidor || !selectedGerador || !kwhMatch) return;
    
    setCreating(true);
    try {
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consumidor_id: selectedConsumidor.id,
          gerador_id: selectedGerador.id,
          kwh_mensal: parseInt(kwhMatch)
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('✅ Match criado com sucesso!');
        await carregarDados();
        setSelectedConsumidor(null);
        setSelectedGerador(null);
        setKwhMatch('');
        setShowMatchForm(false);
      } else {
        alert('❌ Erro ao criar match: ' + result.error);
      }
    } catch (error) {
      alert('❌ Erro ao criar match');
    } finally {
      setCreating(false);
    }
  };

  // Filtrar dados
  const consumidoresFiltrados = consumidores.filter(c => {
    const matchSearch = c.profiles.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        c.cidade.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = !filterConcessionaria || c.concessionaria === filterConcessionaria;
    return matchSearch && matchFilter;
  });

  const geradoresFiltrados = geradores.filter(g => {
    const matchSearch = g.profiles.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        g.cidade.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = !filterConcessionaria || g.concessionaria === filterConcessionaria;
    return matchSearch && matchFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans">
      
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
                Admin • Motor de Match
              </div>
            </div>
          </div>
          <div className="text-sm text-slate-500">
            {matches.length} matches realizados
          </div>
        </div>
      </nav>

      <div className="pt-24 px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">⚡ Motor de Match</h1>
            <p className="text-slate-400 mt-2">
              Conecte consumidores a geradores de energia solar da mesma concessionária
            </p>
          </div>

          {/* Botões: Novo Match + Match Automático */}
          <div className="mb-8 flex flex-wrap gap-4">
            <button
              onClick={() => setShowMatchForm(!showMatchForm)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:from-purple-400 hover:to-pink-400 transition-all shadow-lg"
            >
              <Plus className="w-5 h-5" />
              {showMatchForm ? 'Cancelar' : 'Novo Match'}
            </button>
            
            {/* BOTÃO DE MATCH AUTOMÁTICO */}
            <button
              onClick={handleAutoMatch}
              disabled={autoMatching}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl font-bold hover:from-emerald-400 hover:to-green-400 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {autoMatching ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
              {autoMatching ? 'Processando...' : 'Match Automático'}
            </button>
          </div>

          {/* Formulário de Novo Match */}
          {showMatchForm && (
            <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/5 border border-purple-500/30">
              <h2 className="text-xl font-bold text-white mb-4">Criar novo match</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Consumidor</label>
                  <select 
                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white"
                    value={selectedConsumidor?.id || ''}
                    onChange={(e) => {
                      const consumer = consumidores.find(c => c.id === e.target.value);
                      setSelectedConsumidor(consumer || null);
                    }}
                  >
                    <option value="">Selecione um consumidor</option>
                    {consumidoresFiltrados.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.profiles.nome} - {c.cidade} - R$ {c.fatura_mensal}
                      </option>
                    ))}
                  </select>
                  {selectedConsumidor && (
                    <div className="mt-2 text-xs text-slate-500">
                      Consumo: {selectedConsumidor.consumo_mensal_kwh} kWh | Concessionária: {selectedConsumidor.concessionaria}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-slate-400 text-sm mb-2">Gerador</label>
                  <select 
                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white"
                    value={selectedGerador?.id || ''}
                    onChange={(e) => {
                      const generator = geradores.find(g => g.id === e.target.value);
                      setSelectedGerador(generator || null);
                    }}
                  >
                    <option value="">Selecione um gerador</option>
                    {geradoresFiltrados.map(g => (
                      <option key={g.id} value={g.id}>
                        {g.nome_usina} - {g.cidade} - {g.excedente_mensal_kwh} kWh excedente
                      </option>
                    ))}
                  </select>
                  {selectedGerador && (
                    <div className="mt-2 text-xs text-slate-500">
                      Excedente: {selectedGerador.excedente_mensal_kwh} kWh | Preço: R$ {selectedGerador.preco_por_kwh}/kWh
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-slate-400 text-sm mb-2">kWh mensal</label>
                  <input 
                    type="number"
                    placeholder="Ex: 300"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white"
                    value={kwhMatch}
                    onChange={(e) => setKwhMatch(e.target.value)}
                  />
                </div>

                {kwhMatch && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    <p className="text-xs text-slate-400">Economia estimada para o consumidor</p>
                    <p className="text-xl font-bold text-emerald-400">
                      R$ {Math.round(parseFloat(kwhMatch) * (selectedGerador?.preco_por_kwh || 0.32))}/mês
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleCreateMatch}
                  disabled={!selectedConsumidor || !selectedGerador || !kwhMatch || creating}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 text-slate-900 rounded-xl font-bold transition-all flex items-center gap-2"
                >
                  {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                  {creating ? 'Criando...' : 'Confirmar Match'}
                </button>
              </div>
            </div>
          )}

          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar por nome ou cidade..."
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white"
              value={filterConcessionaria}
              onChange={(e) => setFilterConcessionaria(e.target.value)}
            >
              <option value="">Todas concessionárias</option>
              <option value="Enel">Enel</option>
              <option value="Light">Light</option>
              <option value="Cemig">Cemig</option>
              <option value="CPFL">CPFL</option>
              <option value="Equatorial">Equatorial</option>
            </select>
          </div>

          {/* Colunas: Consumidores e Geradores */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Home className="w-5 h-5 text-emerald-400" />
                <h2 className="text-xl font-bold text-white">Consumidores Aguardando</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">
                  {consumidoresFiltrados.length}
                </span>
              </div>
              
              <div className="space-y-3">
                {consumidoresFiltrados.map(consumer => (
                  <div key={consumer.id} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-white">{consumer.profiles.nome}</h3>
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-[10px] font-bold">
                        {consumer.concessionaria}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {consumer.cidade}</span>
                      <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> {consumer.consumo_mensal_kwh} kWh</span>
                      <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> R$ {consumer.fatura_mensal}</span>
                    </div>
                  </div>
                ))}
                {consumidoresFiltrados.length === 0 && (
                  <div className="text-center text-slate-500 py-8">Nenhum consumidor aguardando match</div>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <Battery className="w-5 h-5 text-blue-400" />
                <h2 className="text-xl font-bold text-white">Geradores com Excedente</h2>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs">
                  {geradoresFiltrados.length}
                </span>
              </div>
              
              <div className="space-y-3">
                {geradoresFiltrados.map(generator => (
                  <div key={generator.id} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-white">{generator.nome_usina}</h3>
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-[10px] font-bold">
                        {generator.concessionaria}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {generator.cidade}</span>
                      <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> {generator.excedente_mensal_kwh} kWh</span>
                      <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> R$ {generator.preco_por_kwh}/kWh</span>
                    </div>
                    <div className="mt-2 w-full bg-slate-700 rounded-full h-1.5">
                      <div 
                        className="bg-blue-500 h-1.5 rounded-full" 
                        style={{ width: `${(generator.excedente_mensal_kwh / generator.capacidade_kwp) * 100}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {Math.round((generator.excedente_mensal_kwh / generator.capacidade_kwp) * 100)}% da capacidade disponível
                    </p>
                  </div>
                ))}
                {geradoresFiltrados.length === 0 && (
                  <div className="text-center text-slate-500 py-8">Nenhum gerador com excedente disponível</div>
                )}
              </div>
            </div>
          </div>

          {/* Matches Realizados */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-bold text-white">Matches Realizados</h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">
                {matches.length}
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/10">
                  <tr className="text-left text-slate-500 text-sm">
                    <th className="pb-3">Consumidor</th>
                    <th className="pb-3">Usina</th>
                    <th className="pb-3">kWh/mês</th>
                    <th className="pb-3">Valor</th>
                    <th className="pb-3">Data</th>
                    <th className="pb-3">Status</th>
                   </tr>
                </thead>
                <tbody>
                  {matches.map((match: any) => (
                    <tr key={match.id} className="border-b border-white/5 hover:bg-white/5 transition">
                      <td className="py-3 font-medium text-white">
                        {match.consumidor?.consumidor?.profiles?.nome || 'N/A'}
                      </td>
                      <td className="py-3 text-slate-400">
                        {match.gerador?.gerador?.profiles?.nome || match.gerador?.gerador?.nome_usina || 'N/A'}
                      </td>
                      <td className="py-3 text-white">{match.kwh_mensal} kWh</td>
                      <td className="py-3 text-emerald-400 font-bold">R$ {match.valor_mensal}</td>
                      <td className="py-3 text-slate-500 text-sm">
                        {new Date(match.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs">
                          <CheckCircle className="w-3 h-3" /> {match.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}