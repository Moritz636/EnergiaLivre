// ============================================================
// pdf/proposal.ts — Gerador de PDF de proposta EnergiaLivre
// ------------------------------------------------------------
// Gera um PDF premium (A4) com:
//   • Logo EnergiaLivre (desenhada via primitivas).
//   • Identificação do cliente + dados do embaixador.
//   • Simulação de economia (R$ gasto → economia mensal/anual).
//   • Prazos regulatórios ANEEL (Lei 14.300/2022, REN 687/2015).
//   • Validade de 48h destacada no topo.
//   • Assinaturas e QR de contato.
//
// Não usa fontes externas (apenas Helvetica padrão) para
// manter o bundle pequeno e evitar download de .ttf.
// ============================================================

import {
  PDFDocument,
  PDFFont,
  RGB,
  StandardFonts,
  rgb,
} from 'pdf-lib'

// Formatador BRL local (evita importar de pastas privadas do simulador)
const formatBRL = (value: number | string): string => {
  const n = typeof value === 'string' ? Number(value) : value
  if (!Number.isFinite(n)) return '0'
  return Math.round(n).toLocaleString('pt-BR', { maximumFractionDigits: 0 })
}
const formatCurrency = (value: number | string): string =>
  `R$ ${formatBRL(value)}`

// Cores da marca (em RGB 0..1)
const COLORS = {
  bgDark: rgb(0.008, 0.024, 0.09),       // #020617
  emerald: rgb(0.063, 0.725, 0.506),     // #10b981
  emeraldLight: rgb(0.204, 0.827, 0.6),  // #34d399
  cyan: rgb(0.133, 0.827, 0.933),        // #22d3ee
  white: rgb(1, 1, 1),
  slate100: rgb(0.941, 0.961, 0.980),
  slate300: rgb(0.804, 0.839, 0.871),
  slate400: rgb(0.580, 0.639, 0.722),
  slate500: rgb(0.392, 0.455, 0.545),
  slate800: rgb(0.118, 0.161, 0.231),
  amber: rgb(0.961, 0.620, 0.043),
}

// Layout
const PAGE_WIDTH = 595.28    // A4
const PAGE_HEIGHT = 841.89   // A4
const MARGIN_X = 40
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2

export interface ProposalData {
  // Embaixador
  embaixadorNome: string
  embaixadorEmail: string
  embaixadorCidade: string
  embaixadorEstado: string
  // Cliente
  clientName: string
  clientEmail: string
  clientWhatsapp?: string
  clientCidade?: string
  clientEstado?: string
  // Simulação
  gastoMensal: number
  economiaMensal: number
  economiaAnual: number
  percentualEconomia: number
  contaComEnergiaLivre: number
  // Metadata
  proposalId: string
  validUntil: Date
  issuedAt: Date
  /** URL público do PDF (para footer / QR) */
  pdfUrl?: string
}

/**
 * Gera o PDF em memória (Uint8Array).
 */
export async function generateProposalPdf(
  data: ProposalData,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  doc.setTitle(`Proposta EnergiaLivre - ${data.clientName || data.clientEmail}`)
  doc.setAuthor('EnergiaLivre')
  doc.setSubject('Proposta de economia de energia solar por assinatura')
  doc.setCreator('EnergiaLivre Platform')
  doc.setProducer('EnergiaLivre Platform')
  doc.setCreationDate(data.issuedAt)
  doc.setModificationDate(data.issuedAt)

  const fontRegular = await doc.embedFont(StandardFonts.Helvetica)
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold)

  // Página 1 — Capa + simulação
  const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  drawBackground(page)
  drawLogo(page, fontBold)
  drawTopValidityBadge(page, fontBold, data.validUntil)
  drawProposalTitle(page, fontBold, fontRegular)
  drawClientEmbaixador(page, fontBold, fontRegular, data)
  drawSimulationBox(page, fontBold, fontRegular, data)
  drawRegulatoryBlock(page, fontBold, fontRegular, data)
  drawSignatureFooter(page, fontBold, fontRegular, data)
  drawPageFooter(page, fontRegular, data, 1)

  // Página 2 — Prazos, direitos e referências legais
  const page2 = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  drawBackground(page2)
  drawLogo(page2, fontBold)
  drawSectionTitle(page2, fontBold, 'Prazos e Marco Regulatório', 90)
  drawRegulatoryDetail(page2, fontBold, fontRegular)
  drawSectionTitle(page2, fontBold, 'Como funciona a economia', 380)
  drawHowItWorks(page2, fontBold, fontRegular)
  drawPageFooter(page2, fontRegular, data, 2)

  return await doc.save()
}

