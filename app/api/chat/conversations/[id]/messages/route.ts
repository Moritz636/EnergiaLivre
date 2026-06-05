// ============================================
// API: /api/chat/conversations/[id]/messages
// ============================================
// GET  = lista mensagens (paginação por cursor)
// POST = envia mensagem (texto + anexo)
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient()
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const { id: conversationId } = await params
    const url = new URL(request.url)
    const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '50'), 100)
    const before = url.searchParams.get('before') ?? undefined

    // Validar membership
    const { data: member, error: mErr } = await supabase
      .from('conversation_members')
      .select('user_id')
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (mErr) throw mErr
    if (!member) {
      return NextResponse.json({ error: 'Sem acesso a esta conversa' }, { status: 403 })
    }

    let q = supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (before) q = q.lt('created_at', before)

    const { data, error } = await q
    if (error) throw error

    // Devolver em ordem cronológica
    return NextResponse.json({
      success: true,
      messages: ((data ?? []) as any[]).reverse(),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient()
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const { id: conversationId } = await params
    const body = await request.json()

    const content = (body.content ?? '').toString()
    const attachment = body.attachment ?? null

    if (!content.trim() && !attachment) {
      return NextResponse.json({ error: 'Mensagem vazia' }, { status: 400 })
    }

    // Validar membership
    const { data: member } = await supabase
      .from('conversation_members')
      .select('user_id')
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (!member) {
      return NextResponse.json({ error: 'Sem acesso a esta conversa' }, { status: 403 })
    }

    const row: any = {
      conversation_id: conversationId,
      sender_id: user.id,
      content: content.trim().slice(0, 4000),
    }
    if (attachment && typeof attachment === 'object') {
      row.attachment_url = attachment.url ?? null
      row.attachment_name = attachment.name ?? null
      row.attachment_type = attachment.type ?? null
      row.attachment_size = attachment.size ?? null
    }

    const { data, error } = await (supabase
      .from('messages') as any)
      .insert(row)
      .select('*')
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, message: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
