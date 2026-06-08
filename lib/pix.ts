import crypto from 'crypto'
import Stripe from 'stripe'

export type PixPurpose =
  | 'coin_purchase'
  | 'plan_subscription'
  | 'token_presale'
  | 'invoice_payment'
  | 'wallet_topup'
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

function mapStripeStatus(s: Stripe.PaymentIntent.Status): CreatedPixPayment['status'] {
  switch (s) {
    case 'succeeded': return 'paid'
    case 'processing': return 'pending'
    case 'requires_payment_method': return 'pending'
    case 'requires_action': return 'pending'
    case 'requires_confirmation': return 'pending'
    case 'requires_capture': return 'pending'
    case 'canceled': return 'cancelled'
    default: return 'pending'
  }
}

class StripePixProvider implements PixProvider {
  readonly name = 'stripe'
  private stripe: Stripe
  private initialized = false

  constructor() {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('STRIPE_SECRET_KEY não configurada')
    this.stripe = new Stripe(key, { apiVersion: '2024-06-20' })
    this.initialized = true
  }

  async createPayment(input: CreatePixInput): Promise<CreatedPixPayment> {
    const amountCents = Math.round(input.amount * 100)
    if (amountCents < 1) throw new Error('Valor mínimo: R$ 0,01')

    const pi = await this.stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'brl',
      payment_method_types: ['pix'],
      metadata: {
        userId: input.userId,
        purpose: input.purpose,
        description: input.description?.slice(0, 200) ?? '',
        ...(input.metadata as Record<string, string> ?? {}),
      },
    })

    const pix = (pi.next_action as any)?.pix
    const expiresAt = new Date((pi.created + (input.expiresInMinutes ?? 30) * 60) * 1000)

    return {
      id: pi.id,
      txid: pi.id,
      amount: input.amount,
      status: mapStripeStatus(pi.status),
      qrCode: pix?.qr_code ?? '',
      qrCodeImage: pix?.qr_code_base64 ?? '',
      pixCopyPaste: pix?.qr_code ?? '',
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date(pi.created * 1000).toISOString(),
      provider: this.name,
    }
  }

  async getPaymentStatus(txid: string): Promise<CreatedPixPayment['status']> {
    const pi = await this.stripe.paymentIntents.retrieve(txid)
    return mapStripeStatus(pi.status)
  }
}

const MERCHANT_NAME = 'ENERGIALIVRE'
const MERCHANT_CITY = 'SAO PAULO'
const PIX_KEY_FALLBACK = 'pix@energialivre.dev.br'

class MockPixProvider implements PixProvider {
  readonly name = 'mock'

  async createPayment(input: CreatePixInput): Promise<CreatedPixPayment> {
    const txid = generateTxid()
    const id = crypto.randomUUID()
    const expiresInMin = input.expiresInMinutes ?? 30
    const expiresAt = new Date(Date.now() + expiresInMin * 60_000)

    const brCode = buildBrCode({
      txid,
      amount: input.amount,
      pixKey: PIX_KEY_FALLBACK,
      merchant: MERCHANT_NAME,
      city: MERCHANT_CITY,
    })

    return {
      id,
      txid,
      amount: input.amount,
      status: 'pending',
      qrCode: brCode,
      qrCodeImage: '',
      pixCopyPaste: brCode,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString(),
      provider: this.name,
    }
  }

  async getPaymentStatus(_txid: string): Promise<CreatedPixPayment['status']> {
    return 'pending'
  }
}

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
  const gui = tlv('00', 'br.gov.bcb.pix')
  const key = tlv('01', opts.pixKey)
  const merchantAccount = tlv('26', gui + key)

  const parts = [
    tlv('00', '01'),
    tlv('01', '12'),
    merchantAccount,
    tlv('52', '0000'),
    tlv('53', '986'),
    tlv('54', opts.amount.toFixed(2)),
    tlv('58', 'BR'),
    tlv('59', opts.merchant.slice(0, 25)),
    tlv('60', opts.city.slice(0, 15)),
    tlv('62', tlv('05', opts.txid)),
  ]

  const withoutCrc = parts.join('') + '6304'
  const crc = crc16ccitt(withoutCrc).toString(16).toUpperCase().padStart(4, '0')
  return withoutCrc + crc
}

function crc16ccitt(payload: string): number {
  let crc = 0xFFFF
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) crc = ((crc << 1) ^ 0x1021) & 0xFFFF
      else crc = (crc << 1) & 0xFFFF
    }
  }
  return crc
}

let _instance: PixProvider | null = null

export function getPixProvider(): PixProvider {
  if (_instance) return _instance
  if (process.env.STRIPE_SECRET_KEY) {
    try {
      _instance = new StripePixProvider()
      return _instance
    } catch {
      console.warn('[pix] StripePixProvider falhou, usando mock')
    }
  }
  _instance = new MockPixProvider()
  return _instance
}

function generateTxid(): string {
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
