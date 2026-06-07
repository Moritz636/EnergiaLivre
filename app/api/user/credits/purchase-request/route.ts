// ============================================================
// POST /api/user/credits/purchase-request
// ------------------------------------------------------------
// Usuário declara "já paguei" via Pix. Cria uma transação
// `pending` para o admin revisar e creditar manualmente.
// Não altera saldo. (Fase 1 manual; Fase 2 virá webhook auto.)
// ============================================================

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import {
  PIX_KEY,
  PIX_KEY_RAW,
  MAX_PURCHASE_AMOUNT,
  isValidAmount,
} from '@/lib/credits'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: auth, error: authErr } = await supabase.auth.getUser()
    if (authErr || !auth?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = (await req.json().catch(() => ({}))) as {
      amount?: number
      description?: string
    }
    const amount = Number(body.amount ?? 0)
    if (!isValidAmount(amount)) {
      return NextResponse.json({ error: 'Valor inválido' }, { status: 400 })
    }
    if (amount > MAX_PURCHASE_AMOUNT) {
      return NextResponse.json(
        {
          error: `Valor máximo por compra: R$ ${MAX_PURCHASE_AMOUNT.toLocaleString('pt-BR')}`,
        },
        { status: 400 }
      )
    }

    const description =
      body.description?.trim() ||
      `Solicitação de compra de R$ ${amount.toFixed(2).replace('.', ',')} via Pix (${PIX_KEY})`

    // Insere transação pending. Service Role para bypassar RLS (insert).
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!serviceKey || !supabaseUrl) {
      return NextResponse.json(
        { error: 'Service role não configurado' },
        { status: 500 }
      )
    }
    const admin = createAdminClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { data, error } = await admin
      .from('credit_transactions')
      .insert({
        user_id: auth.user.id,
        amount,
        type: 'purchase',
        status: 'pending',
        description,
        metadata: { pix_key: PIX_KEY_RAW, source: 'web' },
      })
      .select('id, created_at')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      requestId: data.id,
      message: 'Solicitação registrada. Aguarde a confirmação do admin.',
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? 'Erro ao processar' },
      { status: 500 }
    )
  }
}
