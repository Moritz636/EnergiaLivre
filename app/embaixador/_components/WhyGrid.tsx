'use client'

// ============================================================
// WhyGrid — 3 cards "Por que EnergiaLivre"
// ============================================================

import { Shield, TrendingUp, Award } from 'lucide-react'

const ITEMS = [
  {
    icon: Shield,
    titulo: 'Compliance real',
    desc: 'Lei 14.300/2022 (compensação) · Lei 14.478/2022 (cripto) · LGPD · RLS no Supabase',
  },
  {
    icon: TrendingUp,
    titulo: 'Mercado bilionário',
    desc: '3,1 milhões de sistemas de energia distribuída no Brasil (ANEEL jan/2025). Você entra cedo.',
  },
  {
    icon: Award,
    titulo: 'Suporte humano',
    desc: 'Grupo de WhatsApp ativo, materiais de venda prontos, treinamento de 30 min por chamada.',
  },
] as const

export function WhyGrid() {
  return (
    <section className="py-20 px-6 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-3 gap-4">
          {ITEMS.map((s) => {
            const Icon = s.icon
            return (
              <div
                key={s.titulo}
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/10"
              >
                <Icon className="w-7 h-7 text-emerald-400 mb-3" aria-hidden />
                <h3 className="text-lg font-bold text-white mb-1.5">{s.titulo}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
