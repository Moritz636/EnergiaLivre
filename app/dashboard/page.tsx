'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push('/login');
      } else {
        setUser(data.user);
      }
      setLoading(false);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) return <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">Carregando...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#020617] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg">Sair</button>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <p>Bem-vindo, <span className="font-bold">{user.email}</span></p>
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <Link href="/admin/leads" className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl text-center">Gerenciar Leads</Link>
            <Link href="/economizar" className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center">Quero Economizar</Link>
          </div>
        </div>
      </div>
    </div>
  );
}