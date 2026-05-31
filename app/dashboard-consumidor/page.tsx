'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  LogOut, 
  Zap, 
  TrendingDown, 
  DollarSign,
  Calendar,
  Award,
  Crown,
  ArrowRight,
  CheckCircle2,
  Leaf,
  Home,
  PiggyBank,
  BarChart3,
  ShieldCheck,
  Sparkles,
  Flame,
  Globe
} from 'lucide-react';
import { NotificationBell } from '@/app/components/NotificationBell';

export default function DashboardConsumidorPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Dados simulados do consumidor
  const [economiaMensal, setEconomiaMensal] = useState(187);
  const [economiaAnual, setEconomiaAnual] = useState(2244);
  const [kwhEconomizados, setKwhEconomizados] = useState(584);
  const [co2Evitado, setCo2Evitado] = useState(412);
  const [faturaAtual, setFaturaAtual] = useState(589);
  const [faturaComDesconto, setFaturaComDesconto] = useState(402);
  const [percentualEconomia, setPercentualEconomia] = useState(32);
  const [diasConectado, setDiasConectado] = useState(47);
  const [arvoresSalvas, setArvoresSalvas] = useState(18);
  
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
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans overflow-x-hidden">
      
      {/* Efeitos de fundo */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent -z-20" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -z-10" />
      <div className="fixed top-40 right-0 w-80 h-80 bg-yellow-500/5 rounded-full blur-[100px] -z-10" />

      {/* Navbar com Sino de Notificações */}
      <nav className="border-b border-white/10 bg-[#020617]/90 backdrop-blur-xl fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-emerald-400 rounded-lg flex items-center justify-center">
              <Zap className="text-slate-900 w-4 h-4 fill-current" />
            </div>
            <span className="text-xl font-black text-white">ENERGIA<span className="text-emerald-500">LIVRE</span></span>
            <div className="ml-3 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[9px] font-black text-emerald-400 uppercase tracking-wider">
              Consumidor
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm text-slate-400">
              <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-400" /> Protegido</span>
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
          
          {/* Header com Saudação */}
          <div className="mb-10">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  <span className="text-xs text-yellow-400/80 uppercase tracking-wider">Cliente EnergiaLivre • Mês {diasConectado} dias</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  Olá, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-yellow-400">{user.email?.split('@')[0]}</span>
                </h1>
                <p className="text-slate-400 mt-2">
                  Você já economizou <span className="text-emerald-400 font-bold">R$ {economiaMensal}</span> neste mês. Continue assim!
                </p>
              </div>
              <Link 
                href="/dashboard-consumidor/indicar-amigos" 
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-900 rounded-xl font-bold hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-[0_0_25px_rgba(16,185,129,0.3)]"
              >
                Indicar amigos <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Cards de Métricas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-green-500/5 border border-emerald-500/30 group hover:scale-105 transition-all">
              <div className="flex items-center justify-between mb-3">
                <DollarSign className="w-8 h-8 text-emerald-400" />
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">Economia real</span>
              </div>
              <div className="text-3xl font-bold text-white">R$ {economiaMensal}</div>
              <p className="text-slate-400 text-sm">economizados este mês</p>
              <div className="mt-3 text-[10px] text-emerald-400/80 flex items-center gap-1">
                <TrendingDown className="w-3 h-3" /> {economiaAnual} em 12 meses
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 group hover:scale-105 transition-all">
              <div className="flex items-center justify-between mb-3">
                <Zap className="w-8 h-8 text-yellow-400" />
              </div>
              <div className="text-3xl font-bold text-white">{kwhEconomizados} kWh</div>
              <p className="text-slate-400 text-sm">energia limpa consumida</p>
              <div className="mt-3 text-[10px] text-yellow-400/80 flex items-center gap-1">
                <Leaf className="w-3 h-3" /> {co2Evitado} kg CO₂ evitados
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 group hover:scale-105 transition-all">
              <div className="flex items-center justify-between mb-3">
                <PiggyBank className="w-8 h-8 text-emerald-400" />
              </div>
              <div className="text-3xl font-bold text-white">{percentualEconomia}%</div>
              <p className="text-slate-400 text-sm">de redução na conta</p>
              <div className="mt-3 text-[10px] text-emerald-400/80">
                vs tarifa convencional
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 group hover:scale-105 transition-all">
              <div className="flex items-center justify-between mb-3">
                <Leaf className="w-8 h-8 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-white">{arvoresSalvas}</div>
              <p className="text-slate-400 text-sm">árvores preservadas*</p>
              <div className="mt-3 text-[10px] text-slate-500">
                *equivalente ao CO₂ evitado
              </div>
            </div>
          </div>

          {/* Link para configurações de notificação */}
          <div className="mb-6 text-right">
            <Link 
              href="/configuracoes/notificacoes" 
              className="text-xs text-slate-500 hover:text-emerald-400 transition"
            >
              Configurar notificações →
            </Link>
          </div>

          {/* Comparativo da Conta de Luz */}
          <div className="mb-10 p-8 rounded-3xl bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-white/10">
            <div className="flex items-center gap-2 mb-6">
              <Home className="w-6 h-6 text-emerald-400" />
              <h2 className="text-2xl font-bold text-white">Sua conta de luz</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20">
                <p className="text-slate-400 text-sm mb-2">Sem energia solar</p>
                <p className="text-3xl font-bold text-red-400">R$ {faturaAtual}</p>
                <div className="mt-2 h-2 bg-red-500/20 rounded-full overflow-hidden">
                  <div className="w-full h-full bg-red-500 rounded-full" style={{ width: '100%' }} />
                </div>
                <p className="text-xs text-slate-500 mt-3">Tarifa convencional</p>
              </div>
              
              <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/30 relative">
                <div className="absolute -top-3 -right-3 px-2 py-1 rounded-full bg-emerald-500 text-slate-900 text-[9px] font-bold">
                  {percentualEconomia}% OFF
                </div>
                <p className="text-slate-400 text-sm mb-2">Com EnergiaLivre</p>
                <p className="text-3xl font-bold text-emerald-400">R$ {faturaComDesconto}</p>
                <div className="mt-2 h-2 bg-emerald-500/20 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${100 - percentualEconomia}%` }} />
                </div>
                <p className="text-xs text-emerald-400/80 mt-3">Economia de R$ {economiaMensal} este mês</p>
              </div>
            </div>
          </div>

          {/* Timeline de Economia */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
                <h2 className="text-xl font-bold text-white">Histórico de economia</h2>
              </div>
            </div>
            
            <div className="space-y-4">
              {[
                { mes: "Maio/2026", economia: 187, cor: "emerald" },
                { mes: "Abril/2026", economia: 172, cor: "emerald" },
                { mes: "Março/2026", economia: 158, cor: "emerald" },
                { mes: "Fevereiro/2026", economia: 143, cor: "emerald" },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    <span className="text-white">{item.mes}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full" 
                        style={{ width: `${(item.economia / 200) * 100}%` }} 
                      />
                    </div>
                    <span className="text-emerald-400 font-bold w-20 text-right">R$ {item.economia}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Link para voltar */}
          <div className="mt-10 text-center">
            <Link href="/" className="text-slate-500 text-sm hover:text-emerald-400 transition">
              ← Voltar para a página inicial
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}