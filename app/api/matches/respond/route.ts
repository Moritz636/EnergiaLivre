import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { respondToProposal } from '@/lib/matches'

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
    const proposalId = Number(body.proposalId)
    const response = body.response

    if (!Number.isFinite(proposalId) || proposalId <= 0) {
      return NextResponse.json({ error: 'proposalId inválido' }, { status: 400 })
    }
    if (response !== 'accepted' && response !== 'rejected') {
      return NextResponse.json(
        { error: "response deve ser 'accepted' ou 'rejected'" },
        { status: 400 },
      )
    }

    const result = await respondToProposal(
      { proposalId, userId: user.id, response },
      { supabase },
    )

    if (!result.success) {
      const status = result.message?.includes('não encontrada') ? 404 : 400
      return NextResponse.json({ error: result.message }, { status })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('POST /api/matches/respond error:', err)
    return NextResponse.json(
      { error: err?.message ?? 'Erro ao responder proposta' },
      { status: 500 },
    )
  }
}
