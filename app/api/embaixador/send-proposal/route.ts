import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateProposalPdf, type ProposalData } from '@/lib/pdf/proposal'
import { proposalEmailHtml, sendEmail } from '@/lib/email'
import { RATE_LIMIT_PRESETS, getClientIp, rateLimit } from '@/lib/ratelimit'

// ============================================================
// POST /api/embaixador/send-proposal
// ------------------------------------------------------------
// Gera um PDF de proposta personalizada e envia por e-mail
// para o cliente final. Fluxo:
//
//   1) Valida sessão + role 'parceiro' do embaixador.
//   2) Lê profile do embaixador (nome, email, cidade/estado).
//   3) Gera o PDF (pdf-lib) com a simulação.
//   4) Faz upload do PDF no bucket 'proposals'.
//   5) Envia o e-mail (Resend ou fallback queued).
//   6) Grava a linha em `proposals` para auditoria.
//   7) Retorna { proposalId, pdfUrl, validUntil, sendStatus }.
// ============================================================

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const PROPOSAL_VALIDITY_HOURS = 48
const BUCKET = 'proposals'

interface Body {
  clientName?: string
  clientEmail: string
  clientWhatsapp?: string
  clientCidade?: string
  clientEstado?: string
  gastoMensal: number
  economiaMensal: number
  economiaAnual: number
  percentualEconomia: number
  contaComEnergiaLivre?: number
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export async function POST(request: NextRequest) {
  try {
    // 1) Rate limit por IP (anti-abuso) — sempre aplicado.
    const ip = getClientIp(request.headers)
    const rl = await rateLimit({
      identifier: `send-proposal:${ip}`,
      ...RATE_LIMIT_PRESETS.lead,
    })
    if (!rl.success) {
      return NextResponse.json(
        {
          error: `Muitas requisições. Tente em ${rl.reset}s.`,
        },
        { status: 429 },
      )
    }

    // 2) Body
    const body = (await request.json().catch(() => ({}))) as Body
    if (!body?.clientEmail || !isValidEmail(body.clientEmail)) {
      return NextResponse.json(
        { error: 'E-mail do cliente inválido' },
        { status: 400 },
      )
    }
    if (!body?.gastoMensal || body.gastoMensal <= 0) {
      return NextResponse.json(
        { error: 'Gasto mensal deve ser maior que zero' },
        { status: 400 },
      )
    }
    if (!body?.economiaMensal || body.economiaMensal <= 0) {
      return NextResponse.json(
        { error: 'Economia mensal deve ser maior que zero' },
        { status: 400 },
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // 3) Identifica o "embaixador remetente".
    //    - Logado: usa o profile do embaixador real.
    //    - Anônimo (do /simulador): usa o primeiro embaixador ativo
    //      do sistema como remetente. Se não houver, faz fallback
    //      para a marca EnergiaLivre.
    let embaixadorId: string
    let embaixadorNome: string
    let embaixadorEmail: string
    let embaixadorCidade = ''
    let embaixadorEstado = ''

    if (user) {
      const { data: profile, error: profErr } = await (supabase
        .from('profiles')
        .select('nome, email, cidade, estado, tipo, role')
        .eq('id', user.id)
        .single() as any)

      if (profErr || !profile) {
        return NextResponse.json(
          { error: 'Perfil não encontrado' },
          { status: 404 },
        )
      }
      const isEmbaixador =
        profile.tipo === 'parceiro' || profile.role === 'admin'
      if (!isEmbaixador) {
        return NextResponse.json(
          { error: 'Apenas parceiros podem enviar propostas' },
          { status: 403 },
        )
      }
      embaixadorId = user.id
      embaixadorNome = profile.nome
      embaixadorEmail = profile.email
      embaixadorCidade = profile.cidade || ''
      embaixadorEstado = profile.estado || ''
    } else {
      // Fluxo público (simulador) — pega o embaixador com mais
      // leads recentes como remetente padrão.
      const { data: topEmbaixador } = await (supabase
        .from('profiles')
        .select('id, nome, email, cidade, estado')
        .eq('tipo', 'parceiro')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle() as any)

      if (topEmbaixador) {
        embaixadorId = topEmbaixador.id
        embaixadorNome = topEmbaixador.nome
        embaixadorEmail = topEmbaixador.email
        embaixadorCidade = topEmbaixador.cidade || ''
        embaixadorEstado = topEmbaixador.estado || ''
      } else {
        // Sem embaixador cadastrado: remetente institucional
        embaixadorId = '00000000-0000-0000-0000-000000000000'
        embaixadorNome = 'Equipe EnergiaLivre'
        embaixadorEmail =
          process.env.EMAIL_FROM ?? 'contato@energialivre.dev.br'
      }
    }

    // 4) Calcular totais
    const economiaMensal = Math.round(body.economiaMensal)
    const economiaAnual =
      body.economiaAnual || economiaMensal * 12
    const contaComEnergiaLivre =
      body.contaComEnergiaLivre ??
      Math.max(0, Math.round(body.gastoMensal - economiaMensal))
    const percentual = body.percentualEconomia || 32

    const issuedAt = new Date()
    const validUntil = new Date(
      issuedAt.getTime() + PROPOSAL_VALIDITY_HOURS * 60 * 60 * 1000,
    )

    // 5) Gerar o PDF
    const proposalId = crypto.randomUUID()
    const pdfData: ProposalData = {
      embaixadorNome,
      embaixadorEmail,
      embaixadorCidade,
      embaixadorEstado,
      clientName: body.clientName?.trim() || '',
      clientEmail: body.clientEmail.trim(),
      clientWhatsapp: body.clientWhatsapp?.trim(),
      clientCidade: body.clientCidade?.trim(),
      clientEstado: body.clientEstado?.trim()?.toUpperCase(),
      gastoMensal: Math.round(body.gastoMensal),
      economiaMensal,
      economiaAnual,
      percentualEconomia: percentual,
      contaComEnergiaLivre,
      proposalId,
      validUntil,
      issuedAt,
    }
    const pdfBytes = await generateProposalPdf(pdfData)
    const pdfBuffer = Buffer.from(pdfBytes)

    // 6) Upload do PDF no Supabase Storage
    //    Para remetente institucional, usa pasta 'public/' (sem userId real)
    const pdfPath =
      embaixadorId === '00000000-0000-0000-0000-000000000000'
        ? `public/${proposalId}.pdf`
        : `${embaixadorId}/${proposalId}.pdf`
    let pdfUrl: string | null = null

    const { error: uploadErr } = await supabase.storage
      .from(BUCKET)
      .upload(pdfPath, pdfBuffer, {
        contentType: 'application/pdf',
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadErr) {
      // Se bucket não existir, segue sem URL pública (fallback).
      console.warn('[send-proposal] upload warning', uploadErr.message)
    } else {
      const { data: urlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(pdfPath)
      pdfUrl = urlData.publicUrl
    }

    // 7) Enviar e-mail (com PDF em anexo)
    const validStr = validUntil.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    const emailResult = await sendEmail({
      to: pdfData.clientEmail,
      subject: `Proposta EnergiaLivre — R$ ${economiaMensal}/mês de economia`,
      html: proposalEmailHtml({
        clientName: pdfData.clientName,
        embaixadorName: pdfData.embaixadorNome,
        gasto: pdfData.gastoMensal,
        economiaMensal,
        economiaAnual,
        validUntil: validStr,
        pdfUrl: pdfUrl ?? undefined,
      }),
      text: `Olá! Sua proposta EnergiaLivre está em anexo. Economia estimada: R$ ${economiaMensal}/mês. Proposta válida até ${validStr}.`,
      attachments: [
        {
          filename: `Proposta-EnergiaLivre-${proposalId.slice(0, 8)}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
      meta: { proposalId, embaixadorId, source: user ? 'embaixador-panel' : 'simulador-publico' },
    })

    // 8) Salvar auditoria na tabela `proposals`
    //    (só insere se for um embaixador real — não para o ID institucional)
    const ua = request.headers.get('user-agent') ?? null

    if (embaixadorId !== '00000000-0000-0000-0000-000000000000') {
      const { error: insertErr } = await (supabase
        .from('proposals')
        .insert({
          id: proposalId,
          embaixador_id: embaixadorId,
          client_name: pdfData.clientName || null,
          client_email: pdfData.clientEmail,
          client_whatsapp: pdfData.clientWhatsapp || null,
          client_cidade: pdfData.clientCidade || null,
          client_estado: pdfData.clientEstado || null,
          gasto_mensal: pdfData.gastoMensal,
          economia_mensal: economiaMensal,
          economia_anual: economiaAnual,
          percentual_economia: percentual,
          pdf_path: pdfPath,
          pdf_url: pdfUrl,
          send_status: emailResult.status,
          send_error: emailResult.error ?? null,
          sent_at: emailResult.status === 'sent' ? new Date().toISOString() : null,
          source: user ? 'embaixador-panel' : 'simulador-publico',
          valid_until: validUntil.toISOString(),
          ip_address: ip,
          user_agent: ua,
        } as any) as any)

      if (insertErr) {
        console.error('[send-proposal] insert error', insertErr)
        // Não bloqueia o retorno — o e-mail já foi (ou não) enviado.
      }
    }

    return NextResponse.json({
      success: true,
      proposalId,
      pdfUrl,
      validUntil: validUntil.toISOString(),
      sendStatus: emailResult.status,
      message:
        emailResult.status === 'sent'
          ? 'Proposta enviada por e-mail com sucesso.'
          : emailResult.status === 'queued'
            ? 'Proposta gerada. E-mail ficará em fila até o provedor estar disponível.'
            : 'Proposta gerada, mas houve falha no envio. Tente novamente.',
    })
  } catch (err: any) {
    console.error('[send-proposal] error', err)
    return NextResponse.json(
      { error: err?.message ?? 'Erro interno ao gerar proposta' },
      { status: 500 },
    )
  }
}
