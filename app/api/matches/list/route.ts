// ============================================
// API: /api/matches/list
// ============================================
// GET = lista propostas do usuario
//   ?direction=received|sent|accepted
//   ?status=pending|accepted|rejected|expired
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const direction = (searchParams.get('direction') ?? 'all') as
      | 'received'
      | 'sent'
      | 'accepted'
      | 'all'
    const statusFilter = searchParams.get('status') as string | null

    // Buscar todas as propostas onde o user é parte
    const sb: any = supabase
    let q = sb
      .from('match_proposals')
      .select('*')
      .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(100)

    if (statusFilter) {
      q = q.eq('status', statusFilter)
    }

    const { data: proposals, error } = await q
    if (error) throw error

    // Coletar IDs dos outros users para fetch em batch
    const otherIds = new Set<string>()
    for (const p of (proposals ?? []) as any[]) {
      if (p.from_user_id !== user.id) otherIds.add(p.from_user_id)
      if (p.to_user_id !== user.id) otherIds.add(p.to_user_id)
    }

    // Buscar profiles e locations em batch
    const otherIdsArr = Array.from(otherIds)
    let profilesById: Record<string, any> = {}
    if (otherIdsArr.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, nome, tipo, cidade, estado, avatar_url, is_active')
        .in('id', otherIdsArr)

      for (const p of (profiles ?? []) as any[]) {
        profilesById[p.id] = p
      }
    }

    // Filtrar e enriquecer
    let list = (proposals ?? []).map((p: any) => {
      const isFromMe = p.from_user_id === user.id
      const otherId = isFromMe ? p.to_user_id : p.from_user_id
      const other = profilesById[otherId] ?? null
      return {
        id: p.id,
        status: p.status,
        message: p.message,
        expires_at: p.expires_at,
        responded_at: p.responded_at,
        created_at: p.created_at,
        direction: isFromMe ? 'sent' : 'received',
        other_user: other
          ? {
              id: other.id,
              nome: other.nome,
              tipo: other.tipo,
              cidade: other.cidade,
              estado: other.estado,
              avatar_url: other.avatar_url,
            }
          : null,
      }
    })

    if (direction === 'received') {
      list = list.filter((p: any) => p.direction === 'received')
    } else if (direction === 'sent') {
      list = list.filter((p: any) => p.direction === 'sent')
    } else if (direction === 'accepted') {
      list = list.filter((p: any) => p.status === 'accepted')
    }

    // Stats
    const stats = {
      received_pending: (proposals ?? []).filter(
        (p: any) => p.to_user_id === user.id && p.status === 'pending',
      ).length,
      sent_pending: (proposals ?? []).filter(
        (p: any) => p.from_user_id === user.id && p.status === 'pending',
      ).length,
      accepted: (proposals ?? []).filter((p: any) => p.status === 'accepted').length,
    }

    return NextResponse.json({ success: true, proposals: list, stats })
  } catch (err: any) {
    console.error('GET /api/matches/list error:', err)
    return NextResponse.json(
      { error: err?.message ?? 'Erro ao listar propostas' },
      { status: 500 },
    )
  }
}
