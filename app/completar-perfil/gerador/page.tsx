'use client';
import { useEffect } from 'react';
import { useRouter }from 'next/navigation';

export default function OldGeradorPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/cadastro-gerador');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="text-white">Redirecionando...</div>
    </div>
  );
}