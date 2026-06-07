// ============================================================
// POST /api/admin/credits/credit
// ------------------------------------------------------------
// Admin credita (+) ou debita (-) créditos de um usuário.
// Requer role=admin.
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/credits'
import { getSupabase } from '@/lib/supabase/singleton'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface CreditBody {
  userId: string
  amount: number // positivo = crédito, negativo = débito
  type?: 'purchase' | 'commission' | 'refund' | 'admin_credit' | 'admin_debit' | 'bonus' | 'cashback'
  description?: string
  metadata?: Record<string, any>
}

const VALID_TYPES = new Set([
  'purchase', 'commission', 'refund', 'admin_credit', 'admin_debit',
  'bonus', 'cashback',
])

export async function POST(request: NextRequest) {
  const { user, isAdmin } = await requireAdmin()
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }
  if (!isAdmin) {
    return NextResponse.json({ error: 'Acesso restrito a administradores' }, { status: 403 })
  }

  let body: CreditBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const { userId, amount, type, description, metadata } = body

  if (!userId || typeof userId !== 'string') {
    return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 })
  }
  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount === 0) {
    return NextResponse.json({ error: 'amount deve ser número não-zero' }, { status: 400 })
  }
  if (type && !VALID_TYPES.has(type)) {
    return NextResponse.json({ error: 'type inválido' }, { status: 400 })
  }

  const finalType = type ?? (amount > 0 ? 'admin_credit' : 'admin_debit')
  const finalDescription =
    description ?? (amount > 0 ? 'Crédito manual via admin' : 'Débito manual via admin')

  const supabase = getSupabase()
  const { data, error } = await (supabase as any).rpc('credit_user', {
    p_user_id: userId,
    p_amount: amount,
    p_type: finalType,
    p_description: finalDescription,
    p_admin_id: user.id,
    p_metadata: metadata ?? null,
  })

  if (error) {
    console.error('[api/admin/credits/credit] error:', error)
    return NextResponse.json(
      { error: error.message ?? 'Erro ao creditar' },
      { status: 400 },
    )
  }

  // RPC retorna SETOF (new_balance, transaction_id)
  const row = Array.isArray(data) ? data[0] : data
  return NextResponse.json({
    success: true,
    newBalance: Number(row?.new_balance ?? 0),
    transactionId: row?.transaction_id ?? null,
  })
}
