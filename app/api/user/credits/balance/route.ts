// ============================================================
// GET /api/user/credits/balance
// ------------------------------------------------------------
// Retorna o saldo de créditos do usuário logado.
// ============================================================

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchUserBalance } from '@/lib/credits'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const balance = await fetchUserBalance(user.id)
  return NextResponse.json({ success: true, balance })
}
