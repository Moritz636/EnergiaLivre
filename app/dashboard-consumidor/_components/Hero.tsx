'use client'

// ============================================================
// Hero — Cabeçalho da página com título e status do plano
// ============================================================

export interface HeroData {
  planoAtivo: boolean
  nomePlano: string
  percentualEconomia: number
}

interface HeroProps {
  data: HeroData
}

export function Hero({ data }: HeroProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
        Sua economia em tempo real
      </h1>
      <p className="text-slate-400">
        {data.planoAtivo
          ? `Plano ${data.nomePlano} ativo. Você está economizando ${data.percentualEconomia}% na sua conta.`
          : 'Ative um plano para começar a economizar com energia solar.'}
      </p>
    </div>
  )
}
