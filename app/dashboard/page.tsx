'use client';
import { useEffect } from 'react';
import { getSupabase } from '@/lib/supabase/singleton';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const supabase = getSupabase();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('tipo')
        .eq('id', user.id)
        .single();

      const tipo = (profile as { tipo?: string } | null)?.tipo
      if (tipo === 'gerador') {
        router.replace('/dashboard-gerador');
      } else {
        router.replace('/dashboard-consumidor');
      }
    };
    checkUser();
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}