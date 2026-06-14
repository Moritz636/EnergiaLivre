import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { nome, email, whatsapp, cidade } = await req.json()

    if (!nome || !email || !whatsapp || !cidade) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRe.test(email)) {
      return NextResponse.json({ error: 'E-mail inválido' }, { status: 400 })
    }

    const supabase = await createClient()

    const { error } = await supabase.from('leads').insert({
      nome,
      email,
      whatsapp,
      cidade,
      estado: 'ND',
      tipo: 'consumidor',
      status: 'pendente',
    })

    if (error) {
      console.error('[quick-capture] insert error:', error)
      return NextResponse.json({ error: 'Erro ao salvar lead' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[quick-capture] error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
