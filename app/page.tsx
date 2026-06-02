'use client';
import React from 'react';
import Link from 'next/link';
import { ArrowRight, Zap, ShieldCheck, Globe, Crown } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans">
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-[#020617]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-400 rounded-xl flex items-center justify-center">
              <Zap className="text-slate-900 w-5 h-5 fill-current" />
            </div>
            <span className="text-2xl font-black text-white">ENERGIA<span className="text-emerald-500">LIVRE</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <Link href="/login" className="hover:text-white transition">Entrar</Link>
            <Link href="/cadastro" className="bg-emerald-500 text-slate-900 px-5 py-2 rounded-full font-bold hover:bg-emerald-400 transition">Criar Conta</Link>
          </div>
        </div>
      </nav>

      <section className="relative pt-32 pb-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-8">
            <Crown className="w-3.5 h-3.5" /> Marketplace de Energia Solar
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
            Sua energia solar <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-yellow-500">livre para circular</span>
          </h1>
          <p className="text-lg text-slate-400 mb-12 max-w-2xl mx-auto">
            Conectamos quem gera energia excedente com quem quer economizar. Simples, seguro e 100% digital.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/cadastro" className="px-10 py-4 bg-emerald-500 text-slate-900 rounded-full font-bold text-lg hover:bg-emerald-400 transition flex items-center justify-center gap-2">
              Começar Agora <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/para-geradores" className="px-10 py-4 bg-white/10 border border-white/20 text-white rounded-full font-bold text-lg hover:bg-white/20 transition">
              Sou Gerador
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
