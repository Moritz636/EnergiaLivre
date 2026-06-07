'use client'

// ============================================================
// AccessGateCard — CTA persuasivo R$ 9,99 para liberar
// acesso ao /match completo. Usado em /match quando o
// usuario NAO tem member_plus.
// ============================================================

import { useState } from 'react'
import { Lock, Zap, Shield, Clock, Sparkles, Check, Loader2 } from 'lucide-react'
import { useAuth } from '@/app/hooks/useAuth'

interface AccessGateCardProps {
  email?: string
  onCheckout: (params: { email: string; usinaId?: string }) => Promise<string>
  selectedUsinaId?: string
}

const BENEFITS = [
  'Mapa interativo com todas as usinas compativeis',
  'Comparador detalhado de preco, distancia e economia',
  'Relatorios de economia projetada em 12/24/36 meses',
  'Suporte prioritario via WhatsApp',
  'Acesso por 30 dias — cancele quando quiser',
]

export function AccessGateCard({ email, onCheckout, selectedUsinaId }: AccessGateCardProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [localEmail, setLocalEmail] = useState(email ?? user?.email ?? '')

  const handleCheckout = async () => {
    setError('')
    const targetEmail = user?.email || localEmail
    if (!targetEmail) {
      setError('Informe seu e-mail para continuar')
      return
    }
    setLoading(true)
    try {
      const url = await onCheckout({ email: targetEmail, usinaId: selectedUsinaId })
      if (url) window.location.href = url
    } catch (err: any) {
      setError(err?.message ?? 'Erro ao iniciar checkout')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-500/15 via-yellow-500/10 to-cyan-500/15 border border-emerald-500/30 shadow-2xl overflow-hidden">
      <div
        className="absolute -top-20 -right-20 w-60 h-60 bg-emerald-500/20 rounded-full blur-[80px]"
        aria-hidden
      />
      <div
        className="absolute -bottom-20 -left-20 w-60 h-60 bg-yellow-500/15 rounded-full blur-[80px]"
        aria-hidden
      />

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
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-emerald-400" /> Garantia 7 dias
          </span>
          <span className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-cyan-400" /> Stripe Verified
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-yellow-400" /> Acesso 30 dias
          </span>
        </div>

        {!user && (
          <div className="mt-5">
            <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1.5">
              Seu e-mail
            </label>
            <input
              type="email"
              required
              value={localEmail}
              onChange={(e) => setLocalEmail(e.target.value)}
              placeholder="voce@exemplo.com"
              className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 outline-none"
            />
          </div>
        )}

        {error && (
          <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300">
            {error}
          </div>
        )}

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="mt-5 w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black text-base transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Redirecionando...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" /> Desbloquear Match Completo
            </>
          )}
        </button>

        <p className="mt-3 text-center text-[10px] text-slate-500">
          Pagamento processado por Stripe. Cancele a qualquer momento.
        </p>
      </div>
    </div>
  )
}
