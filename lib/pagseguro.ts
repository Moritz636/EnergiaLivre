export type PagSeguroPaymentMethod = 'PIX' | 'BOLETO' | 'CREDIT_CARD'

export interface PagSeguroChargeInput {
  userId: string
  referenceId: string
  description: string
  amount: number
  paymentMethod: PagSeguroPaymentMethod
  customer: {
    name: string
    email: string
    taxId?: string
    phone?: string
  }
  installments?: number
  boletoDueDate?: string
  notificationUrl?: string
}

export interface PagSeguroChargeResult {
  id: string
  status: 'PAID' | 'WAITING' | 'CANCELLED' | 'REFUNDED' | 'DECLINED'
  paymentMethod: PagSeguroPaymentMethod
  qrCode?: string
  qrCodeImage?: string
  pixCopyPaste?: string
  boletoBarcode?: string
  boletoLink?: string
  redirectUrl?: string
  paidAt?: string
  createdAt: string
}

const PAGSEGURO_API = process.env.PAGSEGURO_SANDBOX === 'true'
  ? 'https://sandbox.api.pagseguro.com'
  : 'https://api.pagseguro.com'

let _token: string | null = null
let _tokenExpiresAt = 0

async function getToken(): Promise<string> {
  if (_token && Date.now() < _tokenExpiresAt - 60000) return _token

  const clientId = process.env.PAGSEGURO_CLIENT_ID
  const clientSecret = process.env.PAGSEGURO_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new Error('PAGSEGURO_CLIENT_ID e PAGSEGURO_CLIENT_SECRET obrigatórios')
  }

  const res = await fetch(`${PAGSEGURO_API}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`PagSeguro auth error: ${res.status} ${err}`)
  }

  const data = await res.json()
  _token = data.access_token
  _tokenExpiresAt = Date.now() + (data.expires_in ?? 3600) * 1000
  return _token!
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = await getToken()
  const res = await fetch(`${PAGSEGURO_API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`PagSeguro API error ${res.status}: ${err}`)
  }

  return res.json()
}

function mapStatus(s: string): PagSeguroChargeResult['status'] {
  switch (s) {
    case 'PAID': return 'PAID'
    case 'WAITING': return 'WAITING'
    case 'CANCELLED': return 'CANCELLED'
    case 'REFUNDED': return 'REFUNDED'
    case 'DECLINED': return 'DECLINED'
    default: return 'WAITING'
  }
}

export async function createPagSeguroCharge(
  input: PagSeguroChargeInput,
): Promise<PagSeguroChargeResult> {
  const amountCents = Math.round(input.amount * 100)

  const body: Record<string, any> = {
    reference_id: input.referenceId,
    description: input.description,
    amount: {
      value: amountCents,
      currency: 'BRL',
    },
    payment_method: {
      type: input.paymentMethod,
    },
    customer: {
      name: input.customer.name,
      email: input.customer.email,
      tax_id: input.customer.taxId ?? '',
      phones: input.customer.phone
        ? [{ type: 'MOBILE', country: 55, area: input.customer.phone.slice(0, 2), number: input.customer.phone.slice(2) }]
        : [],
    },
    notification_urls: input.notificationUrl
      ? [input.notificationUrl]
      : [`${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://energialivre.dev.br'}/api/pagseguro/webhook`],
  }

  if (input.paymentMethod === 'PIX') {
    body.payment_method.pix = {
      expiration_in_seconds: 3600,
    }
  }

  if (input.paymentMethod === 'BOLETO') {
    body.payment_method.boleto = {
      due_date: input.boletoDueDate ?? new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      holder: { name: input.customer.name },
    }
  }

  if (input.paymentMethod === 'CREDIT_CARD') {
    body.payment_method.installments = input.installments ?? 1
    body.payment_method.capture = true
  }

  const data: any = await request('POST', '/charges', body)

  const charge = data?.charges?.[0] ?? data ?? {}

  let qrCode: string | undefined
  let qrCodeImage: string | undefined
  let pixCopyPaste: string | undefined
  let link: string | undefined

  if (input.paymentMethod === 'PIX' && charge.payment_method?.pix) {
    qrCodeImage = charge.payment_method.pix.qr_code_base64
    qrCode = charge.payment_method.pix.qr_code
    pixCopyPaste = charge.payment_method.pix.qr_code
  }

  if (charge.payment_method?.boleto?.barcode) {
    link = charge.payment_method.boleto?.link ?? undefined
  }

  if (input.paymentMethod === 'CREDIT_CARD' && charge.links) {
    const l = charge.links.find((x: any) => x.rel === 'PAY' || x.media === 'application/json')
    if (l) link = l.href
  }

  return {
    id: charge.id ?? charge.reference_id ?? input.referenceId,
    status: mapStatus(charge.status),
    paymentMethod: input.paymentMethod,
    qrCode,
    qrCodeImage,
    pixCopyPaste,
    boletoBarcode: charge.payment_method?.boleto?.barcode ?? undefined,
    boletoLink: link,
    redirectUrl: link,
    paidAt: charge.paid_at ?? undefined,
    createdAt: charge.created_at ?? new Date().toISOString(),
  }
}

export async function getPagSeguroChargeStatus(
  chargeId: string,
): Promise<PagSeguroChargeResult['status']> {
  const data: any = await request('GET', `/charges/${chargeId}`)
  return mapStatus(data?.status ?? 'WAITING')
}

export async function cancelPagSeguroCharge(chargeId: string): Promise<void> {
  await request('POST', `/charges/${chargeId}/cancel`, {})
}

async function registerWebhook(url: string): Promise<void> {
  const webhookUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://energialivre.dev.br'}${url}`
  try {
    await request('POST', '/webhooks', {
      url: webhookUrl,
      notification_type: 'TRANSACTION',
    })
  } catch {
    // webhook may already be registered
  }
}

export async function initPagSeguro(
  options?: { webhookPath?: string },
): Promise<void> {
  if (options?.webhookPath) {
    await registerWebhook(options.webhookPath)
  }
}

export function verifyPagSeguroWebhook(
  body: unknown,
  signature?: string,
): { valid: boolean; event?: string; chargeId?: string } {
  const payload = body as Record<string, any>
  return {
    valid: true,
    event: payload?.event ?? payload?.notification_type,
    chargeId: payload?.charge?.id ?? payload?.resource?.charge?.id,
  }
}