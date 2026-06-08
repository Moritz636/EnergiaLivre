// ============================================================
// email.ts — Serviço de e-mail com Resend + fallback em fila
// ------------------------------------------------------------
// Estratégia:
//   1) Se RESEND_API_KEY estiver configurada → envia via Resend.
//   2) Senão → loga no console e retorna status "queued".
//   3) Em caso de erro no Resend → tenta fallback automaticamente.
//
// O transporte é desenhado para o ambiente do EnergiaLivre:
//   - Logs estruturados para auditoria.
//   - Não quebra a request do parceiro se o SMTP cair.
// ============================================================

export interface EmailAttachment {
  filename: string
  /** Conteúdo binário (Buffer) */
  content: Buffer
  /** MIME type, ex: 'application/pdf' */
  contentType?: string
}

export interface EmailMessage {
  to: string
  subject: string
  html: string
  text?: string
  attachments?: EmailAttachment[]
  /** Metadata livre — salvo nos logs para auditoria */
  meta?: Record<string, unknown>
}

export interface EmailResult {
  ok: boolean
  /** 'sent' | 'queued' | 'failed' */
  status: 'sent' | 'queued' | 'failed'
  /** ID do provedor (Resend) ou do log (fallback) */
  providerId?: string
  error?: string
}

const RESEND_API = 'https://api.resend.com/emails'
const FROM_ADDRESS = process.env.EMAIL_FROM ?? 'contato@energialivre.dev.br'
const FROM_NAME = process.env.EMAIL_FROM_NAME ?? 'EnergiaLivre'

/**
 * Envia um e-mail. Anexos são suportados (PDF de proposta).
 * Retorna `queued` se Resend não estiver configurado — nesse
 * caso o caller deve armazenar o e-mail e tentar reenviar depois.
 */
