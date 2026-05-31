'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GeradorRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redireciona imediatamente para a página de cadastro correta
    router.replace('/cadastro-gerador');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400">Redirecionando para o cadastro...</p>
      </div>
    </div>
  );
}