// ============================================
// BARCODE PARSER - LINHA DIGITÁVEL + QR CODE FATURAS
// ============================================
// Padrões suportados:
//   - Linha digitável FEBRABAN (faturas de energia/água/etc) - 47 ou 48 dígitos
//   - QR Code padrão ANEEL (PIX COP) - pode conter payload JSON
//   - ITF (código de barras tradicional)
// Referência:
//   - Linha digitável: https://portal.febraban.org.br/pagina/3058/33/pt-br/layout-arquivo-retorno
//   - QR Code ANEEL: Resolução ANEEL 901/2023 (QR com chave PIX no padrão BR Code)
// ============================================

export type BarcodeType = 'linha_digitavel' | 'qrcode' | 'itf' | 'code128' | 'other'

export interface ParsedBarcode {
  tipo: BarcodeType
  /** Linha limpa (apenas dígitos) */
  raw: string
  /** Valor total detectado em R$ */
  valor: number | null
  /** Data de vencimento (ISO yyyy-mm-dd) */
  vencimento: string | null
  /** Chave PIX se detectada (padrão BR Code) */
  pixKey: string | null
  /** txid quando disponível */
  txid: string | null
  /** ID do documento (nosso uso) */
  documentId: string | null
  /** Beneficiário (concessionária) detectado por chave PIX (emails/telefones) */
  beneficiario: string | null
  /** Match de campos: 'ok' | 'parcial' | 'nenhum' */
  confidence: 'ok' | 'parcial' | 'nenhum'
  /** Detalhes brutos para debug */
  debug?: Record<string, string | null>
}

const DIGITS_ONLY = /^\d+$/

/**
 * Remove caracteres não numéricos
 */
export function cleanDigits(s: string): string {
  return s.replace(/[^0-9]/g, '')
}

/**
 * Detecta o tipo de código de barras e retorna os dados extraídos
 */
export function parseBarcode(payload: string): ParsedBarcode {
  const trimmed = (payload || '').trim()

  // 1) BR Code / PIX (EMV/BRCode) - começa com o cabeçalho 00020126...
  if (/^000201/i.test(cleanDigits(trimmed).slice(0, 20)) || /br\.gov\.bcb\.pix/i.test(trimmed)) {
    return parsePixCode(trimmed)
  }

  // 2) Linha digitável FEBRABAN
  const digits = cleanDigits(trimmed)
  if (digits.length === 47 || digits.length === 48) {
    return parseLinhaDigitavel(digits)
  }

  // 3) ITF (código de barras de barras) - 44 dígitos
  if (digits.length === 44) {
    return parseItfCode(digits)
  }

  // 4) Fallback: qualquer string numérica longa (>= 30 dígitos) — tenta extrair valor
  if (digits.length >= 30) {
    return parseFallbackNumeric(digits)
  }

  // 5) Outros
  return {
    tipo: 'other',
    raw: digits,
    valor: null,
    vencimento: null,
    pixKey: null,
    txid: null,
    documentId: null,
    beneficiario: null,
    confidence: 'nenhum',
  }
}

/**
 * Parse linha digitável FEBRABAN (47 ou 48 dígitos)
 * Formato: AAAAA.BBBBBB-X XXXXX.BBBBBB-X XXXXX.BBBBBB-X Y VVVVVVVVVVVVVV
 *   - AAAAA = código da concessionária
 *   - BBBBBB+B = nosso número / parcela
 *   - Y = dígito verificador geral
 *   - VVVVVVVVVVVVVV = valor (10 casas) + vencimento (4 casas) = 14 casas
 * Detalhes: https://www.febraban.org.br/PDFAnexos/item_anexo=308.pdf
 */
