'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Zap, TrendingDown, DollarSign, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function SimuladorPage() {
  const [gasto, setGasto] = useState(350);
  const economia = Math.round(gasto * 0.32);
  const economiaAnual = economia * 12;
  const percentual = 32;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 py-20 px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Quanto você pode <span className="text-emerald-400">economizar?</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Ajuste o valor da sua conta de luz e veja a economia em tempo real
          </p>
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs">
            <Zap className="w-3 h-3" /> Simulação 100% gratuita • Sem cadastro
          </div>
        </div>

        {/* Card do Simulador */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/10 rounded-3xl p-8 md:p-12">
          
          {/* Slider */}
          <div className="mb-10">
            <div className="flex justify-between mb-4">
              <span className="text-slate-400">Sua conta de luz atual</span>
              <span className="text-2xl font-bold text-white">R$ {gasto}</span>
            </div>
            <input
              type="range"
              min="100"
              max="2000"
              step="50"
              value={gasto}
              onChange={(e) => setGasto(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-2">
              <span>R$ 100</span>
              <span>R$ 500</span>
              <span>R$ 1.000</span>
              <span>R$ 1.500</span>
              <span>R$ 2.000</span>
            </div>
          </div>

          {/* Resultados */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/30 text-center">
              <p className="text-slate-400 text-sm mb-2">Economia mensal</p>
              <p className="text-4xl font-bold text-emerald-400">R$ {economia}</p>
              <p className="text-xs text-slate-500 mt-2">até {percentual}% de desconto</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
              <p className="text-slate-400 text-sm mb-2">Economia em 12 meses</p>
              <p className="text-4xl font-bold text-white">R$ {economiaAnual}</p>
              <p className="text-xs text-slate-500 mt-2">equivalente a {Math.round(economiaAnual / 100)} meses grátis</p>
            </div>
          </div>

          {/* Comparativo Visual */}
          <div className="mb-8">
            <p className="text-center text-slate-400 text-sm mb-4">Comparativo na conta de luz</p>
            <div className="relative pt-4">
              <div className="flex justify-between text-sm text-slate-500 mb-2">
                <span>Sem energia solar</span>
                <span>R$ {gasto}</span>
              </div>
              <div className="w-full bg-red-500/20 rounded-full h-3">
                <div className="bg-red-500 h-3 rounded-full" style={{ width: '100%' }} />
              </div>
              <div className="flex justify-between text-sm text-slate-500 mt-4 mb-2">
                <span>Com EnergiaLivre</span>
                <span className="text-emerald-400">R$ {gasto - economia}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-3">
                <div className="bg-emerald-500 h-3 rounded-full" style={{ width: `${((gasto - economia) / gasto) * 100}%` }} />
              </div>
            </div>
          </div>

          {/* Selos de Transparência (Lei 12) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="text-center p-3 rounded-xl bg-white/5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
              <p className="text-xs text-slate-400">Sem investimento</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
              <p className="text-xs text-slate-400">Sem obras</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
              <p className="text-xs text-slate-400">100% digital</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
              <p className="text-xs text-slate-400">Regulado ANEEL</p>
            </div>
          </div>

          {/* Prazo honesto - Diferencial competitivo */}
          <div className="mb-8 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-center">
            <p className="text-yellow-400 text-sm font-medium mb-1">
              ⏱️ Transparência total
            </p>
            <p className="text-slate-300 text-sm">
              A economia começa a valer em até <strong className="text-yellow-400">90 dias</strong> (prazo regulatório da distribuidora). 
              Enquanto isso, você já está cadastrado e garantindo sua vaga.
            </p>
          </div>

          {/* CTA */}
          <Link 
            href="/economizar" 
            className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-900 rounded-xl font-bold text-lg hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-lg"
          >
            Quero economizar agora <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Comparativo com concorrentes (Sutil, mas mortal) */}
        <div className="mt-12 text-center text-xs text-slate-600">
          <p>⚡ Enquanto outros enviam PDF por e-mail, você simula em tempo real.</p>
          <p className="mt-1">🔍 Enquanto outros escondem o prazo, a gente te conta tudo antes de você assinar.</p>
        </div>
      </div>
    </div>
  );
}