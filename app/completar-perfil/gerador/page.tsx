'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OldGeradorRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redireciona instantaneamente para a nova página de cadastro
    router.replace('/cadastro-gerador');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-4"></div>
        <p>Redirecionando para a nova área de cadastro...</p>
      </div>
    </div>
  );
}