function parseLinhaDigitavel(digits: string): ParsedBarcode {
  // 48 dígitos inclui dígito verificador geral
  // 47 dígitos não inclui
  const hasDV = digits.length === 48
  const blocks = []
  let i = 0

  // Bloco 1: 10 dígitos + DV (1)
  blocks.push(digits.slice(i, i + 10)); i += 10
  blocks.push(digits.slice(i, i + 1)); i += 1
  // Bloco 2: 10 dígitos + DV (1)
  blocks.push(digits.slice(i, i + 10)); i += 10
  blocks.push(digits.slice(i, i + 1)); i += 1
  // Bloco 3: 10 dígitos + DV (1)
  blocks.push(digits.slice(i, i + 10)); i += 10
  blocks.push(digits.slice(i, i + 1)); i += 1
  // Bloco 4 (DV geral) - se presente
  let dv = ''
  if (hasDV) { dv = digits.slice(i, i + 1); i += 1 }
  // Bloco 5: Vencimento(4) + Valor(10) = 14 dígitos
  const tail14 = digits.slice(i, i + 14)
  if (tail14.length < 14) {
    return {
      tipo: 'linha_digitavel',
      raw: digits,
      valor: null,
      vencimento: null,
      pixKey: null,
      txid: null,
      documentId: digits.slice(0, 20),
      beneficiario: null,
      confidence: 'nenhum',
    }
  }

  const vencDigits = tail14.slice(0, 4)
  const valorDigits = tail14.slice(4, 14)
  const valorCents = parseInt(valorDigits, 10)
  const valor = Number.isFinite(valorCents) ? valorCents / 100 : null
  const vencBaseDays = parseInt(vencDigits, 10)
  // Base: 1997-10-07 (dia 0 = 07/10/1997 conforme padrão FEBRABAN)
  const vencimento = vencBaseDays > 0 ? daysToIso(vencBaseDays) : null

  // Nosso número / ID
  const documentId = (blocks[0] + (blocks[2] || '')).slice(0, 20)

  return {
    tipo: 'linha_digitavel',
    raw: digits,
    valor,
    vencimento,
    pixKey: null,
    txid: dv || null,
    documentId,
    beneficiario: null,
    confidence: valor !== null ? 'ok' : 'parcial',
    debug: {
      vencDigits,
      valorDigits,
      dv,
    },
  }
}

/**
 * Parse ITF (código de barras tradicional) - 44 dígitos
 */
function parseItfCode(digits: string): ParsedBarcode {
  // Padrão FEBRABAN ITF:
  // 3 = moeda (9 = Real)
  // 4 = DV
  // 5-15 = vencimento (fator 1000 + dias desde 1997-10-07)
  // 16-25 = valor (10 casas, em centavos)
  // 26-43 = código do documento (com 1 DV)
  // 44 = DV geral
  if (digits.length !== 44) {
    return {
      tipo: 'itf',
      raw: digits,
      valor: null,
      vencimento: null,
      pixKey: null,
      txid: null,
      documentId: digits.slice(0, 20),
      beneficiario: null,
      confidence: 'nenhum',
    }
  }
  const moeda = digits.slice(0, 1)
  const fator = parseInt(digits.slice(5, 9), 10)
  const valorCents = parseInt(digits.slice(9, 19), 10)
  const valor = Number.isFinite(valorCents) ? valorCents / 100 : null
  const vencimento = (moeda === '9' && fator >= 1000) ? daysToIso(fator) : null
  const documentId = digits.slice(19, 43)

  return {
    tipo: 'itf',
    raw: digits,
    valor,
    vencimento,
    pixKey: null,
    txid: null,
    documentId,
    beneficiario: null,
    confidence: valor !== null ? (moeda === '9' && fator >= 1000 ? 'ok' : 'parcial') : 'nenhum',
    debug: { moeda, fator: String(fator) },
  }
}

/**
 * Fallback: tenta extrair valor de qualquer string numérica longa
 */
function parseFallbackNumeric(digits: string): ParsedBarcode {
  const len = digits.length
  let valor: number | null = null
  let vencimento: string | null = null
  if (len >= 14) {
    const tail14 = digits.slice(-14)
    const venc4 = parseInt(tail14.slice(0, 4), 10)
    const val10 = parseInt(tail14.slice(4, 14), 10)
    if (Number.isFinite(val10) && val10 > 0) {
      valor = val10 / 100
      if (venc4 > 1000) vencimento = daysToIso(venc4)
    }
  }
  if (valor === null && len >= 10) {
    const val10 = parseInt(digits.slice(-10), 10)
    if (Number.isFinite(val10) && val10 > 0) valor = val10 / 100
  }
  return {
    tipo: 'other', raw: digits, valor, vencimento,
    pixKey: null, txid: null, documentId: digits.slice(0, 20),
    beneficiario: null,
    confidence: valor !== null ? 'parcial' : 'nenhum',
    debug: { fallback: 'true', len: String(len) },
  }
}

