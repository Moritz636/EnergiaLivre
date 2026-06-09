'use client';
import Link from 'next/link';
import { Crown, Lock, Sparkles, ArrowRight, CheckCircle2, Zap, Users, MapPin } from 'lucide-react';

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
        {expired ? 'Seu acesso expirou' : 'Você está quase lá.'}
      </h2>
      <p className="text-slate-400 mb-2 max-w-md mx-auto">
        {expired
          ? 'Sem o Member Plus, o match fica travado. Renove e volte a conectar.'
          : 'Enquanto outros ficam de fora, você pode ativar o match agora e começar a economizar.'}
      </p>
      <p className="text-[11px] text-slate-500 mb-6 max-w-sm mx-auto">
        Aqueles que ativaram antes já estão conectados com geradores na sua região. 
        Cada dia sem acesso é um dia a mais pagando tarifa cheia.
      </p>

      {daysRemaining > 0 && !expired && (
        <p className="text-sm text-slate-300 mb-4">
          Seu acesso ainda tem <strong className="text-emerald-400">{daysRemaining} dias</strong>.
        </p>
      )}

      <div className="bg-black/30 rounded-xl p-4 mb-6 max-w-sm mx-auto">
        <p className="text-[10px] text-yellow-400/80 uppercase tracking-wider font-bold mb-3">O que você libera:</p>
        <ul className="space-y-2.5 text-left">
          {[
            { icon: MapPin, text: 'Mapa interativo com geradores da sua região' },
            { icon: Zap, text: 'Match com 1 toque — curta e conecte' },
            { icon: Users, text: 'Chat direto para negociar sem intermediário' },
          ].map((b) => (
            <li key={b.text} className="flex items-center gap-2.5 text-slate-300 text-sm">
              <b.icon className="w-4 h-4 text-yellow-400 shrink-0" />
              {b.text}
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-4">
        <p className="text-3xl font-black text-white">
          R$ 9,90<span className="text-sm font-normal text-slate-400">/mês</span>
        </p>
        <p className="text-[10px] text-slate-500">Menos que um café por dia. Economia real na sua fatura.</p>
      </div>

      <Link
        href="/checkout-member-plus"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-900 font-bold hover:from-yellow-400 hover:to-amber-400 transition-all shadow-lg shadow-yellow-500/30"
      >
        {expired ? (
          <>
            <Sparkles className="w-5 h-5" /> Renovar agora
          </>
        ) : (
          <>
            <Crown className="w-5 h-5" /> Ativar Member Plus
          </>
        )}
        <ArrowRight className="w-4 h-4" />
      </Link>

      <p className="text-[9px] text-slate-600 mt-4">
        Cancele quando quiser. Sem multa, sem burocracia.
      </p>
    </div>
  )
}
