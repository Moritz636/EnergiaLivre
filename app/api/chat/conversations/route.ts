// ============================================
// API: /api/chat/conversations
// ============================================
// GET  = lista conversas do user
// POST = cria conversa (1-1 ou grupo)
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(_request: NextRequest) {
  const supabase = await createClient()
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    // Memberships
    const { data: memberships, error: memErr } = await supabase
      .from('conversation_members')
      .select('conversation_id, last_read_at')
      .eq('user_id', user.id)

    if (memErr) throw memErr
    if (!memberships || memberships.length === 0) {
      return NextResponse.json({ success: true, conversations: [] })
    }

    const convIds = memberships.map((m) => m.conversation_id)
    const lastReadMap = new Map(memberships.map((m) => [m.conversation_id, m.last_read_at]))

    const { data: conversations, error: convErr } = await supabase
      .from('conversations')
      .select('*')
      .in('id', convIds)
      .order('last_message_at', { ascending: false, nullsFirst: false })

    if (convErr) throw convErr

    // Outros membros
    const { data: allMembers } = await supabase
      .from('conversation_members')
      .select('conversation_id, user_id, profiles!inner(nome, avatar_url)')
      .in('conversation_id', convIds)
      .neq('user_id', user.id)

    // Última mensagem
    const { data: lastMessages } = await supabase
      .from('messages')
      .select('conversation_id, content, created_at, deleted_at, attachment_name')
      .in('conversation_id', convIds)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(convIds.length * 5)

    // Unread count
    const unreadByConv = new Map<string, number>()
    for (const m of lastMessages ?? []) {
      const lastRead = lastReadMap.get(m.conversation_id)
      if (!lastRead || new Date(m.created_at) > new Date(lastRead)) {
        unreadByConv.set(m.conversation_id, (unreadByConv.get(m.conversation_id) ?? 0) + 1)
      }
    }

    // Indexar membros e última mensagem
    const membersByConv = new Map<string, any[]>()
    for (const m of allMembers ?? []) {
      const list = membersByConv.get(m.conversation_id) ?? []
      list.push({
        user_id: m.user_id,
        nome: (m.profiles as any)?.nome ?? null,
        avatar_url: (m.profiles as any)?.avatar_url ?? null,
      })
      membersByConv.set(m.conversation_id, list)
    }

    const lastMsgByConv = new Map<string, any>()
    for (const m of lastMessages ?? []) {
      if (!lastMsgByConv.has(m.conversation_id)) lastMsgByConv.set(m.conversation_id, m)
    }

    const result = (conversations ?? []).map((c) => {
      const last = lastMsgByConv.get(c.id)
      return {
        ...c,
        other_members: membersByConv.get(c.id) ?? [],
        unread_count: unreadByConv.get(c.id) ?? 0,
        last_message_preview: last
          ? last.content || (last.attachment_name ? `📎 ${last.attachment_name}` : null)
          : null,
      }
    })

    return NextResponse.json({ success: true, conversations: result })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const body = await request.json()
    const { isGroup, name, memberIds } = body as {
      isGroup: boolean
      name?: string
      memberIds: string[]
    }

    if (!Array.isArray(memberIds) || memberIds.length < 1) {
      return NextResponse.json({ error: 'memberIds obrigatório' }, { status: 400 })
    }

    if (isGroup && (!name || !name.trim())) {
      return NextResponse.json({ error: 'Nome do grupo obrigatório' }, { status: 400 })
    }

    // Criar conversa
    const { data: conv, error: convErr } = await (supabase
      .from('conversations') as any)
      .insert({
        is_group: !!isGroup,
        name: isGroup ? (name as string).trim() : null,
        created_by: user.id,
      })
      .select('id')
      .single()

    if (convErr) throw convErr

    const conversationId = conv.id as string

    // Adicionar membros (excluindo o criador — o trigger já cuida)
    const others = memberIds.filter((id) => id !== user.id)
    if (others.length > 0) {
      const { error: mErr } = await (supabase
        .from('conversation_members') as any)
        .insert(others.map((uid) => ({
          conversation_id: conversationId,
          user_id: uid,
          role: 'member',
        })))
      if (mErr) throw mErr
    }

    return NextResponse.json({ success: true, conversationId })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
