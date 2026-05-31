'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  LogOut, 
  Zap, 
  TrendingUp, 
  DollarSign,
  Users,
  Calendar,
  Clock,
  Award,
  Crown,
  Flame,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Activity,
  Sun,
  Battery,
  ShieldCheck
} from 'lucide-react';
import { NotificationBell } from '@/app/components/NotificationBell';

export default function DashboardGeradorPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lucroMensal, setLucroMensal] = useState(12450);
  const [kwhVendidos, setKwhVendidos] = useState(8450);
  const [clientesAtivos, setClientesAtivos] = useState(12);
  const [capacidadeTotal, setCapacidadeTotal] = useState(150);
  const [excedenteDisponivel, setExcedenteDisponivel] = useState(3200);
  const [demandaPendente, setDemandaPendente] = useState(3);
  const [matchesRecentes, setMatchesRecentes] = useState([
    { nome: "Indústria Nova Esperança", kwh: 450, data: "30/05/2026", status: "ativo", valor: 315 },
    { nome: "Supermercado Bom Preço", kwh: 620, data: "28/05/2026", status: "ativo", valor: 434 },
    { nome: "Condomínio Solar", kwh: 380, data: "25/05/2026", status: "ativo", valor: 266 },
    { nome: "Padaria Pão Quente", kwh: 210, data: "22/05/2026", status: "ativo", valor: 147 },
  ]);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }
      
      setUser(user);
      setLoading(false);
    };
    
    checkUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans overflow-x-hidden">
      
      {/* Efeitos de fundo */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent -z-20" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -z-10" />
      <div className="fixed top-40 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px] -z-10" />

      {/* Navbar com Sino de Notificações */}
      <nav className="border-b border-white/10 bg-[#020617]/90 backdrop-blur-xl fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Zap className="text-slate-900 w-4 h-4 fill-current" />
            </div>
            <span className="text-xl font-black text-white">ENERGIA<span className="text-blue-500">LIVRE</span></span>
            <div className="ml-3 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-[9px] font-black text-blue-400 uppercase tracking-wider">
              Gerador
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm text-slate-400">
              <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-blue-400" /> Premium</span>
              <span className="w-1 h-1 rounded-full bg-slate-700" />
              <span>{user.email?.split('@')[0]}</span>
            </div>
            
            {/* 🔔 SINO DE NOTIFICAÇÕES */}
            <NotificationBell />
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-sm hover:bg-red-500/20 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Conteúdo Principal */}
      <div className="pt-24 px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="mb-10">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  <span className="text-xs text-yellow-400/80 uppercase tracking-wider">Status: Gerador Verificado</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  Olá, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">{user.email?.split('@')[0]}</span>
                </h1>
                <p className="text-slate-400 mt-2">
                  Sua usina está gerando <span className="text-blue-400 font-bold">lucro real</span>. Continue assim!
                </p>
              </div>
              <Link 
                href="/dashboard-gerador/novo-match" 
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-slate-900 rounded-xl font-bold hover:from-blue-400 hover:to-cyan-400 transition-all shadow-[0_0_25px_rgba(59,130,246,0.3)]"
              >
                <Users className="w-4 h-4" /> Atrair mais consumidores <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Link para configurações de notificação */}
          <div className="mb-6 text-right">
            <Link 
              href="/configuracoes/notificacoes" 
              className="text-xs text-slate-500 hover:text-blue-400 transition"
            >
              Configurar notificações →
            </Link>
          </div>

          {/* Cards de Métricas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/30 group hover:scale-105 transition-all">
              <div className="flex items-center justify-between mb-3">
                <DollarSign className="w-8 h-8 text-blue-400" />
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">↑ 12%</span>
              </div>
              <div className="text-2xl font-bold text-white">R$ {lucroMensal.toLocaleString('pt-BR')}</div>
              <p className="text-slate-400 text-sm">Lucro este mês</p>
              <div className="mt-3 text-[10px] text-emerald-400/80 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> + R$ 1.280 vs mês passado
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 group hover:scale-105 transition-all">
              <div className="flex items-center justify-between mb-3">
                <Zap className="w-8 h-8 text-yellow-400" />
              </div>
              <div className="text-2xl font-bold text-white">{kwhVendidos.toLocaleString('pt-BR')} kWh</div>
              <p className="text-slate-400 text-sm">Energia vendida</p>
              <div className="mt-3 text-[10px] text-blue-400/80 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +8% este mês
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 group hover:scale-105 transition-all">
              <div className="flex items-center justify-between mb-3">
                <Users className="w-8 h-8 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-white">{clientesAtivos}</div>
              <p className="text-slate-400 text-sm">Consumidores ativos</p>
              <div className="mt-3 text-[10px] text-emerald-400/80">
                +3 este mês
              </div>
            </div>
          {/* Link para configurações de notificação */}
          <div className="mb-6 text-right">
            <Link 
              href="/configuracoes/notificacoes" 
              className="text-xs text-slate-500 hover:text-emerald-400 transition inline-flex items-center gap-1"
            >
              ⚙️ Configurar notificações
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 group hover:scale-105 transition-all">
              <div className="flex items-center justify-between mb-3">
                <Activity className="w-8 h-8 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-white">{capacidadeTotal} kWp</div>
              <p className="text-slate-400 text-sm">Capacidade instalada</p>
              <div className="mt-3 text-[10px] text-slate-500">
                Excedente: {excedenteDisponivel} kWh
              </div>
            </div>
          </div>

          {/* Demanda Pendente */}
          {demandaPendente > 0 && (
            <div className="mb-10 p-6 rounded-2xl bg-gradient-to-r from-yellow-500/10 to-amber-500/5 border border-yellow-500/30">
              <div className="flex items-center gap-3 mb-4">
                <Flame className="w-6 h-6 text-yellow-400" />
                <h2 className="text-xl font-bold text-white">Oportunidade! {demandaPendente} consumidores esperando energia na sua região</h2>
              </div>
              <p className="text-slate-400 mb-4">
                Consumidores próximos à sua usina estão com demanda não atendida. Conecte-se agora e aumente seu lucro.
              </p>
              <Link 
                href="/admin/matches" 
                className="inline-flex items-center gap-2 px-6 py-2 bg-yellow-500/20 border border-yellow-500/40 rounded-xl text-yellow-400 font-medium hover:bg-yellow-500/30 transition-all"
              >
                Ver oportunidades <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Matches Recentes */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                <h2 className="text-xl font-bold text-white">Consumidores conectados</h2>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/10">
                  <tr className="text-left text-slate-500 text-sm">
                    <th className="pb-3">Consumidor</th>
                    <th className="pb-3">kWh/mês</th>
                    <th className="pb-3">Valor</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Conectado em</th>
                  </td>
                </thead>
                <tbody>
                  {matchesRecentes.map((match, index) => (
                    <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition">
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xs">
                            {match.nome.charAt(0)}
                          </div>
                          <span className="font-medium text-white">{match.nome}</span>
                        </div>
                      </td>
                      <td className="py-4 text-white">{match.kwh} kWh</td>
                      <td className="py-4 text-emerald-400 font-bold">R$ {match.valor}</td>
                      <td className="py-4">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs">
                          <CheckCircle2 className="w-3 h-3" /> {match.status === 'ativo' ? 'Ativo' : 'Pendente'}
                        </span>
                      </td>
                      <td className="py-4 text-slate-500 text-sm">{match.data}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Link para voltar */}
          <div className="mt-10 text-center">
            <Link href="/" className="text-slate-500 text-sm hover:text-blue-400 transition">
              ← Voltar para a página inicial
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}