// ============================================================
// GET /api/user/credits/history
// ------------------------------------------------------------
// Retorna as últimas 50 transações do usuário logado.
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchUserHistory } from '@/lib/credits'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10) || 50, 200)

  const history = await fetchUserHistory(user.id, limit)
  return NextResponse.json({ success: true, transactions: history })
}
