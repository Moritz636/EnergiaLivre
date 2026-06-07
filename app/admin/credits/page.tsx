'use client'

// ============================================================
// /admin/credits — Painel admin para gerenciar créditos
// ============================================================

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '@/lib/supabase/singleton'
import { useAdminAuth } from '@/app/hooks/useAuth'
import { Nav } from './_components/Nav'
import { SummaryStats, Summary } from './_components/SummaryStats'
import { BalancesTable, UserBalanceRow } from './_components/BalancesTable'
import { CreditModal } from './_components/CreditModal'
import {
  TransactionsFeed,
  TransactionRow,
} from './_components/TransactionsFeed'
import { LoadingState } from './_components/LoadingState'

type ActionType = 'credit' | 'debit'

export default function AdminCreditsPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading, isAdmin, logout } = useAdminAuth()
  const supabase = getSupabase()

  const [balances, setBalances] = useState<UserBalanceRow[]>([])
  const [transactions, setTransactions] = useState<TransactionRow[]>([])
  const [pendingCount, setPendingCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending'>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalAction, setModalAction] = useState<ActionType>('credit')
  const [modalTarget, setModalTarget] = useState<{
    userId: string
    userName: string
  } | null>(null)

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [{ data: balanceData, error: bErr }, { data: txData, error: tErr }, { count: pendCount }] =
        await Promise.all([
          supabase
            .from('user_credits')
            .select(
              `user_id, balance, updated_at,
               profiles:user_id ( id, nome, email, tipo, role )`
            )
            .order('balance', { ascending: false })
            .limit(200),
          supabase
            .from('credit_transactions')
            .select(
              `id, amount, type, status, description, created_at, user_id,
               profiles:user_id ( nome, email )`
            )
            .order('created_at', { ascending: false })
            .limit(80),
          supabase
            .from('credit_transactions')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'pending'),
        ])

      if (bErr) throw bErr
      if (tErr) throw tErr

      setBalances((balanceData as unknown as UserBalanceRow[]) ?? [])
      setTransactions((txData as unknown as TransactionRow[]) ?? [])
      setPendingCount(pendCount ?? 0)
    } catch (err: any) {
      setError(err?.message ?? 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (!authLoading && user && !isAdmin) {
      router.push('/dashboard-consumidor')
    }
  }, [authLoading, user, isAdmin, router])

  useEffect(() => {
    if (isAdmin) loadAll()
  }, [isAdmin, loadAll])

  const summary: Summary = (() => {
    const totalBalance = balances.reduce(
      (acc, r) => acc + Number(r.balance ?? 0),
      0
    )
    const lastActivityAt = transactions[0]?.created_at ?? null
    return {
      totalUsers: balances.filter((r) => Number(r.balance) > 0).length,
      totalBalance,
      totalTransactions: transactions.length,
      lastActivityAt,
      pendingRequests: pendingCount,
    }
  })()

  const openAction = (userId: string, userName: string, type: ActionType) => {
    setModalTarget({ userId, userName })
    setModalAction(type)
    setModalOpen(true)
  }

  const handleSubmit = async (params: {
    userId: string
    amount: number
    type: string
    description: string
  }) => {
    setError(null)
    const res = await fetch('/api/admin/credits/credit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string }
      throw new Error(body.error ?? 'Falha ao processar')
    }
    const isCredit = params.amount > 0
    setSuccess(
      isCredit
        ? `+R$ ${Math.abs(params.amount).toFixed(2)} creditado a ${modalTarget?.userName}`
        : `-R$ ${Math.abs(params.amount).toFixed(2)} debitado de ${modalTarget?.userName}`
    )
    setTimeout(() => setSuccess(null), 4000)
    await loadAll()
  }

  if (authLoading || loading || !isAdmin) {
    return <LoadingState />
  }

  const currentTargetBalance =
    balances.find((r) => r.user_id === modalTarget?.userId)?.balance ?? 0

  return (
    <div className="min-h-screen bg-[#020617] text-white pt-16">
      <Nav userName={profile?.nome ?? user?.email} onLogout={logout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Painel de <span className="text-emerald-400">Créditos</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Gerencie saldos e transações dos usuários da plataforma
          </p>
        </header>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-300">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-300">
            {success}
          </div>
        )}

        <SummaryStats summary={summary} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BalancesTable
              rows={balances}
              loading={loading}
              onAction={openAction}
            />
          </div>
          <div>
            <TransactionsFeed
              transactions={transactions}
              loading={loading}
              filter={filter}
              onFilterChange={setFilter}
            />
          </div>
        </div>
      </main>

      <CreditModal
        open={modalOpen}
        userId={modalTarget?.userId ?? null}
        userName={modalTarget?.userName ?? ''}
        currentBalance={currentTargetBalance}
        action={modalAction}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
