// ============================================
// API: /api/chat/conversations/[id]/members
// ============================================
// POST   = adicionar membro (só grupos, só criador)
// DELETE = remover membro (só grupos, criador ou self)
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
    const userIdToAdd = body.userId as string

    if (!userIdToAdd) {
      return NextResponse.json({ error: 'userId obrigatório' }, { status: 400 })
    }

    // Validar que é grupo + criador
    const { data: conv, error: cErr } = await supabase
      .from('conversations')
      .select('created_by, is_group')
      .eq('id', conversationId)
      .single()

    if (cErr || !conv) return NextResponse.json({ error: 'Conversa não encontrada' }, { status: 404 })
    if (!conv.is_group) {
      return NextResponse.json({ error: 'Não é um grupo' }, { status: 400 })
    }
    if (conv.created_by !== user.id) {
      return NextResponse.json({ error: 'Apenas o criador pode adicionar' }, { status: 403 })
    }

    const { error } = await (supabase
      .from('conversation_members') as any)
      .insert({ conversation_id: conversationId, user_id: userIdToAdd, role: 'member' })

    if (error && !error.message.includes('duplicate')) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient()
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const { id: conversationId } = await params
    const url = new URL(request.url)
    const userIdToRemove = url.searchParams.get('userId') ?? user.id

    // Self-remove é sempre permitido
    if (userIdToRemove !== user.id) {
      // Remover outros: só criador
      const { data: conv } = await supabase
        .from('conversations')
        .select('created_by, is_group')
        .eq('id', conversationId)
        .single()
      if (!conv?.is_group || conv.created_by !== user.id) {
        return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
      }
    }

    const { error } = await supabase
      .from('conversation_members')
      .delete()
      .eq('conversation_id', conversationId)
      .eq('user_id', userIdToRemove)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
