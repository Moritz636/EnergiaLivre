// ============================================
// API: /api/chat/or-with-match/[matchId]
// ============================================
// GET = retorna (ou cria) a conversa 1-1 de um match aceito
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> },
) {
  const supabase = await createClient()
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const { matchId: matchIdStr } = await params
    const matchId = parseInt(matchIdStr, 10)
    if (isNaN(matchId)) {
      return NextResponse.json({ error: 'matchId inválido' }, { status: 400 })
    }

    const { data, error } = await (supabase.rpc as any)(
      'get_or_create_match_conversation',
      { p_match_id: matchId, p_user_id: user.id },
    )

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, conversationId: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
