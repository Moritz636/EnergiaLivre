import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const json = await request.json()
    const ofertaId = json.oferta_id as string

    if (!ofertaId) {
      return NextResponse.json({ error: 'oferta_id é obrigatório' }, { status: 400 })
    }

    const { data, error } = await supabase.rpc('contratar_oferta', {
      p_oferta_id: ofertaId,
      p_consumidor_id: user.id,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || { success: false, error: 'Resposta vazia' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
