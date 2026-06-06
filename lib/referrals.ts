// ============================================
// REFERRALS - Sistema de indicação
// ============================================
// Já existe a tabela `referrals` no schema-improvements.sql.
// Esta lib adiciona:
//   - Helpers para gerar URL de indicação
//   - Validação de código
//   - Cálculo de reward
// ============================================

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

const REFERRAL_REWARD_KWATT = 5
const REFERRAL_REWARD_COINS = 50

export interface ReferralInfo {
  code: string
  url: string
  totalReferred: number
  totalConverted: number
  pendingReward: number
}

export async function getMyReferralCode(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from('profiles')
    .select('referral_code')
    .eq('id', userId)
    .maybeSingle()
  return (data as { referral_code?: string | null } | null)?.referral_code ?? null
}

export async function getReferralStats(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ total: number; converted: number; pending: number }> {
  const { data } = await (supabase
    .from('referrals')
    .select('status, commission_paid')
    .eq('referrer_id', userId) as any)
  const rows = (data ?? []) as Array<{ status: string; commission_paid: boolean }>
  return {
    total: rows.length,
    converted: rows.filter((r) => r.status === 'convertido').length,
    pending: rows.filter((r) => r.status === 'pendente').length,
  }
}

export function buildReferralUrl(baseUrl: string, code: string): string {
  return `${baseUrl.replace(/\/$/, '')}/cadastro?ref=${encodeURIComponent(code)}`
}

export function extractReferralFromUrl(searchParams: URLSearchParams | string | null): string | null {
  if (!searchParams) return null
  const params = searchParams instanceof URLSearchParams
    ? searchParams
    : new URLSearchParams(searchParams)
  return params.get('ref')?.trim() || null
}

export interface ReferralReward {
  kwatt: number
  coins: number
  description: string
}

export function getReferralReward(): ReferralReward {
  return {
    kwatt: REFERRAL_REWARD_KWATT,
    coins: REFERRAL_REWARD_COINS,
    description: `${REFERRAL_REWARD_KWATT} KWATT + ${REFERRAL_REWARD_COINS} moedas internas`,
  }
}
