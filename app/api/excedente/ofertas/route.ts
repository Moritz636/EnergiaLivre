import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('ofertas_excedente')
      .select(`
        *,
        gerador:gerador_id (
          nome_usina,
          concessionaria,
          cidade,
          estado,
          capacidade_kwp,
          profiles!geradores_id_fkey(nome, whatsapp)
        )
      `)
      .eq('status', 'ativa')
      .order('preco_kwh', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, ofertas: data || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
