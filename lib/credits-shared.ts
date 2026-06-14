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

// ============================================================
// Chaves Pix carregadas de variáveis de ambiente.
// Defina NEXT_PUBLIC_PIX_KEY, NEXT_PIX_KEY_RAW e NEXT_PIX_RECEIVER
// no .env.local para sobrescrever os fallbacks abaixo.
// ============================================================

function env(key: string, fallback: string): string {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key]!
  }
  return fallback
}

export const PIX_KEY = env('NEXT_PUBLIC_PIX_KEY', '84 98758-6668')
export const PIX_KEY_RAW = env('NEXT_PUBLIC_PIX_KEY_RAW', '5584987858668')
export const PIX_RECEIVER = env('NEXT_PUBLIC_PIX_RECEIVER', 'Energia Livre')

/** Valida se `amount` é positivo e finito. */
export function isValidAmount(amount: unknown): amount is number {
  return typeof amount === 'number' && Number.isFinite(amount) && amount > 0
}
