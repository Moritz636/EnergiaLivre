'use client';
import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase/singleton';
import {
  ArrowLeft, ArrowRight, Zap, ShieldCheck, Loader2, Sparkles,
  CheckCircle2, CreditCard, Coins, Gift, TrendingUp,
} from 'lucide-react';

const PRESETS = [
  { value: 50, label: 'R$ 50', bonus: 'R$ 5' },
  { value: 100, label: 'R$ 100', bonus: 'R$ 12' },
  { value: 250, label: 'R$ 250', bonus: 'R$ 35' },
  { value: 500, label: 'R$ 500', bonus: 'R$ 80' },
]

export default function MoedaEnergiaCheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020617] flex items-center justify-center"><Loader2 className="w-8 h-8 text-emerald-400 animate-spin" /></div>}>
      <PageContent />
    </Suspense>
  )
}

function PageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<any>(null)
  const [amount, setAmount] = useState<number>(100)
  const [customAmount, setCustomAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = getSupabase()

  const success = searchParams.get('success')
  const canceled = searchParams.get('canceled')

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login?from=moeda-energia'); return }
      setUser(user)
    }
    check()
  }, [router, supabase])

  const selectedPreset = PRESETS.find((p) => p.value === amount)

  const handleCheckout = async () => {
    setLoading(true)
    setError('')
    const finalAmount = customAmount ? parseFloat(customAmount.replace(',', '.')) : amount
    if (!finalAmount || finalAmount < 10 || finalAmount > 5000) {
      setError('Valor deve estar entre R$ 10 e R$ 5.000')
      setLoading(false)
      return
    }
    try {
      const res = await fetch('/api/stripe/checkout-moeda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalAmount }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Erro ao criar checkout')
      window.location.href = body.url
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    const amt = searchParams.get('amount')
    return (
      <div className="min-h-screen bg-[#020617] text-slate-200 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-black text-white mb-3">Pagamento confirmado!</h1>
          <p className="text-slate-300 mb-2">
            {amt
              ? `R$ ${parseFloat(amt).toFixed(2)} em Moeda Energia foram creditados na sua conta.`
              : 'Seus créditos de Moeda Energia foram adicionados.'}
          </p>
          <p className="text-sm text-slate-400 mb-8">Use para abater sua fatura, acumular cashback e mais.</p>
          <Link
            href="/dashboard-consumidor"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-900 rounded-xl font-bold transition"
          >
            Ir para o painel <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
      <div className="border-b border-white/10 bg-[#020617]/80 backdrop-blur-xl fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-amber-500 to-yellow-400 rounded-lg flex items-center justify-center">
              <Coins className="text-slate-900 w-4 h-4" />
            </div>
            <span className="text-xl font-black text-white">ENERGIA<span className="text-emerald-500">LIVRE</span></span>
          </Link>
          <Link href="/token" className="text-sm text-slate-400 hover:text-emerald-400 transition flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
        </div>
      </div>

      <div className="pt-24 px-6 pb-20">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-7 h-7 text-amber-400" />
            </div>
            <h1 className="text-3xl font-black text-white mb-2">Comprar Moeda Energia</h1>
            <p className="text-slate-400 text-sm">Créditos liberados na hora. Use para economizar na conta de luz.</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-4">Escolha o valor</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {PRESETS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => { setAmount(p.value); setCustomAmount('') }}
                  className={`p-4 rounded-xl text-left transition border ${
                    amount === p.value && !customAmount
                      ? 'bg-amber-500/20 border-amber-500/50'
                      : 'bg-white/5 border-white/10 hover:border-amber-500/30'
                  }`}
                >
                  <p className="text-lg font-black text-white">{p.label}</p>
                  <p className="text-[10px] text-emerald-400 font-bold">+ {p.bonus} bônus</p>
                </button>
              ))}
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
              <input
                type="number"
                placeholder="Outro valor"
                value={customAmount}
                onChange={(e) => { setCustomAmount(e.target.value); setAmount(0) }}
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/50 outline-none transition"
              />
            </div>
          </div>

          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Gift className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-200">Bônus inclusos</span>
            </div>
            <p className="text-sm text-slate-300">
              {selectedPreset
                ? `Ao comprar ${selectedPreset.label}, você ganha ${selectedPreset.bonus} extras!`
                : 'Compre a partir de R$ 10 e ganhe bônus progressivos.'}
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-300 mb-4">
              {error}
            </div>
          )}

          {canceled && (
            <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-sm text-yellow-300 mb-4">
              Pagamento cancelado. Seu saldo não foi alterado.
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-900 font-black text-lg transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Redirecionando...</>
            ) : (
              <><CreditCard className="w-5 h-5" /> Pagar com Stripe</>
            )}
          </button>

          <div className="flex items-center justify-center gap-4 mt-6 text-[10px] text-slate-500">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-500" /> Stripe seguro</span>
            <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-emerald-500" /> Liberação na hora</span>
            <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-emerald-500" /> Sem taxa extra</span>
          </div>

          <p className="text-center text-[10px] text-slate-600 mt-6">
            Pagamento processado por Stripe. Ambiente seguro e criptografado.
            Créditos liberados automaticamente após confirmação.
          </p>
        </div>
      </div>
    </div>
  )
}
