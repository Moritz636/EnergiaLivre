import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createMatchProposal } from '@/lib/matches'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const toUserId = typeof body.toUserId === 'string' ? body.toUserId : null
    const message = typeof body.message === 'string' ? body.message : undefined
    const geradorId = typeof body.geradorId === 'string' ? body.geradorId : null
    const consumidorId = typeof body.consumidorId === 'string' ? body.consumidorId : null

    if (!toUserId) {
      return NextResponse.json({ error: 'toUserId é obrigatório' }, { status: 400 })
    }
    if (toUserId === user.id) {
      return NextResponse.json(
        { error: 'Não é possível propor match para si mesmo' },
        { status: 400 },
      )
    }

    const { data: existing } = await (supabase
      .from('match_proposals')
      .select('id, status')
      .eq('from_user_id', user.id)
      .eq('to_user_id', toUserId)
      .eq('status', 'pending')
      .limit(1) as any)

    if (Array.isArray(existing) && existing.length > 0) {
      return NextResponse.json(
        { error: 'Já existe uma proposta pendente para este usuário' },
        { status: 409 },
      )
    }

    const result = await createMatchProposal(
      {
        fromUserId: user.id,
        toUserId,
        message,
        geradorId,
        consumidorId,
      },
      { supabase },
    )

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, id: result.id })
  } catch (err: any) {
    console.error('POST /api/matches/propose error:', err)
    return NextResponse.json(
      { error: err?.message ?? 'Erro ao criar proposta' },
      { status: 500 },
    )
  }
}
