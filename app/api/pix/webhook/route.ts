import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Webhook de pagamento PIX.
 *
 * Em produção: o provedor (OpenPix/Mercado Pago/etc) chama esta rota
 * informando que o PIX foi pago. Aqui validamos o payload e atualizamos
 * o status em `pix_payments`.
 *
 * No mock: /api/pix/webhook pode ser chamado manualmente para confirmar
 * um pagamento (development convenience).
 */
export async function POST(request: NextRequest) {
  try {
    const json = await request.json().catch(() => ({}))
    const txid = typeof json.txid === 'string' ? json.txid : null
    const status = typeof json.status === 'string' ? json.status : 'paid'

    if (!txid) {
      return NextResponse.json({ error: 'txid obrigatório' }, { status: 400 })
    }
    if (!['paid', 'expired', 'cancelled', 'refunded', 'failed'].includes(status)) {
      return NextResponse.json({ error: 'status inválido' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: payment, error: findError } = await supabase
      .from('pix_payments')
      .select('id, user_id, amount, status, purpose, metadata')
      .eq('txid', txid)
      .maybeSingle()

    if (findError || !payment) {
      return NextResponse.json({ error: 'Pagamento não encontrado' }, { status: 404 })
    }

    if (payment.status === 'paid' && status === 'paid') {
      return NextResponse.json({ success: true, message: 'Já confirmado (idempotente)' })
    }

    const updateData: Record<string, unknown> = { status }
    if (status === 'paid') {
      updateData.paid_at = new Date().toISOString()
    }
    await supabase
      .from('pix_payments')
      .update(updateData as any)
      .eq('id', payment.id)

    // Side-effects por purpose
    if (status === 'paid') {
      const meta = (payment.metadata as Record<string, any>) ?? {}
      switch (payment.purpose) {
        case 'coin_purchase': {
          const coins = Number(meta.coins ?? meta.tokens ?? 0)
          if (coins > 0) {
            await supabase.rpc('credit_wallet', {
              p_user_id: payment.user_id,
              p_amount: coins,
              p_type: 'purchase',
              p_reason: 'PIX',
              p_metadata: { pix_id: payment.id, txid } as any,
            } as any)
          }
          break
        }
        case 'celular_recharge': {
          await supabase
            .from('celular_recargas')
            .update({ status: 'paid', pix_payment_id: payment.id } as any)
            .eq('pix_payment_id', payment.id)
          break
        }
        case 'token_presale': {
          // No MVP mock: nada - usuário recebe token após lançamento
          break
        }
        default:
          break
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[pix/webhook] exception:', err)
    return NextResponse.json({ error: err?.message ?? 'Erro interno' }, { status: 500 })
  }
}
