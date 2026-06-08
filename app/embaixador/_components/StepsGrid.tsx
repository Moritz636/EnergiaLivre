'use client'

// ============================================================
// StepsGrid — "Como funciona" em 3 passos numerados.
// ============================================================

import { Users, Handshake, DollarSign } from 'lucide-react'

const STEPS = [
  {
    n: '01',
    icon: Users,
    titulo: 'Indique',
    desc: 'Compartilhe seu link de parceiro. WhatsApp, Instagram, boca a boca — você escolhe.',
  },
  {
    n: '02',
    icon: Handshake,
    titulo: 'A plataforma faz o resto',
    desc: 'Match Tinder, validação de crédito, integração com a distribuidora. Zero burocracia.',
  },
  {
    n: '03',
    icon: DollarSign,
    titulo: 'Você recebe todo mês',
    desc: 'Comissão na venda + recorrência enquanto o cliente estiver ativo. Pix ou KWATT.',
  },
] as const

export function StepsGrid() {
  return (
    <section className="py-20 px-6 border-y border-white/5">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-3 gap-4">
          {STEPS.map((s) => {
            const Icon = s.icon
            return (
              <div
                key={s.n}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-emerald-500/30 transition"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-mono text-emerald-300 font-bold uppercase tracking-widest">
                    Passo {s.n}
                  </span>
                  <Icon className="w-5 h-5 text-emerald-400" aria-hidden />
                </div>
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
