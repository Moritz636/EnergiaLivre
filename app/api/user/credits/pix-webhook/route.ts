// ============================================================
// POST /api/user/credits/pix-webhook
// Webhook para confirmação automática de pagamento PIX
// Pode ser chamado por Mercado Pago, PagSeguro, ou manualmente
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const WEBHOOK_SECRET = process.env.PIX_WEBHOOK_SECRET || 'energialivre-pix-secret'

export async function POST(request: NextRequest) {
  try {
    // Verifica secret (quando chamado por processador de pagamento)
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader !== `Bearer ${WEBHOOK_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await request.json().catch(() => ({}))) as {
      txid?: string
      transactionId?: string
      status?: string
      amount?: number
      pixKey?: string
    }

    if (!body.txid && !body.transactionId) {
      return NextResponse.json({ error: 'txid or transactionId required' }, { status: 400 })
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!serviceKey || !supabaseUrl) {
      return NextResponse.json({ error: 'Service role não configurado' }, { status: 500 })
    }

    const admin = createAdminClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // Busca transação pendente
    let query = admin.from('credit_transactions').select('*').eq('status', 'pending')

    if (body.transactionId) {
      query = query.eq('id', body.transactionId)
    } else {
      query = query.contains('metadata', JSON.stringify({ pix_txid: body.txid }))
    }

    const { data: tx, error: txErr } = await query.single()

    if (txErr || !tx) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    // Atualiza status para completed
    const { error: updateErr } = await admin
      .from('credit_transactions')
      .update({ status: 'completed' })
      .eq('id', tx.id)

    if (updateErr) {
      console.error('[pix-webhook] update error:', updateErr)
      return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
    }

    // Creditar saldo do usuário
    const { data: existing, error: balErr } = await admin
      .from('user_credits')
      .select('balance')
      .eq('user_id', tx.user_id)
      .single()

    if (balErr || !existing) {
      // Cria registro se não existe
      await admin.from('user_credits').insert({
        user_id: tx.user_id,
        balance: tx.amount,
      })
    } else {
      // Atualiza saldo
      await admin
        .from('user_credits')
        .update({ balance: existing.balance + tx.amount })
        .eq('user_id', tx.user_id)
    }

    console.log(`[pix-webhook] Credited R$ ${tx.amount} to user ${tx.user_id}`)

    return NextResponse.json({ ok: true, credited: tx.amount })
  } catch (err: any) {
    console.error('[pix-webhook] exception:', err)
    return NextResponse.json({ error: err?.message ?? 'Error' }, { status: 500 })
  }
}
