'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

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

      if (profile?.tipo === 'consumidor') {
        router.push('/dashboard-consumidor');
      } else if (profile?.tipo === 'gerador') {
        router.push('/dashboard-gerador');
      } else {
        router.push('/dashboard-consumidor');
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  if (loading) return <div className="min-h-screen bg-[#020617] flex items-center justify-center"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  return null;
}