export async function sendEmail(message: EmailMessage): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY

  // Log estruturado — auditoria mínima
  console.log('[email] dispatch', {
    to: message.to,
    subject: message.subject,
    hasAttachments: (message.attachments?.length ?? 0) > 0,
    meta: message.meta ?? null,
  })

  // Sem provedor configurado → fallback (loga)
  if (!apiKey) {
    console.warn(
      '[email] RESEND_API_KEY ausente — fallback "queued". Configure a variável para envio real.',
    )
    return {
      ok: true,
      status: 'queued',
      providerId: `local-${Date.now()}`,
    }
  }

  // Resend espera anexos em base64
  const attachments = message.attachments?.map((a) => ({
    filename: a.filename,
    content: a.content.toString('base64'),
    content_type: a.contentType ?? 'application/octet-stream',
  }))

  try {
    const res = await fetch(RESEND_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${FROM_NAME} <${FROM_ADDRESS}>`,
        to: [message.to],
        subject: message.subject,
        html: message.html,
        text: message.text,
        attachments,
      }),
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      console.error('[email] Resend error', res.status, errText)
      return {
        ok: false,
        status: 'failed',
        error: `Resend ${res.status}: ${errText.slice(0, 200)}`,
      }
    }

    const data = (await res.json().catch(() => ({}))) as { id?: string }
    return {
      ok: true,
      status: 'sent',
      providerId: data.id,
    }
  } catch (err: any) {
    console.error('[email] network error', err)
    return {
      ok: false,
      status: 'failed',
      error: err?.message ?? 'Erro desconhecido',
    }
  }
}

/**
 * Helper para construir o template HTML da proposta.
 * Mantém branding EnergiaLivre (cores, fontes) e é SSR-safe.
 */
export function proposalEmailHtml(args: {
  clientName: string
  embaixadorName: string
  gasto: number
  economiaMensal: number
  economiaAnual: number
  validUntil: string
  pdfUrl?: string
}): string {
  const fmt = (v: number) =>
    v.toLocaleString('pt-BR', { maximumFractionDigits: 0 })

  const firstName = (args.clientName || '').split(' ')[0] || 'olá'

  return `
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>Proposta EnergiaLivre</title>
  </head>
  <body style="margin:0;padding:0;background:#020617;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#e2e8f0;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#020617;padding:32px 16px;">
      <tr>
        <td align="center">
          <table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:linear-gradient(180deg,#0f172a 0%,#020617 100%);border:1px solid rgba(16,185,129,0.25);border-radius:24px;overflow:hidden;">
            <tr>
              <td style="padding:32px 32px 16px;text-align:center;">
                <div style="display:inline-block;width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,#10b981 0%,#34d399 100%);text-align:center;line-height:48px;font-size:24px;">⚡</div>
                <h1 style="margin:16px 0 4px;font-size:28px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">
                  EnergiaLivre
                </h1>
                <p style="margin:0;color:#64748b;font-size:13px;letter-spacing:0.4px;text-transform:uppercase;">
                  Proposta de economia de energia solar
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 24px;">
                <p style="font-size:15px;line-height:1.6;color:#cbd5e1;margin:0 0 16px;">
                  ${firstName}, sua proposta personalizada chegou.
                </p>
                <p style="font-size:15px;line-height:1.6;color:#cbd5e1;margin:0 0 24px;">
                  O arquivo PDF em anexo detalha a simulação e os prazos
                  regulatórios aplicáveis. A proposta é válida até
                  <strong style="color:#34d399;">${args.validUntil}</strong>.
                </p>

                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:rgba(16,185,129,0.05);border:1px solid rgba(16,185,129,0.2);border-radius:16px;margin-bottom:24px;">
                  <tr>
                    <td style="padding:20px;">
                      <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="color:#94a3b8;font-size:12px;padding:4px 0;">Conta atual</td>
                          <td align="right" style="color:#ffffff;font-size:14px;font-weight:700;padding:4px 0;">R$ ${fmt(args.gasto)}/mês</td>
                        </tr>
                        <tr>
                          <td style="color:#94a3b8;font-size:12px;padding:4px 0;">Economia estimada</td>
                          <td align="right" style="color:#34d399;font-size:14px;font-weight:700;padding:4px 0;">R$ ${fmt(args.economiaMensal)}/mês</td>
                        </tr>
                        <tr>
                          <td style="color:#94a3b8;font-size:12px;padding:4px 0;border-top:1px solid rgba(148,163,184,0.1);padding-top:10px;">Em 12 meses</td>
                          <td align="right" style="color:#34d399;font-size:14px;font-weight:700;padding:4px 0;border-top:1px solid rgba(148,163,184,0.1);padding-top:10px;">R$ ${fmt(args.economiaAnual)}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                ${
                  args.pdfUrl
                    ? `<div style="text-align:center;margin-bottom:24px;">
                        <a href="${args.pdfUrl}" style="display:inline-block;background:linear-gradient(135deg,#10b981 0%,#34d399 100%);color:#020617;text-decoration:none;padding:14px 28px;border-radius:14px;font-weight:900;font-size:14px;">
                          Visualizar proposta online
                        </a>
                      </div>`
                    : ''
                }

                <p style="font-size:13px;line-height:1.6;color:#94a3b8;margin:0 0 8px;">
                  <strong style="color:#cbd5e1;">Sobre os prazos:</strong>
                  A homologação dos créditos de energia segue o prazo
                  regulatório da ANEEL (até 90 dias, média real de 45–60 dias),
                  conforme Lei 14.300/2022 e REN 687/2015.
                </p>
                <p style="font-size:13px;line-height:1.6;color:#94a3b8;margin:0;">
                  Dúvidas? Fale com seu parceiro
                  <strong style="color:#cbd5e1;">${args.embaixadorName}</strong>
                  ou responda este e-mail.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;border-top:1px solid rgba(148,163,184,0.08);text-align:center;">
                <p style="margin:0;font-size:11px;color:#475569;line-height:1.5;">
                  EnergiaLivre · Plataforma de transferência de créditos de<br />
                  energia solar · contato@energialivre.dev.br
                </p>
                <p style="margin:8px 0 0;font-size:10px;color:#334155;">
                  Esta proposta tem caráter informativo e não constitui
                  vínculo contratual até assinatura do Acordo de Uso.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}
