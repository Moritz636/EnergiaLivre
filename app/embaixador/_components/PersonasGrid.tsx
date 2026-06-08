'use client'

import Image from 'next/image'
import { Users } from 'lucide-react'
interface Persona {
  nome: string
  cidade: string
  canal: string
  metric: string
  quote: string
  imagem: string
}

const PERSONAS: Persona[] = [
  {
    nome: 'Mariana R.',
    cidade: 'Florianópolis, SC',
    canal: 'Instagram',
    metric: '12 clientes ativos',
    quote:
      'Comecei indicando para amigos próximos no meu bairro. Hoje tenho uma rede orgânica de 12 clientes que se indica entre si. A recorrência é o que faz diferença.',
    imagem: '/images/testimonial-mariana.webp',
  },
  {
    nome: 'Rafael C.',
    cidade: 'Curitiba, PR',
    canal: 'YouTube',
    metric: '28 clientes ativos',
    quote:
      'Faço conteúdo sobre transição energética. Quando lancei a parceria com a EnergiaLivre, o KWATT virou um incentivo a mais para minha audiência se cadastrar.',
    imagem: '/images/testimonial-rafael.webp',
  },
  {
    nome: 'Juliana L.',
    cidade: 'Porto Alegre, RS',
    canal: 'Indicação direta',
    metric: '6 clientes ativos',
    quote:
      'Sou corretora de imóveis. Cada cliente que fecho um contrato recebe a indicação da EnergiaLivre junto. É um benefício extra que fechou várias vendas.',
    imagem: '/images/testimonial-juliana.webp',
  },
]

export function PersonasGrid() {
  return (
    <section className="relative py-20 px-6 border-t border-white/5">
      <div className="absolute inset-0 -z-10" aria-hidden>
        <Image
          src="/images/embaixador-pratica.webp"
          alt=""
          fill
          className="object-cover opacity-[0.04]"
        />
      </div>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-2 mb-3 text-xs text-emerald-300 uppercase tracking-widest font-bold">
          <Users className="w-3.5 h-3.5" /> Parceiros
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-white mb-3 leading-tight">
          Quem faz parte.
        </h2>
        <p className="text-slate-400 text-base max-w-2xl mb-10">
          Três parceiros de diferentes regiões do Brasil.
        </p>

        <div className="grid md:grid-cols-3 gap-4">
          {PERSONAS.map((p, i) => (
            <div
              key={p.nome}
              className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                  <Image
                    src={p.imagem}
                    alt={p.nome}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white truncate">{p.nome}</p>
                  <p className="text-[10px] text-slate-500 truncate">
                    {p.cidade} · {p.canal}
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider mb-2">
                {p.metric}
              </p>
              <p className="text-sm text-slate-300 leading-relaxed flex-1">
                &ldquo;{p.quote}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
