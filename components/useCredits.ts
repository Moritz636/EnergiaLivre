'use client'

// ============================================================
// useCredits — Hook client-side para saldo e histórico do usuário
// ============================================================

import { useCallback, useEffect, useState } from 'react'
import { getSupabase } from '@/lib/supabase/singleton'

export interface CreditTransaction {
  id: string
  amount: number
  type: string
  status: string
  description: string | null
  created_at: string
  external_reference: string | null
}

interface UseCreditsReturn {
  balance: number
  loading: boolean
  error: string | null
  transactions: CreditTransaction[]
  refresh: () => Promise<void>
  transfer: (toUserId: string, amount: number, description?: string) => Promise<void>
}

export function useCredits(userId: string | null | undefined): UseCreditsReturn {
  const supabase = getSupabase()
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState<CreditTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const [balRes, histRes] = await Promise.all([
        fetch('/api/user/credits/balance'),
        fetch('/api/user/credits/history'),
      ])
      if (!balRes.ok) throw new Error('Falha ao buscar saldo')
      if (!histRes.ok) throw new Error('Falha ao buscar histórico')
      const balJson = (await balRes.json()) as { balance: number }
      const histJson = (await histRes.json()) as { transactions: CreditTransaction[] }
      setBalance(Number(balJson.balance ?? 0))
      setTransactions(Array.isArray(histJson.transactions) ? histJson.transactions : [])
    } catch (err: any) {
      setError(err?.message ?? 'Erro ao carregar créditos')
    } finally {
      setLoading(false)
    }
  }, [userId])

  const transfer = useCallback(
    async (toUserId: string, amount: number, description?: string) => {
      const res = await fetch('/api/user/credits/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toUserId, amount, description }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(body.error ?? 'Falha ao transferir')
      }
      await refresh()
    },
    [refresh]
  )

  useEffect(() => {
    refresh()
  }, [refresh])

  // Realtime: escuta mudanças na própria user_credits (atualização do saldo)
  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel(`credits-${userId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'user_credits', filter: `user_id=eq.${userId}` },
        (payload: { new: { balance?: number } }) => {
          const next = payload.new?.balance
          if (typeof next === 'number') setBalance(Number(next))
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase])

  return { balance, loading, error, transactions, refresh, transfer }
}
