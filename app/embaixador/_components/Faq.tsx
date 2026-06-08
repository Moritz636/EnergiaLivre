'use client'

// ============================================================
// Faq — Perguntas frequentes em <details> com chevron animado.
// ============================================================

import { useState } from 'react'

const FAQS = [
  {
    q: 'Preciso investir alguma coisa pra começar?',
    a: 'Não. Zero investimento, taxa de adesão ou meta obrigatória. Você só avança se fizer sentido.',
  },
  {
    q: 'Quanto posso ganhar?',
    a: 'Depende do seu número de indicações. Use o simulador acima — ele usa os percentuais reais do programa (15% no cadastro, 10% recorrente, 5% bônus parceiro).',
  },
  {
    q: 'Preciso ser CLT ou ter CNPJ?',
    a: 'Atua como autônomo. Sem vínculo empregatício. CNPJ é opcional (recomendado para emissão de NF).',
  },
  {
    q: 'Como recebo?',
    a: 'PIX direto para sua conta ou saldo em KWATT (token utilitário da plataforma, Lei 14.478/2022).',
  },
  {
    q: 'Posso indicar em qualquer estado?',
    a: 'Sim. A plataforma opera em 5 estados piloto (RS, SC, PR, SP, MT) e cresce conforme demanda. Cada estado tem sua própria rede de parceiros.',
  },
  {
    q: 'Tem materiais de venda prontos?',
    a: 'Sim. Dentro do grupo de WhatsApp você recebe cards, vídeos, calculadora e scripts de abordagem prontos para usar.',
  },
] as const

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="py-20 px-6 border-t border-white/5">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-black text-white text-center mb-10">
          Perguntas frequentes.
        </h2>
        <div className="space-y-3">
          {FAQS.map((f, i) => {
            const isOpen = openIndex === i
            return (
              <details
                key={i}
                open={isOpen}
                onToggle={(e) => setOpenIndex((e.target as HTMLDetailsElement).open ? i : null)}
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 group"
              >
                <summary className="text-base font-bold text-white cursor-pointer list-none flex items-center justify-between gap-3">
                  <span>{f.q}</span>
                  <span
                    className="text-emerald-400 group-open:rotate-45 transition-transform text-2xl leading-none"
                    aria-hidden
                  >
                    +
                  </span>
                </summary>
                <p className="text-sm text-slate-300 mt-3 leading-relaxed">{f.a}</p>
              </details>
            )
          })}
        </div>
      </div>
    </section>
  )
}