// ============================================================
// DRAW HELPERS
// ============================================================

function drawBackground(page: any) {
  // Fundo base
  page.drawRectangle({
    x: 0,
    y: 0,
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    color: COLORS.bgDark,
  })
}

function drawLogo(page: any, fontBold: PDFFont) {
  const y = PAGE_HEIGHT - 50
  // Quadradinho emerald com bolt
  page.drawRectangle({
    x: MARGIN_X,
    y: y - 22,
    width: 22,
    height: 22,
    color: COLORS.emerald,
    borderColor: COLORS.emerald,
    borderWidth: 0,
  })
  // ⚡ símbolo (Unicode U+26A1) — Helvetica suporta
  page.drawText('⚡', {
    x: MARGIN_X + 5,
    y: y - 18,
    size: 14,
    font: fontBold,
    color: COLORS.bgDark,
  })
  page.drawText('EnergiaLivre', {
    x: MARGIN_X + 30,
    y: y - 17,
    size: 14,
    font: fontBold,
    color: COLORS.white,
  })
  // Tag "Proposta"
  page.drawRectangle({
    x: MARGIN_X + 120,
    y: y - 16,
    width: 56,
    height: 14,
    color: COLORS.emerald,
    opacity: 0.18,
    borderColor: COLORS.emerald,
    borderWidth: 0.5,
    borderOpacity: 0.45,
  })
  page.drawText('PROPOSTA', {
    x: MARGIN_X + 128,
    y: y - 12,
    size: 8,
    font: fontBold,
    color: COLORS.emeraldLight,
  })
}

function drawTopValidityBadge(
  page: any,
  fontBold: PDFFont,
  validUntil: Date,
) {
  const y = PAGE_HEIGHT - 90
  const validStr = validUntil.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  const text = `⚡  VÁLIDA POR 48H  —  Expira em ${validStr}`
  // Fundo amber com opacidade
  page.drawRectangle({
    x: MARGIN_X,
    y: y - 4,
    width: CONTENT_WIDTH,
    height: 28,
    color: COLORS.amber,
    opacity: 0.14,
    borderColor: COLORS.amber,
    borderWidth: 0.6,
    borderOpacity: 0.55,
  })
  const textWidth = fontBold.widthOfTextAtSize(text, 10)
  page.drawText(text, {
    x: MARGIN_X + (CONTENT_WIDTH - textWidth) / 2,
    y: y + 6,
    size: 10,
    font: fontBold,
    color: COLORS.amber,
  })
}

function drawProposalTitle(
  page: any,
  fontBold: PDFFont,
  fontRegular: PDFFont,
) {
  const y = PAGE_HEIGHT - 145
  page.drawText('Proposta de Economia de Energia Solar', {
    x: MARGIN_X,
    y: y,
    size: 22,
    font: fontBold,
    color: COLORS.white,
  })
  page.drawText(
    'Créditos de energia limpa por assinatura, sem obras, sem investimento.',
    {
      x: MARGIN_X,
      y: y - 18,
      size: 10,
      font: fontRegular,
      color: COLORS.slate400,
    },
  )
}

