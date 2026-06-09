// ============================================================
// POST /api/user/credits/pix-charge
// Gera QR Code PIX para compra de créditos
// Retorna payload copia-e-cola + QR Code image
// ============================================================

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { generatePixCharge } from '@/lib/pix-qrcode'
import { MAX_PURCHASE_AMOUNT, isValidAmount } from '@/lib/credits'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: auth, error: authErr } = await supabase.auth.getUser()
    if (authErr || !auth?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = (await req.json().catch(() => ({}))) as { amount?: number }
    const amount = Number(body.amount ?? 0)

    if (!isValidAmount(amount)) {
      return NextResponse.json({ error: 'Valor inválido' }, { status: 400 })
    }
    if (amount > MAX_PURCHASE_AMOUNT) {
      return NextResponse.json(
        { error: `Valor máximo: R$ ${MAX_PURCHASE_AMOUNT.toLocaleString('pt-BR')}` },
        { status: 400 }
      )
    }

    // Gera QR Code PIX
    const charge = await generatePixCharge({
      amount,
      description: `Créditos EnergiaLivre - R$ ${amount.toFixed(2)}`,
    })

    // Salva transação pending
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!serviceKey || !supabaseUrl) {
      return NextResponse.json({ error: 'Service role não configurado' }, { status: 500 })
    }

    const admin = createAdminClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { data: tx, error: txErr } = await admin
      .from('credit_transactions')
      .insert({
        user_id: auth.user.id,
        amount,
        type: 'purchase',
        status: 'pending',
        description: `Compra de R$ ${amount.toFixed(2).replace('.', ',')} via Pix`,
        metadata: {
          pix_payload: charge.payload,
          pix_txid: charge.txid,
          source: 'pix_qrcode',
        },
      })
      .select('id, created_at')
      .single()

    if (txErr) {
      console.error('[pix-charge] insert error:', txErr)
      return NextResponse.json({ error: 'Erro ao registrar transação' }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      qrCodeBase64: charge.qrCodeBase64,
      payload: charge.payload,
      txid: charge.txid,
      transactionId: tx.id,
      amount,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min
    })
  } catch (err: any) {
    console.error('[pix-charge] exception:', err)
    return NextResponse.json({ error: err?.message ?? 'Erro ao gerar cobrança' }, { status: 500 })
  }
}
