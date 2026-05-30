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
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Meu Dashboard</h1>
          <button onClick={() => supabase.auth.signOut()} className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg">
            Sair
          </button>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <p className="text-slate-400">Bem-vindo, <span className="text-white">{user.email}</span></p>
          <p className="text-slate-500 text-sm mt-2">Complete seu perfil para começar a economizar ou vender energia.</p>
          
          <div className="grid md:grid-cols-2 gap-4 mt-8">
            <Link href="/completar-perfil/consumidor" className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center hover:bg-emerald-500/20">
              <h3 className="text-xl font-bold text-white">Sou Consumidor</h3>
              <p className="text-slate-400 text-sm">Quero economizar na conta de luz</p>
            </Link>
            <Link href="/completar-perfil/gerador" className="p-6 bg-blue-500/10 border border-blue-500/30 rounded-2xl text-center hover:bg-blue-500/20">
              <h3 className="text-xl font-bold text-white">Sou Gerador</h3>
              <p className="text-slate-400 text-sm">Tenho energia solar para compartilhar</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}