function drawClientEmbaixador(
  page: any,
  fontBold: PDFFont,
  fontRegular: PDFFont,
  data: ProposalData,
) {
  const y = PAGE_HEIGHT - 200
  // Coluna Cliente
  drawLabel(page, fontBold, 'CLIENTE', MARGIN_X, y)
  const cliY = y - 16
  page.drawText(data.clientName || '—', {
    x: MARGIN_X,
    y: cliY,
    size: 12,
    font: fontBold,
    color: COLORS.white,
  })
  page.drawText(data.clientEmail, {
    x: MARGIN_X,
    y: cliY - 14,
    size: 9,
    font: fontRegular,
    color: COLORS.slate300,
  })
  if (data.clientWhatsapp) {
    page.drawText(`WhatsApp: ${data.clientWhatsapp}`, {
      x: MARGIN_X,
      y: cliY - 26,
      size: 9,
      font: fontRegular,
      color: COLORS.slate300,
    })
  }
  const local =
    [data.clientCidade, data.clientEstado].filter(Boolean).join(' / ') || '—'
  page.drawText(`Localização: ${local}`, {
    x: MARGIN_X,
    y: cliY - 38,
    size: 9,
    font: fontRegular,
    color: COLORS.slate300,
  })

  // Coluna Embaixador
  const col2X = PAGE_WIDTH / 2 + 10
  drawLabel(page, fontBold, 'EMBAIXADOR', col2X, y)
  const embY = y - 16
  page.drawText(data.embaixadorNome, {
    x: col2X,
    y: embY,
    size: 12,
    font: fontBold,
    color: COLORS.white,
  })
  page.drawText(data.embaixadorEmail, {
    x: col2X,
    y: embY - 14,
    size: 9,
    font: fontRegular,
    color: COLORS.slate300,
  })
  const embLocal =
    [data.embaixadorCidade, data.embaixadorEstado]
      .filter(Boolean)
      .join(' / ') || '—'
  page.drawText(`Base: ${embLocal}`, {
    x: col2X,
    y: embY - 26,
    size: 9,
    font: fontRegular,
    color: COLORS.slate300,
  })

  // Proposta ID
  page.drawText(`Proposta #${data.proposalId.slice(0, 8).toUpperCase()}`, {
    x: col2X,
    y: embY - 38,
    size: 8,
    font: fontRegular,
    color: COLORS.slate500,
  })
}

function drawLabel(
  page: any,
  fontBold: PDFFont,
  text: string,
  x: number,
  y: number,
) {
  page.drawText(text, {
    x,
    y,
    size: 8,
    font: fontBold,
    color: COLORS.slate500,
  })
}

