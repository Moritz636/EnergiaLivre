// ============================================
// PIX - ABSTRAÇÃO DE PROVEDOR (MOCK IMPLEMENTATION)
// ============================================
// Esta é uma abstração plugável. Em produção, substituir
// o provedor 'mock' por uma integração real (OpenPix, Mercado Pago,
// Pagar.me, Gerencianet, etc).
//
// O mock gera txid, qr code e copia-cola no padrão BR Code
// para que o frontend funcione end-to-end durante o desenvolvimento.
// ============================================

import crypto from 'crypto'

export type PixPurpose =
  | 'coin_purchase'
  | 'plan_subscription'
  | 'token_presale'
  | 'invoice_payment'
  | 'other'

export interface CreatePixInput {
  userId: string
  amount: number
  description?: string
  purpose: PixPurpose
  metadata?: Record<string, unknown>
  expiresInMinutes?: number
}

export interface CreatedPixPayment {
  id: string
  txid: string
  amount: number
  status: 'pending' | 'paid' | 'expired' | 'cancelled' | 'refunded' | 'failed'
  qrCode: string
  qrCodeImage: string
  pixCopyPaste: string
  expiresAt: string
  createdAt: string
  provider: string
}

export interface PixProvider {
  createPayment(input: CreatePixInput): Promise<CreatedPixPayment>
  getPaymentStatus(txid: string): Promise<'pending' | 'paid' | 'expired' | 'cancelled' | 'refunded' | 'failed'>
}

// ============================================
// MOCK PROVIDER
// ============================================

const MERCHANT_NAME = 'ENERGIALIVRE'
const MERCHANT_CITY = 'SAO PAULO'
const PIX_KEY = 'pix@energialivre.dev.br'

class MockPixProvider implements PixProvider {
  readonly name = 'mock'

  async createPayment(input: CreatePixInput): Promise<CreatedPixPayment> {
    const txid = generateTxid()
    const id = crypto.randomUUID()
    const expiresInMin = input.expiresInMinutes ?? 30
    const expiresAt = new Date(Date.now() + expiresInMin * 60_000)

    // BR Code (EMV) TLV-encoded
    const brCode = buildBrCode({
      txid,
      amount: input.amount,
      pixKey: PIX_KEY,
      merchant: MERCHANT_NAME,
      city: MERCHANT_CITY,
    })

    return {
      id,
      txid,
      amount: input.amount,
      status: 'pending',
      qrCode: brCode,
      qrCodeImage: '', // preenchido pelo cliente (qrcode.react) se quiser
      pixCopyPaste: brCode,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString(),
      provider: this.name,
    }
  }

  async getPaymentStatus(_txid: string): Promise<'pending' | 'paid' | 'expired' | 'cancelled' | 'refunded' | 'failed'> {
    // No mock, o pagamento é confirmado via webhook simulado
    return 'pending'
  }
}

// ============================================
// BR Code Builder (EMV TLV)
// ============================================

function tlv(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0')
  return `${id}${len}${value}`
}

function buildBrCode(opts: {
  txid: string
  amount: number
  pixKey: string
  merchant: string
  city: string
}): string {
  // GUI (Merchant Account Information) - ID 26
  const gui = tlv('00', 'br.gov.bcb.pix')
  const key = tlv('01', opts.pixKey)
  const merchantAccount = tlv('26', gui + key)

  const parts = [
    tlv('00', '01'), // Payload Format Indicator
    tlv('01', '11'), // Point of Initiation Method (11 = static, 12 = dynamic; usamos 12)
    merchantAccount,
    tlv('52', '0000'), // Merchant Category Code
    tlv('53', '986'), // BRL
    tlv('54', opts.amount.toFixed(2)), // Transaction Amount
    tlv('58', 'BR'), // Country Code
    tlv('59', opts.merchant.slice(0, 25)),
    tlv('60', opts.city.slice(0, 15)),
    tlv('62', tlv('05', opts.txid)), // Additional Data Field (txid)
  ]

  const withoutCrc = parts.join('') + '6304'
  const crc = crc16ccitt(withoutCrc).toString(16).toUpperCase().padStart(4, '0')
  return withoutCrc + crc
}

function crc16ccitt(payload: string): number {
  // CRC-16/CCITT-FALSE (polinômio 0x1021, init 0xFFFF)
  let crc = 0xFFFF
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = ((crc << 1) ^ 0x1021) & 0xFFFF
      } else {
        crc = (crc << 1) & 0xFFFF
      }
    }
  }
  return crc
}

// ============================================
// FACTORY
// ============================================

let _instance: PixProvider | null = null

export function getPixProvider(): PixProvider {
  if (_instance) return _instance
  // Para trocar de provedor: detectar env var e instanciar classe real
  if (process.env.OPENPIX_APP_ID && process.env.OPENPIX_API_URL) {
    // import('pix/openpix').then(...) — implementação futura
    // Por enquanto, fallback para mock
  }
  _instance = new MockPixProvider()
  return _instance
}

// ============================================
// HELPERS
// ============================================

function generateTxid(): string {
  // Txid BR Code: 26-35 caracteres alfanuméricos, sem espaços
  // Geramos 32 chars hex
  return crypto.randomBytes(16).toString('hex').toUpperCase()
}

export function validatePixAmount(amount: number): { valid: boolean; reason?: string } {
  if (!Number.isFinite(amount) || amount <= 0) {
    return { valid: false, reason: 'Valor inválido' }
  }
  if (amount < 0.01) {
    return { valid: false, reason: 'Valor mínimo: R$ 0,01' }
  }
  if (amount > 1_000_000) {
    return { valid: false, reason: 'Valor máximo: R$ 1.000.000' }
  }
  return { valid: true }
}
