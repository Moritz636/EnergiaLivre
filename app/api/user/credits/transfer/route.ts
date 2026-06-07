// ============================================================
// POST /api/user/credits/transfer
// ------------------------------------------------------------
// Transfere créditos do usuário logado para outro usuário.
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSupabase } from '@/lib/supabase/singleton'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface TransferBody {
  toUserId: string
  amount: number
  description?: string
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  let body: TransferBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const { toUserId, amount, description } = body

  if (!toUserId || typeof toUserId !== 'string') {
    return NextResponse.json({ error: 'toUserId é obrigatório' }, { status: 400 })
  }
  if (typeof amount !== 'number' || amount <= 0 || !Number.isFinite(amount)) {
    return NextResponse.json({ error: 'amount deve ser positivo' }, { status: 400 })
  }
  if (toUserId === user.id) {
    return NextResponse.json(
      { error: 'Não pode transferir para si mesmo' },
      { status: 400 },
    )
  }

  const client = getSupabase()
  const { data, error } = await (client as any).rpc('transfer_credits', {
    p_from_user_id: user.id,
    p_to_user_id: toUserId,
    p_amount: amount,
    p_description: description ?? 'Transferência entre usuários',
  })

  if (error) {
    console.error('[api/user/credits/transfer] error:', error)
    return NextResponse.json(
      { error: error.message ?? 'Erro ao transferir' },
      { status: 400 },
    )
  }

  const row = Array.isArray(data) ? data[0] : data
  return NextResponse.json({
    success: true,
    fromBalance: Number(row?.from_balance ?? 0),
    toBalance: Number(row?.to_balance ?? 0),
    transferId: row?.transfer_id ?? null,
  })
}
