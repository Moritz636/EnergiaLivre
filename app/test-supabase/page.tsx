'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function TestSupabasePage() {
  const [status, setStatus] = useState('Testando...');
  const [error, setError] = useState('');

  useEffect(() => {
    async function test() {
      try {
        const supabase = createClient();
        
        const { data, error } = await supabase.from('leads').select('count', { count: 'exact', head: true });
        
        if (error) {
          setStatus('❌ Erro na conexão');
          setError(error.message);
        } else {
          setStatus('✅ Supabase conectado!');
        }
      } catch (err: any) {
        setStatus('❌ Falha na conexão');
        setError(err.message);
      }
    }
    
    test();
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-8">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md">
        <h1 className="text-2xl font-bold mb-4">Teste de Conexão Supabase</h1>
        <div className={`p-4 rounded-xl ${status.includes('✅') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
          <p className="font-bold">{status}</p>
          {error && <p className="text-sm mt-2">{error}</p>}
        </div>
      </div>
    </div>
  );
}