'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, Zap, TrendingDown, DollarSign, ShieldCheck, Crown, ArrowRight } from 'lucide-react';

export default function DashboardConsumidorPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login');
        return;
      }
      setUser(user);
      setLoading(false);
    };
    checkUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Dashboard Consumidor</h1>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg">
            <LogOut className="w-4 h-4 inline mr-2" /> Sair
          </button>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <Crown className="w-8 h-8 text-yellow-400" />
            <div>
              <p className="text-slate-400">Bem-vindo,</p>
              <p className="text-2xl font-bold text-white">{user?.email}</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/30">
              <DollarSign className="w-8 h-8 text-emerald-400 mb-3" />
              <p className="text-sm text-slate-400">Sua economia estimada</p>
              <p className="text-3xl font-bold text-white">R$ 0,00</p>
              <p className="text-xs text-slate-500 mt-2">Complete seu perfil para calcular</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <Zap className="w-8 h-8 text-yellow-400 mb-3" />
              <p className="text-sm text-slate-400">Energia economizada</p>
              <p className="text-3xl font-bold text-white">0 kWh</p>
              <p className="text-xs text-slate-500 mt-2">Em breve seus créditos</p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link href="/" className="text-slate-500 text-sm hover:text-emerald-400 transition">
              ← Voltar para a página inicial
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}