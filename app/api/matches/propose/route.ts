// ============================================
// API: /api/matches/propose
// ============================================
// POST = cria uma proposta de match
//   - Se o destinatario ja tem proposta pendente para mim:
//     match mutuo = ambas aceitas automaticamente (self-approval).
//   - Caso contrario, cria proposta pending normal.
// ============================================

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

    // Verificar se ja existe proposta minha pendente para este user
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

    // Verificar se existe proposta reversa (toUserId -> eu) pendente
    // -> MATCH MUTUO: aceitar ambas as partes
    const { data: reverse } = await (supabase
      .from('match_proposals')
      .select('id, status')
      .eq('from_user_id', toUserId)
      .eq('to_user_id', user.id)
      .eq('status', 'pending')
      .limit(1) as any)

    if (Array.isArray(reverse) && reverse.length > 0) {
      const reverseProposalId = reverse[0].id

      // 1) Aceitar a proposta reversa (o destinatario sou eu)
      const { error: acceptReverseErr } = await (supabase
        .from('match_proposals') as any)
        .update({
          status: 'accepted',
          responded_at: new Date().toISOString(),
        })
        .eq('id', reverseProposalId)

      if (acceptReverseErr) throw acceptReverseErr

      // 2) Criar minha proposta ja como aceita
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

      if (!result.success || !result.id) {
        return NextResponse.json(
          { error: result.message ?? 'Erro ao criar match mutuo' },
          { status: 400 },
        )
      }

      // 3) Marcar a minha proposta como aceita tambem
      const { error: acceptMineErr } = await (supabase
        .from('match_proposals') as any)
        .update({
          status: 'accepted',
          responded_at: new Date().toISOString(),
        })
        .eq('id', result.id)

      if (acceptMineErr) {
        console.error('Erro ao marcar minha proposta como aceita:', acceptMineErr)
      }

      return NextResponse.json({
        success: true,
        id: result.id,
        mutual: true,
        message: 'Match mútuo! Vocês podem conversar agora.',
      })
    }

    // Fluxo normal: criar proposta pendente
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

    return NextResponse.json({ success: true, id: result.id, mutual: false })
  } catch (err: any) {
    console.error('POST /api/matches/propose error:', err)
    return NextResponse.json(
      { error: err?.message ?? 'Erro ao criar proposta' },
      { status: 500 },
    )
  }
}
