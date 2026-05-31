'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/login');
      else setUser(data.user);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">Carregando...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Meu Dashboard</h1>
          <button onClick={() => supabase.auth.signOut()} className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg">
            Sair
          </button>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <p className="text-slate-400">Bem-vindo, <span className="text-white">{user.email}</span></p>
          <p className="text-slate-500 text-sm mt-2">Complete seu perfil para começar a economizar ou vender energia.</p>
          
          {/* Grid com 4 colunas no desktop */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            
            {/* Card do Consumidor */}
            <Link href="/dashboard-consumidor" className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center hover:bg-emerald-500/20 transition-all group">
              <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition">Dashboard do Consumidor</h3>
              <p className="text-slate-400 text-sm mt-1">Acompanhe sua economia e impacto</p>
            </Link>

            {/* Card do Gerador */}
            <Link href="/dashboard-gerador" className="p-6 bg-blue-500/10 border border-blue-500/30 rounded-2xl text-center hover:bg-blue-500/20 transition-all group">
              <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition">Dashboard do Gerador</h3>
              <p className="text-slate-400 text-sm mt-1">Acompanhe seu lucro e performance</p>
            </Link>

            {/* Card do Motor de Match (Admin) */}
            <Link href="/admin/matches" className="p-6 bg-purple-500/10 border border-purple-500/30 rounded-2xl text-center hover:bg-purple-500/20 transition-all group">
              <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition">⚡ Motor de Match</h3>
              <p className="text-slate-400 text-sm mt-1">Conecte consumidores e geradores</p>
              <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-[10px] font-bold">Admin</span>
            </Link>

            {/* 🆕 NOVO: Card do Admin Dashboard */}
            <Link href="/admin/dashboard" className="p-6 bg-purple-500/10 border border-purple-500/30 rounded-2xl text-center hover:bg-purple-500/20 transition-all group">
              <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition">📊 Admin Dashboard</h3>
              <p className="text-slate-400 text-sm mt-1">Visão completa do negócio</p>
              <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-[10px] font-bold">Admin</span>
            </Link>
          </div>

          {/* Seção de Acesso Rápido aos Formulários de Perfil */}
          <div className="mt-8 pt-8 border-t border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Complete seu cadastro</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Link 
                href="/completar-perfil/consumidor" 
                className="p-4 bg-white/5 border border-white/10 rounded-xl text-center hover:bg-white/10 transition-all"
              >
                <h4 className="text-white font-medium">Sou Consumidor</h4>
                <p className="text-slate-500 text-xs">Quero economizar na conta de luz</p>
              </Link>
              <Link 
                href="/completar-perfil/gerador" 
                className="p-4 bg-white/5 border border-white/10 rounded-xl text-center hover:bg-white/10 transition-all"
              >
                <h4 className="text-white font-medium">Sou Gerador</h4>
                <p className="text-slate-500 text-xs">Tenho energia solar para compartilhar</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}