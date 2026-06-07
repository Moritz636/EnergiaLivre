'use client'

// ============================================================
// PersonasGrid — Cards de embaixadores "ilustrativos" com
// disclaimer explícito.
// ============================================================

import { Users, AlertCircle } from 'lucide-react'

interface Persona {
  iniciais: string
  nome: string
  cidade: string
  canal: string
  cor: string
  metric: string
  quote: string
}

const PERSONAS: Persona[] = [
  {
    iniciais: 'MR',
    nome: 'Marina R.',
    cidade: 'Florianópolis, SC',
    canal: 'Instagram',
    cor: 'from-emerald-500 to-cyan-500',
    metric: '12 clientes ativos',
    quote:
      'Comecei indicando para amigos próximos no meu bairro. Hoje tenho uma rede orgânica de 12 clientes que se indica entre si. A recorrência é o que faz diferença.',
  },
  {
    iniciais: 'RC',
    nome: 'Rafael C.',
    cidade: 'Curitiba, PR',
    canal: 'YouTube',
    cor: 'from-purple-500 to-pink-500',
    metric: '28 clientes ativos',
    quote:
      'Faço conteúdo sobre transição energética. Quando lancei a parceria com a EnergiaLivre, o KWATT virou um incentivo a mais para minha audiência se cadastrar.',
  },
  {
    iniciais: 'JL',
    nome: 'Juliana L.',
    cidade: 'Porto Alegre, RS',
    canal: 'Indicação direta',
    cor: 'from-amber-500 to-orange-500',
    metric: '6 clientes ativos',
    quote:
      'Sou corretora de imóveis. Cada cliente que fecho um contrato recebe a indicação da EnergiaLivre junto. É um benefício extra que fechou várias vendas.',
  },
]

export function PersonasGrid() {
  return (
    <section className="py-20 px-6 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-2 mb-3 text-xs text-emerald-300 uppercase tracking-widest font-bold">
          <Users className="w-3.5 h-3.5" /> Embaixadores
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-white mb-3 leading-tight">
          Quem faz parte.
        </h2>
        <p className="text-slate-400 text-base max-w-2xl mb-10">
          Três embaixadores de diferentes regiões do Brasil.
        </p>

        <div className="grid md:grid-cols-3 gap-4">
          {PERSONAS.map((p) => (
            <div
              key={p.iniciais}
              className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col"
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.cor} flex items-center justify-center text-white text-sm font-black shrink-0`}
                  aria-hidden
                >
                  {p.iniciais}
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

        <p className="text-[10px] text-slate-500 mt-6 italic max-w-3xl flex items-start gap-1.5">
          <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
          <span>
            Personas e depoimentos são <strong>ilustrativos</strong>, baseados em perfis
            representativos de embaixadores. Depoimentos verificados serão coletados
            diretamente dos embaixadores ativos e adicionados ao programa.
          </span>
        </p>
      </div>
    </section>
  )
}
