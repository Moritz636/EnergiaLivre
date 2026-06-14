'use client'

import { useState } from 'react'
import { Lock, Zap, Shield, Clock, Sparkles, Check, Loader2, CreditCard } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface AccessGateCardProps {
  email?: string
  selectedUsinaId?: string
  onPaymentComplete?: () => void
}

const BENEFITS = [
  'Mapa interativo com todas as usinas compativeis',
  'Comparador detalhado de preco, distancia e economia',
  'Relatorios de economia projetada em 12/24/36 meses',
  'Suporte prioritario via WhatsApp',
  'Acesso por 30 dias — cancele quando quiser',
]

export function AccessGateCard({ onPaymentComplete }: AccessGateCardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleCheckout = () => {
    setLoading(true)
    router.push('/checkout-member-plus')
  }

  return (
    <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-500/15 via-yellow-500/10 to-cyan-500/15 border border-emerald-500/30 shadow-2xl overflow-hidden">
      <div className="absolute -top-20 -right-20 w-60 h-60 bg-emerald-500/20 rounded-full blur-[80px]" aria-hidden />
      <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-yellow-500/15 rounded-full blur-[80px]" aria-hidden />

      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-[10px] font-black uppercase tracking-wider text-yellow-300">
            <Sparkles className="w-3 h-3" /> Oferta de lancamento
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
          Desbloqueie o match completo por{' '}
          <span className="text-emerald-400">R$ 9,99</span>
        </h2>
        <p className="text-sm text-slate-300 mt-2 leading-relaxed">
          Visualize exatamente a usina que pode cortar sua conta pela metade. Tenha
          30 dias de acesso ao mapa interativo, comparador e relatorios de economia.
        </p>

        <ul className="mt-5 space-y-2">
          {BENEFITS.map((b) => (
            <li key={b} className="flex items-start gap-2 text-sm text-slate-200">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex items-center gap-4 text-[11px] text-slate-400">
          <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-emerald-400" /> Garantia 7 dias</span>
          <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5 text-cyan-400" /> Stripe Verified</span>
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-yellow-400" /> Acesso 30 dias</span>
        </div>

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="mt-5 w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black text-base transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30"
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Redirecionando...</>
          ) : (
            <><CreditCard className="w-5 h-5" /> Pagar com Cartão — R$ 9,99</>
          )}
        </button>

        <p className="mt-3 text-center text-[10px] text-slate-500">
          Pagamento processado por Stripe. Cancele a qualquer momento.
        </p>
      </div>
    </div>
  )
}
