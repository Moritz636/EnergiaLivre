import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/pix/status?txid=...
 * Retorna o status atual de um pagamento PIX
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const txid = searchParams.get('txid')
    if (!txid) {
      return NextResponse.json({ error: 'txid obrigatório' }, { status: 400 })
    }

    const { data: payment, error } = await supabase
      .from('pix_payments')
      .select('id, txid, amount, status, expires_at, paid_at, purpose, description')
      .eq('txid', txid)
      .eq('user_id', user.id)
      .maybeSingle()

    if (error || !payment) {
      return NextResponse.json({ error: 'Pagamento não encontrado' }, { status: 404 })
    }

    // Auto-expire se passou do tempo
    if (payment.status === 'pending' && new Date(payment.expires_at) < new Date()) {
      await supabase
        .from('pix_payments')
        .update({ status: 'expired' } as any)
        .eq('id', payment.id)
      return NextResponse.json({ success: true, status: 'expired' })
    }

    return NextResponse.json({ success: true, status: payment.status, payment })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Erro interno' }, { status: 500 })
  }
}
