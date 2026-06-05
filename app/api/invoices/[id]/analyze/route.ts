import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { parseInvoiceText, isCompleteExtraction } from '@/lib/invoice-parser'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient()
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const { id: invoiceId } = await params
    const body = await request.json().catch(() => ({}))
    const text = typeof body.text === 'string' ? body.text : ''
    const manualOverride = typeof body.manual === 'object' && body.manual !== null ? body.manual : null

    // Buscar a fatura
    const { data: invoice, error: invErr } = await supabase
      .from('invoice_uploads')
      .select('*')
      .eq('id', invoiceId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (invErr) throw invErr
    if (!invoice) return NextResponse.json({ error: 'Fatura não encontrada' }, { status: 404 })

    // Se o usuário forneceu override manual, usa; senão, extrai do texto
    let extracted
    if (manualOverride) {
      extracted = {
        estado: manualOverride.estado ?? null,
        concessionaria: manualOverride.concessionaria ?? null,
        valor_total: manualOverride.valor_total ? Number(manualOverride.valor_total) : null,
        kwh_mensal: manualOverride.kwh_mensal ? Number(manualOverride.kwh_mensal) : null,
        vencimento: manualOverride.vencimento ?? null,
        raw_matches: { source: 'manual' },
      }
    } else if (text) {
      extracted = parseInvoiceText(text)
    } else {
      return NextResponse.json({
        error: 'Forneça text (texto da fatura) OU manual (override manual)',
      }, { status: 400 })
    }

    const complete = isCompleteExtraction(extracted)
    const newStatus = complete ? 'analyzed' : 'pending'

    const { data: updated, error: updErr } = await (supabase
      .from('invoice_uploads') as any)
      .update({
        estado: extracted.estado,
        concessionaria: extracted.concessionaria,
        valor_total: extracted.valor_total,
        kwh_mensal: extracted.kwh_mensal,
        vencimento: extracted.vencimento,
        raw_extraction: extracted.raw_matches,
        status: newStatus,
        analyzed_at: complete ? new Date().toISOString() : null,
        error_message: complete ? null : 'Campos incompletos: forneça estado, concessionária e valor manualmente',
      })
      .eq('id', invoiceId)
      .select('*')
      .single()

    if (updErr) throw updErr

    return NextResponse.json({
      success: true,
      invoice: updated,
      extracted,
      complete,
    })
  } catch (err: any) {
    console.error('POST /api/invoices/[id]/analyze error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
