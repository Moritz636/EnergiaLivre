// ============================================================
// lib/credits-shared — Constantes e tipos compartilhados entre
// client e server. Sem imports de next/headers ou supabase.
// ============================================================

/** Tipos válidos de transação (espelha CHECK no SQL). */
export const CREDIT_TYPES = [
  'purchase',
  'commission',
  'refund',
  'admin_credit',
  'admin_debit',
  'payment',
  'transfer_in',
  'transfer_out',
  'bonus',
  'cashback',
] as const

export type CreditType = (typeof CREDIT_TYPES)[number]

export const CREDIT_STATUSES = [
  'pending',
  'completed',
  'failed',
  'cancelled',
] as const
export type CreditStatus = (typeof CREDIT_STATUSES)[number]

/** Limite máximo por compra (proteção anti-erro). */
export const MAX_PURCHASE_AMOUNT = 10000

/** Chave Pix oficial exibida na UI. */
export const PIX_KEY = '84 98758-6668'
export const PIX_KEY_RAW = '5584987858668'
export const PIX_RECEIVER = 'Energia Livre'

/** Valida se `amount` é positivo e finito. */
export function isValidAmount(amount: unknown): amount is number {
  return typeof amount === 'number' && Number.isFinite(amount) && amount > 0
}
