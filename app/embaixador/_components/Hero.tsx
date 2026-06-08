'use client'

import Image from 'next/image'
import { Sparkles, ArrowRight, Calculator } from 'lucide-react'

interface HeroProps {
  whatsappGroupUrl: string
}

export function Hero({ whatsappGroupUrl }: HeroProps) {
  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden">
      <div className="absolute inset-0 -z-20" aria-hidden>
        <Image
          src="/images/embaixador-hero.webp"
          alt=""
          fill
          className="object-cover opacity-20"
          priority
        />
      </div>
      <div className="absolute inset-0 -z-10 opacity-30" aria-hidden>
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-black uppercase tracking-widest mb-8">
          <Sparkles className="w-3 h-3" /> Programa de Parceiros · Lei 14.300/2022
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight">
          Transforme sua rede
          <br />
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            em renda recorrente.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-300 mt-8 max-w-2xl mx-auto leading-relaxed">
          Você indica. A plataforma faz o match. A energia flui. Você recebe todo mês.
          <br className="hidden md:block" />
          <span className="text-emerald-300">
            Sem investimento, sem estoque, sem meta obrigatória.
          </span>
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={whatsappGroupUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 font-bold hover:from-emerald-400 hover:to-cyan-400 transition flex items-center gap-2 group"
          >
            Entrar no grupo de parceiros{' '}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="#simulador"
            className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition flex items-center gap-2"
          >
            <Calculator className="w-4 h-4" /> Simular ganhos
          </a>
        </div>

        <p className="text-[10px] text-slate-500 mt-4 italic max-w-md mx-auto">
          Programa oficial · LGPD compliant · Compliance ANEEL · Sem promessa de rendimento
          fixo
        </p>
      </div>
    </section>
  )
}
