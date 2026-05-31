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
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
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

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Meu Dashboard</h1>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg">
            Sair
          </button>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <p className="text-slate-400">Bem-vindo, <span className="text-white">{user.email}</span></p>
          <p className="text-slate-500 text-sm mt-2">Escolha uma opção abaixo para começar</p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            
            {/* Consumidor */}
            <Link href="/completar-perfil/consumidor" className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center hover:bg-emerald-500/20 transition-all group">
              <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition">💰 Sou Consumidor</h3>
              <p className="text-slate-400 text-sm mt-1">Quero economizar na conta de luz</p>
            </Link>

            {/* Gerador */}
            <Link href="/completar-perfil/gerador" className="p-6 bg-blue-500/10 border border-blue-500/30 rounded-2xl text-center hover:bg-blue-500/20 transition-all group">
              <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition">⚡ Sou Gerador</h3>
              <p className="text-slate-400 text-sm mt-1">Tenho energia solar para compartilhar</p>
            </Link>

            {/* 🆕 Programa de Aliados */}
            <Link href="/aliado" className="p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl text-center hover:bg-yellow-500/20 transition-all group">
              <h3 className="text-xl font-bold text-white group-hover:text-yellow-400 transition">🤝 Programa de Aliados</h3>
              <p className="text-slate-400 text-sm mt-1">Ganhe comissões indicando a EnergiaLivre</p>
              <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-[10px] font-bold">Novo</span>
            </Link>

          </div>
        </div>
      </div>
    </div>
  );
}