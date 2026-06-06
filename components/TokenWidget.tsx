'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Coins, ArrowRight, Loader2, Sparkles, Flame, TrendingUp } from 'lucide-react';
import { KWATT_SYMBOL, KWATT_UNIT_PRICE } from '@/lib/tokenomics';

interface Holding {
  balance: number
  balance_locked: number
  balance_available: number
  lifetime_earned: number
  lifetime_burned: number
  wallet_address: string | null
}

interface TokenWidgetProps {
  compact?: boolean
}

/**
 * Widget read-only usado no dashboard-consumidor e dashboard-gerador.
 * Mostra saldo + CTA para a pagina completa /dashboard/token.
 */
export default function TokenWidget({ compact = false }: TokenWidgetProps) {
  const [holding, setHolding] = useState<Holding | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch('/api/token/balance', { cache: 'no-store' })
        if (!res.ok) {
          if (!cancelled) setLoading(false)
          return
        }
        const body = await res.json()
        if (!cancelled) {
          setHolding(body.holding)
          setLoading(false)
        }
      } catch {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center h-24">
        <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
      </div>
    )
  }

  if (!holding) {
    return null
  }

  const balance = holding.balance_available ?? 0
  const lifetimeEarned = holding.lifetime_earned ?? 0
  const brlValue = balance * KWATT_UNIT_PRICE

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border border-amber-500/30">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <p className="text-[10px] text-amber-300 uppercase font-black tracking-wider">Carteira KWATT</p>
            <p className="text-sm font-bold text-white">
              {balance.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} {KWATT_SYMBOL}
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/token"
          className="text-[10px] text-amber-300 hover:text-amber-200 flex items-center gap-1 font-bold"
        >
          Ver tudo <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {!compact && (
        <div className="mt-2 space-y-1 text-[11px] text-amber-200/80">
          <p className="flex items-center justify-between">
            <span>Valor estimado</span>
            <span className="text-white font-bold">R$ {brlValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </p>
          {lifetimeEarned > 0 && (
            <p className="flex items-center justify-between">
              <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Total acumulado</span>
              <span className="text-emerald-300 font-bold">+{lifetimeEarned.toLocaleString('pt-BR')}</span>
            </p>
          )}
          {!holding.wallet_address && (
            <p className="text-amber-300/70 text-[10px] mt-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Adicione sua carteira EVM para receber o airdrop
            </p>
          )}
        </div>
      )}
    </div>
  )
}
