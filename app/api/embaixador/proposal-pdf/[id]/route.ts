import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateProposalPdf, type ProposalData } from '@/lib/pdf/proposal'

// ============================================================
// GET /api/embaixador/proposal-pdf/[id]
// ------------------------------------------------------------
// Regenera (server-side) o PDF de uma proposta para o
// embaixador baixar. Útil para reenviar manualmente.
// ============================================================

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const proposalId = params.id
    const { data: proposal, error: propErr } = await (supabase
      .from('proposals')
      .select('*, embaixador:profiles!proposals_embaixador_id_fkey(nome, email, cidade, estado)')
      .eq('id', proposalId)
      .eq('embaixador_id', user.id)
      .single() as any)

    if (propErr || !proposal) {
      return NextResponse.json(
        { error: 'Proposta não encontrada' },
        { status: 404 },
      )
    }

    // Perfil do embaixador
    const emb = (proposal as any).embaixador || {
      nome: 'Embaixador EnergiaLivre',
      email: '',
      cidade: '',
      estado: '',
    }

    const pdfData: ProposalData = {
      embaixadorNome: emb.nome,
      embaixadorEmail: emb.email,
      embaixadorCidade: emb.cidade,
      embaixadorEstado: emb.estado,
      clientName: proposal.client_name || '',
      clientEmail: proposal.client_email,
      clientWhatsapp: proposal.client_whatsapp || undefined,
      clientCidade: proposal.client_cidade || undefined,
      clientEstado: proposal.client_estado || undefined,
      gastoMensal: Number(proposal.gasto_mensal),
      economiaMensal: Number(proposal.economia_mensal),
      economiaAnual: Number(proposal.economia_anual),
      percentualEconomia: Number(proposal.percentual_economia),
      contaComEnergiaLivre:
        Number(proposal.gasto_mensal) - Number(proposal.economia_mensal),
      proposalId: proposal.id,
      validUntil: new Date(proposal.valid_until),
      issuedAt: new Date(proposal.created_at),
      pdfUrl: proposal.pdf_url || undefined,
    }

    const pdfBytes = await generateProposalPdf(pdfData)

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="Proposta-EnergiaLivre-${proposalId.slice(0, 8)}.pdf"`,
        'Cache-Control': 'private, no-store',
      },
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? 'Erro interno' },
      { status: 500 },
    )
  }
}
