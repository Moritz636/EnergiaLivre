// ============================================================
// lib/credits — Helpers puros server-side para sistema de
// créditos (Fase 1 — manual via admin).
// Constantes compartilhadas: ver ./credits-shared
// ============================================================

import { createClient } from '@/lib/supabase/server'

export {
  CREDIT_TYPES,
  CREDIT_STATUSES,
  PIX_KEY,
  PIX_KEY_RAW,
  PIX_RECEIVER,
  MAX_PURCHASE_AMOUNT,
  isValidAmount,
} from './credits-shared'

export type { CreditType, CreditStatus } from './credits-shared'

/** Confirma se o user atual é admin (role='admin'). */
export async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { supabase, user: null, isAdmin: false }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, tipo, nome, email')
    .eq('id', user.id)
    .single()

  const isAdmin = (profile as any)?.role === 'admin'
  return { supabase, user, profile, isAdmin }
}

/** Retorna o saldo do usuário (0 se sem registro). */
export async function fetchUserBalance(userId: string): Promise<number> {
  const supabase = await createClient()
  const { data, error } = await (supabase as any).rpc('get_user_balance', {
    p_user_id: userId,
  })
  if (error) {
    console.error('[credits] get_user_balance error:', error)
    return 0
  }
  return Number(data ?? 0)
}

export interface CreditTransactionRow {
  id: string
  amount: number
  type: string
  status: string
  description: string | null
  admin_id: string | null
  counterparty_user_id: string | null
  external_reference: string | null
  created_at: string
}

/** Lista as últimas N transações de um usuário. */
export async function fetchUserHistory(
  userId: string,
  limit = 50,
): Promise<CreditTransactionRow[]> {
  const supabase = await createClient()
  const { data, error } = await (supabase as any)
    .from('credit_transactions')
    .select(
      'id, amount, type, status, description, admin_id, counterparty_user_id, external_reference, created_at',
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[credits] fetchUserHistory error:', error)
    return []
  }
  return (data ?? []) as CreditTransactionRow[]
}

/** Lista os saldos de todos os usuários (admin). */
export async function fetchAllUserBalances(limit = 200) {
  const supabase = await createClient()
  const { data, error } = await (supabase as any)
    .from('user_credits')
    .select('user_id, balance, updated_at, profiles:profiles!inner(id, nome, email, tipo, role)')
    .order('updated_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[credits] fetchAllUserBalances error:', error)
    return []
  }
  return data ?? []
}

/** Lista todas as transações (admin) com filtro opcional. */
export async function fetchAllTransactions(
  limit = 100,
  type?: string,
): Promise<Array<CreditTransactionRow & { user_name?: string }>> {
  const supabase = await createClient()
  let query = (supabase as any)
    .from('credit_transactions')
    .select(
      'id, amount, type, status, description, admin_id, counterparty_user_id, external_reference, created_at, profiles:profiles!credit_transactions_user_id_fkey(nome, email)',
    )
    .order('created_at', { ascending: false })
    .limit(limit)
  if (type) query = query.eq('type', type)

  const { data, error } = await query
  if (error) {
    console.error('[credits] fetchAllTransactions error:', error)
    return []
  }
  return (data ?? []) as any
}