function drawSimulationBox(
  page: any,
  fontBold: PDFFont,
  fontRegular: PDFFont,
  data: ProposalData,
) {
  const y = PAGE_HEIGHT - 300
  const boxH = 165
  // Card container
  page.drawRectangle({
    x: MARGIN_X,
    y: y - boxH,
    width: CONTENT_WIDTH,
    height: boxH,
    color: COLORS.slate800,
    opacity: 0.45,
    borderColor: COLORS.emerald,
    borderWidth: 0.6,
    borderOpacity: 0.45,
  })

  // Título
  page.drawText('Simulação de Economia', {
    x: MARGIN_X + 16,
    y: y - 18,
    size: 11,
    font: fontBold,
    color: COLORS.emeraldLight,
  })

  // 3 colunas
  const col1X = MARGIN_X + 16
  const col2X = MARGIN_X + 16 + 175
  const col3X = MARGIN_X + 16 + 350
  const row1Y = y - 55
  const row2Y = y - 95
  const row3Y = y - 130

  // Coluna 1 — Conta atual
  drawLabel(page, fontBold, 'CONTA ATUAL', col1X, row1Y + 18)
  page.drawText(`R$ ${formatBRL(data.gastoMensal)}`, {
    x: col1X,
    y: row1Y,
    size: 22,
    font: fontBold,
    color: COLORS.slate300,
  })
  page.drawText('por mês, com a distribuidora', {
    x: col1X,
    y: row1Y - 14,
    size: 9,
    font: fontRegular,
    color: COLORS.slate400,
  })

  // Seta
  page.drawText('→', {
    x: col1X + 130,
    y: row1Y + 4,
    size: 24,
    font: fontBold,
    color: COLORS.emerald,
  })

  // Coluna 2 — Nova conta
  drawLabel(page, fontBold, 'NOVA CONTA', col2X, row1Y + 18)
  page.drawText(`R$ ${formatBRL(data.contaComEnergiaLivre)}`, {
    x: col2X,
    y: row1Y,
    size: 22,
    font: fontBold,
    color: COLORS.white,
  })
  page.drawText('com EnergiaLivre, mesmo consumo', {
    x: col2X,
    y: row1Y - 14,
    size: 9,
    font: fontRegular,
    color: COLORS.slate400,
  })

  // Coluna 3 — Economia mensal
  drawLabel(page, fontBold, 'ECONOMIA MENSAL', col3X, row1Y + 18)
  page.drawText(`R$ ${formatBRL(data.economiaMensal)}`, {
    x: col3X,
    y: row1Y,
    size: 22,
    font: fontBold,
    color: COLORS.emeraldLight,
  })
  page.drawText(`−${data.percentualEconomia.toFixed(0)}% na fatura`, {
    x: col3X,
    y: row1Y - 14,
    size: 9,
    font: fontRegular,
    color: COLORS.emerald,
  })

  // Linha 2 — Economia anual
  drawLabel(page, fontBold, 'ECONOMIA ANUAL (12 MESES)', col1X, row2Y + 18)
  page.drawText(`R$ ${formatBRL(data.economiaAnual)}`, {
    x: col1X,
    y: row2Y,
    size: 20,
    font: fontBold,
    color: COLORS.emerald,
  })

  // Economia 5 anos
  drawLabel(page, fontBold, 'PROJEÇÃO 5 ANOS', col2X, row2Y + 18)
  page.drawText(`R$ ${formatBRL(data.economiaAnual * 5)}`, {
    x: col2X,
    y: row2Y,
    size: 20,
    font: fontBold,
    color: COLORS.cyan,
  })

  // CO2 evitado
  drawLabel(page, fontBold, 'CO₂ EVITADO/ANO', col3X, row2Y + 18)
  page.drawText(`${Math.round(data.economiaAnual * 0.18)} kg`, {
    x: col3X,
    y: row2Y,
    size: 20,
    font: fontBold,
    color: COLORS.cyan,
  })

  // Nota de rodapé do card
  page.drawText(
    `Simulação baseada em até ${data.percentualEconomia.toFixed(0)}% de desconto — média de mercado em 2026.`,
    {
      x: MARGIN_X + 16,
      y: row3Y,
      size: 8,
      font: fontRegular,
      color: COLORS.slate500,
    },
  )
}

function drawRegulatoryBlock(
  page: any,
  fontBold: PDFFont,
  fontRegular: PDFFont,
  data: ProposalData,
) {
  const y = PAGE_HEIGHT - 500
  const boxH = 110
  page.drawRectangle({
    x: MARGIN_X,
    y: y - boxH,
    width: CONTENT_WIDTH,
    height: boxH,
    color: COLORS.amber,
    opacity: 0.06,
    borderColor: COLORS.amber,
    borderWidth: 0.6,
    borderOpacity: 0.5,
  })

  // Tag "PRAZO REGULATÓRIO"
  page.drawRectangle({
    x: MARGIN_X + 12,
    y: y - 22,
    width: 120,
    height: 14,
    color: COLORS.amber,
    opacity: 0.2,
    borderColor: COLORS.amber,
    borderWidth: 0.5,
    borderOpacity: 0.6,
  })
  page.drawText('PRAZO REGULATÓRIO', {
    x: MARGIN_X + 18,
    y: y - 18,
    size: 8,
    font: fontBold,
    color: COLORS.amber,
  })

  page.drawText('Até 90 dias para começar a economizar', {
    x: MARGIN_X + 12,
    y: y - 42,
    size: 13,
    font: fontBold,
    color: COLORS.white,
  })
  page.drawText(
    'A homologação dos créditos de energia segue o prazo regulatório da ANEEL.\n' +
      'Na prática, a média é de 45 a 60 dias após a adesão. Sua vaga fica\n' +
      'garantida desde o dia 1 e a economia retroage ao início do processo.',
    {
      x: MARGIN_X + 12,
      y: y - 60,
      size: 9.5,
      font: fontRegular,
      color: COLORS.slate300,
      lineHeight: 13,
    },
  )
  page.drawText(
    'Base legal: Lei 14.300/2022 · REN 687/2015 · CDC art. 46-54 · LGPD Lei 13.709/2018',
    {
      x: MARGIN_X + 12,
      y: y - 98,
      size: 7.5,
      font: fontRegular,
      color: COLORS.slate500,
    },
  )
}

