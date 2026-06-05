import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

type AnySupabase = SupabaseClient<Database, any, any>

export interface CouponRecord {
  id: string
  code: string
  created_by: string
  used_by: string | null
  used_at: string | null
  bonus_coins: number
  inviter_bonus_coins: number
  expires_at: string | null
  created_at: string
}

export interface CouponWithStatus extends CouponRecord {
  is_used: boolean
  is_mine: boolean
}

export async function listMyCoupons(
  supabase: AnySupabase,
  userId: string,
): Promise<CouponWithStatus[]> {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('created_by', userId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return ((data ?? []) as CouponRecord[]).map((c) => ({
    ...c,
    is_used: c.used_by !== null,
    is_mine: c.created_by === userId,
  }))
}

export interface RedeemResult {
  success: boolean
  message: string
  bonus_credited: number
  inviter_bonus_credited: number
  inviter_id: string | null
}

export async function redeemCoupon(
  supabase: AnySupabase,
  code: string,
  userId: string,
): Promise<RedeemResult> {
  const { data, error } = await (supabase.rpc as any)('redeem_coupon', {
    p_code: code,
    p_user_id: userId,
  })

  if (error) {
    return {
      success: false,
      message: error.message ?? 'Erro ao resgatar cupom',
      bonus_credited: 0,
      inviter_bonus_credited: 0,
      inviter_id: null,
    }
  }

  const result = (data as any[])?.[0] ?? data
  if (!result) {
    return {
      success: false,
      message: 'Resposta invalida do servidor',
      bonus_credited: 0,
      inviter_bonus_credited: 0,
      inviter_id: null,
    }
  }

  return {
    success: !!result.success,
    message: result.message ?? '',
    bonus_credited: result.bonus_credited ?? 0,
    inviter_bonus_credited: result.inviter_bonus_credited ?? 0,
    inviter_id: result.inviter_id ?? null,
  }
}

export async function getMyReferralCode(
  supabase: AnySupabase,
  userId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('referral_code')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  return (data as any)?.referral_code ?? null
}

export function buildShareLink(code: string, origin?: string): string {
  const base = origin ?? (typeof window !== 'undefined' ? window.location.origin : 'https://energialivre.com.br')
  return `${base}/cadastro?ref=${encodeURIComponent(code)}`
}

export function buildWhatsAppShareText(code: string, shareLink: string): string {
  return `Oi! Estou usando a EnergiaLivre para economizar na conta de luz. Use meu cupom *${code}* e ganhe 20 moedas pra começar. Cadastre-se aqui: ${shareLink}`
}
