// ============================================
// API: /api/chat/upload
// ============================================
// POST = upload de anexo para o bucket chat-attachments
// Form: multipart/form-data com campo 'file' + 'conversationId'
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const BUCKET = 'chat-attachments'
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const conversationId = formData.get('conversationId') as string | null

    if (!file || !conversationId) {
      return NextResponse.json({ error: 'file e conversationId obrigatórios' }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({
        error: `Arquivo muito grande (máx 10MB). Recebido: ${(file.size / 1024 / 1024).toFixed(1)}MB`,
      }, { status: 413 })
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

    const safeName = file.name
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .slice(0, 60)
    const path = `conversations/${conversationId}/${user.id}/${Date.now()}-${safeName}`

    const { error: uploadErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      })

    if (uploadErr) throw uploadErr

    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(path)

    let type: 'image' | 'pdf' | 'file' = 'file'
    if (file.type.startsWith('image/')) type = 'image'
    else if (file.type === 'application/pdf') type = 'pdf'

    return NextResponse.json({
      success: true,
      attachment: {
        url: urlData.publicUrl,
        name: file.name,
        type,
        size: file.size,
        path,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