function drawSignatureFooter(
  page: any,
  fontBold: PDFFont,
  fontRegular: PDFFont,
  data: ProposalData,
) {
  const y = 140
  // Linha
  page.drawLine({
    start: { x: MARGIN_X, y: y + 50 },
    end: { x: PAGE_WIDTH - MARGIN_X, y: y + 50 },
    thickness: 0.5,
    color: COLORS.slate500,
    opacity: 0.4,
  })

  // 2 colunas de assinatura
  const col1X = MARGIN_X
  const col2X = PAGE_WIDTH / 2 + 10
  const lineW = (CONTENT_WIDTH - 20) / 2

  // Linha 1 do cliente
  page.drawLine({
    start: { x: col1X, y: y + 18 },
    end: { x: col1X + lineW, y: y + 18 },
    thickness: 0.5,
    color: COLORS.slate500,
  })
  page.drawText('Cliente', {
    x: col1X,
    y: y + 4,
    size: 8,
    font: fontBold,
    color: COLORS.slate500,
  })
  page.drawText(data.clientName, {
    x: col1X,
    y: y - 8,
    size: 9,
    font: fontRegular,
    color: COLORS.slate300,
  })

  // Linha do embaixador
  page.drawLine({
    start: { x: col2X, y: y + 18 },
    end: { x: col2X + lineW, y: y + 18 },
    thickness: 0.5,
    color: COLORS.slate500,
  })
  page.drawText('Embaixador EnergiaLivre', {
    x: col2X,
    y: y + 4,
    size: 8,
    font: fontBold,
    color: COLORS.slate500,
  })
  page.drawText(data.embaixadorNome, {
    x: col2X,
    y: y - 8,
    size: 9,
    font: fontRegular,
    color: COLORS.slate300,
  })

  // Texto legal
  page.drawText(
    'Ao assinar, o cliente declara estar ciente dos prazos regulatórios e do modelo de transferência de créditos de energia solar. ' +
      'Proposta válida por 48h. Após esse prazo, a simulação deve ser refeita.',
    {
      x: MARGIN_X,
      y: 50,
      size: 7.5,
      font: fontRegular,
      color: COLORS.slate500,
      lineHeight: 11,
    },
  )
}

function drawPageFooter(
  page: any,
  fontRegular: PDFFont,
  data: ProposalData,
  pageNum: number,
) {
  const y = 24
  const issued = data.issuedAt.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  page.drawText(
    `Emitida em ${issued}  ·  Proposta #${data.proposalId.slice(0, 8).toUpperCase()}  ·  Página ${pageNum}/2`,
    {
      x: MARGIN_X,
      y,
      size: 7.5,
      font: fontRegular,
      color: COLORS.slate500,
    },
  )
  if (data.pdfUrl) {
    page.drawText(data.pdfUrl, {
      x: MARGIN_X,
      y: y - 10,
      size: 6.5,
      font: fontRegular,
      color: COLORS.slate500,
    })
  }
  page.drawText('EnergiaLivre · energia limpa por assinatura', {
    x: PAGE_WIDTH - MARGIN_X - 130,
    y,
    size: 7.5,
    font: fontRegular,
    color: COLORS.slate500,
  })
}

function drawSectionTitle(
  page: any,
  fontBold: PDFFont,
  title: string,
  yPos: number,
) {
  const y = PAGE_HEIGHT - yPos
  page.drawText(title, {
    x: MARGIN_X,
    y,
    size: 16,
    font: fontBold,
    color: COLORS.white,
  })
  // Linha decorativa
  page.drawRectangle({
    x: MARGIN_X,
    y: y - 6,
    width: 30,
    height: 2,
    color: COLORS.emerald,
  })
}

