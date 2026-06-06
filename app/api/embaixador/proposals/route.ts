import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// ============================================================
// GET /api/embaixador/proposals
// ------------------------------------------------------------
// Lista as propostas enviadas pelo embaixador logado.
// Usado pelo painel do embaixador para histórico + reenvio.
// ============================================================

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { data, error } = await (supabase
      .from('proposals')
      .select('*')
      .eq('embaixador_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50) as any)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ proposals: data ?? [] })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? 'Erro interno' },
      { status: 500 },
    )
  }
}
