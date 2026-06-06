import { NextRequest, NextResponse } from 'next/server'
import { v } from '@/lib/validation'
import { createClient } from '@/lib/supabase/server'
import { getPixProvider, validatePixAmount, type PixPurpose } from '@/lib/pix'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const ALLOWED_PURPOSES: PixPurpose[] = [
  'coin_purchase',
  'plan_subscription',
  'token_presale',
  'invoice_payment',
  'celular_recharge',
  'other',
]

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const json = await request.json().catch(() => ({}))
    const parsed = v.object(json, {
      amount: (i) => v.number(i, { positive: true }),
      description: v.optional((i) => v.string(i, { max: 200 })),
      purpose: (i) => v.enum(i, ALLOWED_PURPOSES),
      metadata: v.optional((i) => (typeof i === 'object' && i !== null ? { success: true as const, data: i as Record<string, any> } : { success: false as const, error: 'esperado objeto' })),
      expiresInMinutes: v.optional((i) => v.number(i, { int: true, min: 5, max: 1440 })),
    })
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }
    const data = parsed.data

    const amountCheck = validatePixAmount(data.amount)
    if (!amountCheck.valid) {
      return NextResponse.json({ error: amountCheck.reason }, { status: 400 })
    }

    const provider = getPixProvider()
    const pix = await provider.createPayment({
      userId: user.id,
      amount: data.amount,
      description: data.description,
      purpose: data.purpose,
      metadata: data.metadata,
      expiresInMinutes: data.expiresInMinutes ?? 30,
    })

    const insert = {
      id: pix.id,
      user_id: user.id,
      amount: pix.amount,
      description: data.description ?? null,
      purpose: data.purpose,
      status: pix.status,
      txid: pix.txid,
      qr_code: pix.qrCode,
      qr_code_image: pix.qrCodeImage || null,
      pix_copy_paste: pix.pixCopyPaste,
      expires_at: pix.expiresAt,
      provider: pix.provider,
      provider_payload: pix as any,
      metadata: data.metadata ?? {},
    }

    const { error } = await (supabase.from('pix_payments').insert(insert as any) as any)
    if (error) {
      console.error('[pix/create] insert error:', error)
      return NextResponse.json({ error: 'Erro ao salvar pagamento' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: pix.id,
        txid: pix.txid,
        amount: pix.amount,
        status: pix.status,
        qrCode: pix.qrCode,
        pixCopyPaste: pix.pixCopyPaste,
        expiresAt: pix.expiresAt,
        createdAt: pix.createdAt,
        provider: pix.provider,
      },
    })
  } catch (err: any) {
    console.error('[pix/create] exception:', err)
    return NextResponse.json({ error: err?.message ?? 'Erro interno' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Use POST para criar pagamento' }, { status: 405 })
}