function drawRegulatoryDetail(page: any, fontBold: PDFFont, fontRegular: PDFFont) {
  const y = PAGE_HEIGHT - 130
  const items: Array<{ label: string; text: string }> = [
    {
      label: 'Lei 14.300/2022',
      text:
        'Marco legal da microgeração e minigeração distribuída. Regulamenta o sistema de ' +
        'compensação de energia elétrica (SCEEE) e permite que os créditos gerados por uma ' +
        'usina sejam alocados a consumidores em outras unidades, desde que na mesma área de ' +
        'concessão da distribuidora.',
    },
    {
      label: 'REN 687/2015',
      text:
        'Resolução Normativa da ANEEL que disciplina a geração distribuída. Define as regras ' +
        'de homologação, prazos máximos e responsabilidades de cada parte (consumidor, gerador, ' +
        'distribuidora). É o regulamento que viabiliza a economia do modelo EnergiaLivre.',
    },
    {
      label: 'Prazo de homologação',
      text:
        'A distribuidora tem até 90 dias para analisar e homologar a troca de titularidade ' +
        'dos créditos. Na prática, a média do setor é de 45 a 60 dias. Durante esse período, ' +
        'o cliente continua recebendo a fatura normal e a economia retroage ao início do processo.',
    },
    {
      label: 'Proteção ao consumidor',
      text:
        'O Código de Defesa do Consumidor (Lei 8.078/90) e a LGPD (Lei 13.709/2018) garantem ' +
        'o sigilo dos dados, o direito de arrependimento em até 7 dias e a transparência ' +
        'contratual integral.',
    },
  ]

  let currentY = y
  for (const item of items) {
    page.drawText(item.label, {
      x: MARGIN_X,
      y: currentY,
      size: 11,
      font: fontBold,
      color: COLORS.emeraldLight,
    })
    // Wrap manual do texto
    const lines = wrapText(item.text, 92)
    let lineY = currentY - 14
    for (const line of lines) {
      page.drawText(line, {
        x: MARGIN_X,
        y: lineY,
        size: 9,
        font: fontRegular,
        color: COLORS.slate300,
      })
      lineY -= 12
    }
    currentY = lineY - 12
  }
}

function drawHowItWorks(page: any, fontBold: PDFFont, fontRegular: PDFFont) {
  const y = PAGE_HEIGHT - 430
  const steps: Array<{ n: string; t: string; d: string }> = [
    {
      n: '1',
      t: 'Adesão digital',
      d: 'O cliente assina o Acordo de Uso e Uso de Dados online (LGPD).',
    },
    {
      n: '2',
      t: 'Homologação ANEEL',
      d: 'Solicitamos a troca de titularidade dos créditos na distribuidora.',
    },
    {
      n: '3',
      t: 'Créditos alocados',
      d: 'Os créditos de uma usina parceira começam a abater sua fatura.',
    },
    {
      n: '4',
      t: 'Economia na conta',
      d: 'Você vê o desconto aplicado automaticamente na fatura da distribuidora.',
    },
  ]
  let curX = MARGIN_X
  const cellW = (CONTENT_WIDTH - 20) / 4
  for (const step of steps) {
    // Círculo com número
    page.drawCircle({
      x: curX + 14,
      y: y - 12,
      size: 14,
      color: COLORS.emerald,
      opacity: 0.2,
      borderColor: COLORS.emerald,
      borderWidth: 0.8,
      borderOpacity: 0.6,
    })
    page.drawText(step.n, {
      x: curX + 11,
      y: y - 16,
      size: 12,
      font: fontBold,
      color: COLORS.emeraldLight,
    })
    page.drawText(step.t, {
      x: curX + 34,
      y: y - 8,
      size: 10,
      font: fontBold,
      color: COLORS.white,
    })
    const lines = wrapText(step.d, 24)
    let lineY = y - 24
    for (const line of lines) {
      page.drawText(line, {
        x: curX,
        y: lineY,
        size: 8,
        font: fontRegular,
        color: COLORS.slate400,
      })
      lineY -= 10
    }
    curX += cellW + 5
  }
}

/**
 * Quebra de texto manual (sem lib externa). Limita por caracteres.
 */
function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxChars) {
      if (current) lines.push(current)
      current = word
    } else {
      current = current ? current + ' ' + word : word
    }
  }
  if (current) lines.push(current)
  return lines
}

// Re-export do tipo RGB para uso externo se necessário
export type { RGB }
