// ============================================
// INVOICE PARSER - HEURISTICAS REGEX (SEM OCR)
// ============================================
// Extrai estado, concessionaria, valor, kWh e vencimento
// a partir do texto da fatura.
//
// Na vida real, isso seria o output de um OCR (Tesseract,
// Google Vision, AWS Textract, etc). Aqui o usuario cola
// o texto OU faz upload e nos caimos para um formulario
// de confirmacao manual.
//
// Esta funcao e util quando ja temos o texto (ex: PDF
// extraido, ou usuario colou no textarea).
// ============================================

export interface ExtractedInvoiceData {
  estado: string | null
  concessionaria: string | null
  valor_total: number | null
  kwh_mensal: number | null
  vencimento: string | null
  raw_matches: Record<string, string | null>
}

const ESTADOS_BRASILEIROS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

const CONCESSIONARIAS: Array<{ pattern: RegExp; name: string }> = [
  { pattern: /equatorial/i, name: 'Equatorial' },
  { pattern: /enel\s*(distribuicao|s\.p\.|rio|ceara|goias|sao\s*paulo)?/i, name: 'Enel' },
  { pattern: /cemig/i, name: 'Cemig' },
  { pattern: /cpfl/i, name: 'CPFL' },
  { pattern: /elektro/i, name: 'Elektro' },
  { pattern: /light\s*(servicos)?/i, name: 'Light' },
  { pattern: /ceee/i, name: 'CEEE' },
  { pattern: /copel/i, name: 'Copel' },
  { pattern: /celesc/i, name: 'Celesc' },
  { pattern: /celpe/i, name: 'Celpe' },
  { pattern: /coelba/i, name: 'Coelba' },
  { pattern: /cosern/i, name: 'Cosern' },
  { pattern: /eletrobras/i, name: 'Eletrobras' },
  { pattern: /energisa/i, name: 'Energisa' },
  { pattern: /edp/i, name: 'EDP' },
  { pattern: /sulgipe/i, name: 'Sulgipe' },
  { pattern: /cegero/i, name: 'Cegero' },
  { pattern: /amazonas\s*energia/i, name: 'Amazonas Energia' },
  { pattern: /cea\s*\(companhia\s*de\s*eletricidade\s*de\s*acre\)/i, name: 'CEA' },
]

export function parseInvoiceText(text: string): ExtractedInvoiceData {
  const cleaned = text.replace(/\s+/g, ' ').trim()

  // 1) Estado (sigla de UF)
  let estado: string | null = null
  const estadoMatch = cleaned.match(/\b(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)\b/)
  if (estadoMatch) {
    estado = estadoMatch[1]
  }

  // 2) Concessionaria
  let concessionaria: string | null = null
  for (const c of CONCESSIONARIAS) {
    if (c.pattern.test(cleaned)) {
      concessionaria = c.name
      break
    }
  }

  // 3) Valor total (R$ X,XX ou "TOTAL A PAGAR" seguido de valor)
  let valor_total: number | null = null
  const valorPatterns = [
    /(?:total\s*(?:a\s*pagar)?|valor\s*(?:a\s*pagar)?|total\s*geral)[:\s]*R?\$?\s*([\d.,]+)/i,
    /R\$\s*([\d]{1,3}(?:\.\d{3})*,\d{2})/,
    /R\$\s*([\d]+,\d{2})/,
  ]
  for (const pat of valorPatterns) {
    const m = cleaned.match(pat)
    if (m && m[1]) {
      const normalized = m[1].replace(/\./g, '').replace(',', '.')
      const n = parseFloat(normalized)
      if (!isNaN(n) && n > 0 && n < 100000) {
        valor_total = n
        break
      }
    }
  }

  // 4) kWh consumido no mes
  let kwh_mensal: number | null = null
  const kwhPatterns = [
    /(?:consumo|kwh|leitura)\s*(?:atual|do\s*mes|mensal)?[:\s]*([\d.]+)\s*kwh/i,
    /([\d.]+)\s*kwh/i,
  ]
  for (const pat of kwhPatterns) {
    const m = cleaned.match(pat)
    if (m && m[1]) {
      const n = parseInt(m[1].replace(/\./g, ''), 10)
      if (!isNaN(n) && n > 0 && n < 100000) {
        kwh_mensal = n
        break
      }
    }
  }

  // 5) Vencimento (data dd/mm/aaaa)
  let vencimento: string | null = null
  const vencMatch = cleaned.match(/(?:vencimento|vence\s*em|venc\.?)[:\s]*(\d{2})\/(\d{2})\/(\d{4})/i)
  if (vencMatch) {
    vencimento = `${vencMatch[3]}-${vencMatch[2]}-${vencMatch[1]}`
  } else {
    const vencMatch2 = cleaned.match(/\b(\d{2})\/(\d{2})\/(\d{4})\b/)
    if (vencMatch2) {
      vencimento = `${vencMatch2[3]}-${vencMatch2[2]}-${vencMatch2[1]}`
    }
  }

  return {
    estado,
    concessionaria,
    valor_total,
    kwh_mensal,
    vencimento,
    raw_matches: {
      estado,
      concessionaria,
      valor_total: valor_total !== null ? `R$ ${valor_total.toFixed(2)}` : null,
      kwh_mensal: kwh_mensal !== null ? `${kwh_mensal} kWh` : null,
      vencimento,
    },
  }
}

export function isCompleteExtraction(data: ExtractedInvoiceData): boolean {
  return (
    data.estado !== null &&
    data.concessionaria !== null &&
    data.valor_total !== null
  )
}

export const ESTADOS_VALIDOS = ESTADOS_BRASILEIROS
