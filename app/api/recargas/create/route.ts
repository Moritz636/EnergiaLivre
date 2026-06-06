import { NextRequest, NextResponse } from 'next/server'
import { v } from '@/lib/validation'
import { createClient } from '@/lib/supabase/server'
import { getPixProvider, validatePixAmount } from '@/lib/pix'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const OPERADORAS_VALIDAS = [
  'vivo', 'claro', 'tim', 'oi', 'nextel', 'algar', 'sercomtel', 'correios_celular',
] as const

type Operadora = typeof OPERADORAS_VALIDAS[number]

/**
 * POST /api/recargas/create
 *
 * Cria uma recarga de celular. Gera um pagamento PIX que será usado
 * para acionar o provedor de recarga (mock por enquanto).
 *
 * Body:
 *   - numero: string (DDD + número, 10-11 dígitos)
 *   - operadora: 'vivo' | 'claro' | 'tim' | 'oi' | ...
 *   - valor: number (R$ 10 a R$ 200)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const json = await request.json().catch(() => ({}))
    const parsed = v.object(json, {
      numero: (i) => v.string(i, { min: 10, max: 13, regex: /^\d+$/ }),
      operadora: (i) => v.enum(i, OPERADORAS_VALIDAS),
      valor: (i) => v.number(i, { positive: true, min: 10, max: 200 }),
    })
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }
    const data = parsed.data

    const amountCheck = validatePixAmount(data.valor)
    if (!amountCheck.valid) {
      return NextResponse.json({ error: amountCheck.reason }, { status: 400 })
    }

    // Cria o registro de recarga
    const { data: recarga, error: recError } = await (supabase
      .from('celular_recargas')
      .insert({
        user_id: user.id,
        numero: data.numero,
        operadora: data.operadora,
        valor: data.valor,
        status: 'pending',
      } as any)
      .select('id')
      .single() as any)

    if (recError) {
      console.error('[recargas/create] insert error:', recError)
      return NextResponse.json({ error: 'Erro ao criar recarga' }, { status: 500 })
    }

    // Cria o pagamento PIX
    const provider = getPixProvider()
    const pix = await provider.createPayment({
      userId: user.id,
      amount: data.valor,
      description: `Recarga ${data.operadora.toUpperCase()} - ${data.numero}`,
      purpose: 'celular_recharge',
      metadata: { recarga_id: recarga.id, operadora: data.operadora, numero: data.numero },
      expiresInMinutes: 30,
    })

    const { error: pixError } = await (supabase.from('pix_payments').insert({
      id: pix.id,
      user_id: user.id,
      amount: pix.amount,
      description: `Recarga ${data.operadora.toUpperCase()} - ${data.numero}`,
      purpose: 'celular_recharge',
      status: pix.status,
      txid: pix.txid,
      qr_code: pix.qrCode,
      qr_code_image: pix.qrCodeImage || null,
      pix_copy_paste: pix.pixCopyPaste,
      expires_at: pix.expiresAt,
      provider: pix.provider,
      provider_payload: pix as any,
      metadata: { recarga_id: recarga.id },
    } as any) as any)

    if (pixError) {
      console.error('[recargas/create] pix insert error:', pixError)
      return NextResponse.json({ error: 'Erro ao criar pagamento PIX' }, { status: 500 })
    }

    // Vincula o pix à recarga
    await (supabase
      .from('celular_recargas')
      .update({ pix_payment_id: pix.id } as any)
      .eq('id', recarga.id) as any)

    return NextResponse.json({
      success: true,
      recargaId: recarga.id,
      payment: {
        id: pix.id,
        txid: pix.txid,
        amount: pix.amount,
        status: pix.status,
        qrCode: pix.qrCode,
        pixCopyPaste: pix.pixCopyPaste,
        expiresAt: pix.expiresAt,
      },
    })
  } catch (err: any) {
    console.error('[recargas/create] exception:', err)
    return NextResponse.json({ error: err?.message ?? 'Erro interno' }, { status: 500 })
  }
}
