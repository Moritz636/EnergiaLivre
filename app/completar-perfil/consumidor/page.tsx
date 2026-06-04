'use client';
import { useState, useEffect, type FormEvent } from 'react';
import { getSupabase } from '@/lib/supabase/singleton';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';

export default function CompletarPerfilConsumidor() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ nome: '', whatsapp: '', cidade: '', gastoMensal: '' });
  const router = useRouter();
  const supabase = getSupabase();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/login');
      else setUser(data.user);
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    await (supabase as any).from('leads').insert({
      nome: formData.nome,
      email: user.email,
      whatsapp: formData.whatsapp,
      cidade: formData.cidade,
      gasto_mensal: formData.gastoMensal,
      tipo: 'consumidor',
      status: 'pendente'
    });
    router.push('/dashboard');
  };

  if (loading) return <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">Carregando...</div>;

  return (
    <div className="min-h-screen bg-[#020617] text-white p-8">
      <div className="max-w-md mx-auto bg-white/5 border border-white/10 rounded-2xl p-8">
        <h1 className="text-2xl font-bold mb-4">Complete seu cadastro</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Nome completo" className="w-full bg-slate-800 border border-white/10 rounded-xl p-3" value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} required />
          <input type="text" placeholder="WhatsApp (com DDD)" className="w-full bg-slate-800 border border-white/10 rounded-xl p-3" value={formData.whatsapp} onChange={(e) => setFormData({...formData, whatsapp: e.target.value})} required />
          <input type="text" placeholder="Cidade" className="w-full bg-slate-800 border border-white/10 rounded-xl p-3" value={formData.cidade} onChange={(e) => setFormData({...formData, cidade: e.target.value})} required />
          <input type="number" placeholder="Gasto mensal com energia (R$)" className="w-full bg-slate-800 border border-white/10 rounded-xl p-3" value={formData.gastoMensal} onChange={(e) => setFormData({...formData, gastoMensal: e.target.value})} required />
          <button type="submit" className="w-full bg-emerald-500 text-slate-900 rounded-xl py-3 font-bold">Salvar e continuar</button>
        </form>
      </div>
    </div>
  );
}