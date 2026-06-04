'use client';
import Link from 'next/link';
import { Crown, Lock, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

type Props = {
  daysRemaining?: number
  expired?: boolean
  onRefresh?: () => void
}

export default function MemberPlusBlocker({ daysRemaining = 0, expired = false }: Props) {
  return (
    <div className="p-8 rounded-2xl bg-gradient-to-br from-yellow-500/10 via-amber-500/5 to-yellow-500/10 border-2 border-yellow-500/30 text-center shadow-[0_0_50px_rgba(234,179,8,0.15)]">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-500 mb-4 shadow-lg shadow-yellow-500/30">
        <Lock className="w-8 h-8 text-slate-900" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">
        {expired ? 'Renove seu Member Plus' : 'Match é exclusivo para Member Plus'}
      </h2>
      <p className="text-slate-400 mb-6 max-w-md mx-auto">
        Acesse o mapa interativo de geradores e envie propostas ilimitadas por apenas{' '}
        <strong className="text-yellow-400">R$ 9,99/mês</strong>.
      </p>

      {daysRemaining > 0 && !expired && (
        <p className="text-sm text-slate-300 mb-4">
          Você tem <strong className="text-emerald-400">{daysRemaining} dias</strong> restantes.
        </p>
      )}

      <ul className="space-y-2 mb-8 text-left max-w-sm mx-auto">
        {[
          'Mapa interativo com geradores próximos',
          'Match com 1 clique (curta perfis)',
          'Chat integrado para negociar',
        ].map((b) => (
          <li key={b} className="flex items-center gap-2 text-slate-300 text-sm">
            <CheckCircle2 className="w-4 h-4 text-yellow-400 shrink-0" />
            {b}
          </li>
        ))}
      </ul>

      <Link
        href="/checkout-member-plus"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-900 font-bold hover:from-yellow-400 hover:to-amber-400 transition-all shadow-lg shadow-yellow-500/30"
      >
        {expired ? (
          <>
            <Sparkles className="w-5 h-5" /> Renovar Member Plus
          </>
        ) : (
          <>
            <Crown className="w-5 h-5" /> Ativar Member Plus
          </>
        )}
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  )
}