/**
 * Parse BR Code / PIX EMV
 * Implementação simplificada - extrai valor, txid e chave PIX
 * Estrutura padrão: ID (2 chars) + Length (2) + Value
 */
function parsePixCode(payload: string): ParsedBarcode {
  // Caso 1: URL /BR Code com payload
  // ex: 00020126580014br.gov.bcb.pix0136...520400005303986540...
  // Caso 2: JSON (alguns apps)
  try {
    const parsed = JSON.parse(payload)
    if (typeof parsed === 'object' && parsed !== null) {
      return {
        tipo: 'qrcode',
        raw: payload,
        valor: numberOrNull(parsed.amount ?? parsed.value),
        vencimento: null,
        pixKey: stringOrNull(parsed.pixKey ?? parsed.key),
        txid: stringOrNull(parsed.txid ?? parsed.transactionId),
        documentId: null,
        beneficiario: null,
        confidence: 'parcial',
      }
    }
  } catch {
    // não é JSON, tenta como EMV
  }

  // Implementação EMV TLV (Tag-Length-Value)
  const result: ParsedBarcode = {
    tipo: 'qrcode',
    raw: payload,
    valor: null,
    vencimento: null,
    pixKey: null,
    txid: null,
    documentId: null,
    beneficiario: null,
    confidence: 'nenhum',
  }

  try {
    let i = 0
    const s = payload
    while (i < s.length) {
      const id = s.slice(i, i + 2); i += 2
      if (i + 2 > s.length) break
      const lenStr = s.slice(i, i + 2); i += 2
      const len = parseInt(lenStr, 10)
      if (!Number.isFinite(len)) break
      const value = s.slice(i, i + len); i += len

      if (id === '26') {
        // Merchant Account Information (pode conter GUI do BR Code)
        // GUI 00 = br.gov.bcb.pix
        const sub = value
        if (sub.startsWith('0014br.gov.bcb.pix')) {
          const pixKey = sub.slice(18)
          result.pixKey = pixKey
        }
      } else if (id === '54') {
        // 54 = valor
        const n = parseFloat(value)
        if (Number.isFinite(n)) result.valor = n
      } else if (id === '62') {
        // 62 = adicionais (txid geralmente está aqui em 05)
        // Sub-IDs dentro de 62
        let j = 0
        while (j < value.length) {
          const subId = value.slice(j, j + 2); j += 2
          const subLen = parseInt(value.slice(j, j + 2), 10); j += 2
          const subVal = value.slice(j, j + subLen); j += subLen
          if (subId === '05') {
            result.txid = subVal
          }
        }
      } else if (id === '59') {
        // Nome do beneficiário
        result.beneficiario = value
      }
    }

    result.confidence = result.valor !== null ? 'ok' : (result.pixKey ? 'parcial' : 'nenhum')
  } catch {
    result.confidence = 'nenhum'
  }

  return result
}

function numberOrNull(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string') {
    const n = parseFloat(v)
    return Number.isFinite(n) ? n : null
  }
  return null
}

function stringOrNull(v: unknown): string | null {
  if (typeof v === 'string' && v.length > 0) return v
  return null
}

/**
 * Converte dias desde 1997-10-07 em data ISO
 */
function daysToIso(days: number): string | null {
  try {
    const base = new Date(Date.UTC(1997, 9, 7)) // mês 9 = outubro
    const target = new Date(base.getTime() + days * 86400000)
    if (isNaN(target.getTime())) return null
    return target.toISOString().slice(0, 10)
  } catch {
    return null
  }
}

/**
 * Calcula dias entre 1997-10-07 e uma data ISO (yyyy-mm-dd)
 */
export function isoToDays(iso: string): number {
  try {
    const base = new Date(Date.UTC(1997, 9, 7))
    const target = new Date(iso + 'T00:00:00Z')
    if (isNaN(target.getTime())) return 0
    return Math.floor((target.getTime() - base.getTime()) / 86400000)
  } catch {
    return 0
  }
}
