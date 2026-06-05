import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const RADIUS_KM = 500

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient()
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const { id: invoiceId } = await params

    // 1) Buscar a fatura
    const { data: invoice, error: invErr } = await supabase
      .from('invoice_uploads')
      .select('*')
      .eq('id', invoiceId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (invErr) throw invErr
    if (!invoice) return NextResponse.json({ error: 'Fatura não encontrada' }, { status: 404 })

    if (!invoice.estado) {
      return NextResponse.json({
        error: 'Fatura sem estado identificado. Analise primeiro.',
      }, { status: 400 })
    }

    // 2) Buscar geradores no estado (sem restrição rígida de raio por enquanto)
    const { data: geradores, error: gErr } = await (supabase
      .from('geradores') as any)
      .select('id, nome_usina, cidade, estado, capacidade_kwp, excedente_kwh, status')
      .eq('estado', invoice.estado)
      .eq('status', 'ativo')
      .limit(20)

    if (gErr) throw gErr

    const matchCount = (geradores ?? []).length

    // 3) Atualizar status da fatura
    const { data: updated, error: updErr } = await (supabase
      .from('invoice_uploads') as any)
      .update({
        status: matchCount > 0 ? 'matched' : 'analyzed',
        match_count: matchCount,
        matched_at: new Date().toISOString(),
      })
      .eq('id', invoiceId)
      .select('*')
      .single()

    if (updErr) throw updErr

    // 4) Para cada gerador, criar uma proposta de match (pending) automaticamente
    let createdProposals = 0
    for (const g of (geradores ?? []) as any[]) {
      const { error: propErr } = await (supabase
        .from('match_proposals') as any)
        .insert({
          from_user_id: user.id,
          to_user_id: g.id,
          consumidor_id: user.id,
          gerador_id: g.id,
          status: 'pending',
          message: `Fatura de ${invoice.estado}${invoice.concessionaria ? ' (' + invoice.concessionaria + ')' : ''} - ${invoice.kwh_mensal ?? '?'} kWh/mês. Proposta automática baseada em análise.`,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        })
      if (!propErr) createdProposals++
    }

    return NextResponse.json({
      success: true,
      invoice: updated,
      candidates: geradores ?? [],
      proposalsCreated: createdProposals,
      matchCount,
    })
  } catch (err: any) {
    console.error('POST /api/invoices/[id]/match error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
