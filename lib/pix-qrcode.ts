// ============================================================
// lib/pix-qrcode — Geração de payload PIX (Copia e Cola)
// QR Code gerado via API externa (sem dependências npm)
// ============================================================

const PIX_KEY = '5584987858668'
const PIX_NAME = 'Energia Livre'
const PIX_CITY = 'NATAL'

/** CRC16-CCITT (0xFFFF) — padrão BR Code EMV */
function crc16Ccitt(payload: string): string {
  let crc = 0xffff
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) crc = (crc << 1) ^ 0x1021
      else crc <<= 1
      crc &= 0xffff
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

function tlv(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0')
  return `${id}${len}${value}`
}

export interface PixChargeInput {
  amount: number
  txid?: string
  description?: string
}

export interface PixChargeResult {
  /** Payload PIX copia e cola */
  payload: string
  /** QR Code como data:image/png;base64 */
  qrCodeBase64: string
  /** TXID usado */
  txid: string
}

/**
 * Gera payload PIX + QR Code para uma cobrança
 */
export async function generatePixCharge(input: PixChargeInput): Promise<PixChargeResult> {
  const txid = input.txid ?? `EL${Date.now().toString(36).toUpperCase()}`
  const amountStr = input.amount.toFixed(2)

  // Merchant Account Information (ID 26) — BR Code PIX
  const gui = tlv('00', 'br.gov.bcb.pix')
  const key = tlv('01', PIX_KEY)
  const merchantInfo = tlv('26', gui + key)

  // Additional Data (ID 62)
  const txidField = tlv('05', txid)
  const additionalData = tlv('62', txidField)

  // Monta payload sem CRC
  let payload = ''
  payload += tlv('00', '01')                                    // Payload Format Indicator
  payload += tlv('01', '12')                                    // Point of Initiation Method (12 = dinâmico)
  payload += merchantInfo                                        // Merchant Account Information
  payload += tlv('52', '0000')                                  // Merchant Category Code
  payload += tlv('53', '986')                                   // Transaction Currency (986 = BRL)
  payload += tlv('54', amountStr)                               // Transaction Amount
  payload += tlv('58', 'BR')                                    // Country Code
  payload += tlv('59', PIX_NAME)                                // Merchant Name
  payload += tlv('60', PIX_CITY)                                // Merchant City
  payload += additionalData                                     // Additional Data Field
  payload += tlv('63', '04')                                    // placeholder for CRC

  // Calcula CRC16
  const crc = crc16Ccitt(payload)
  payload = payload.slice(0, -4) + tlv('63', crc)

  // Gera QR Code via API pública
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(payload)}&format=png`
  const response = await fetch(qrUrl)
  if (!response.ok) throw new Error('Falha ao gerar QR Code')

  const buffer = await response.arrayBuffer()
  const base64 = Buffer.from(buffer).toString('base64')
  const qrCodeBase64 = `data:image/png;base64,${base64}`

  return { payload, qrCodeBase64, txid }
}

/**
 * Verifica se um payload é um QR Code PIX válido
 */
export function isPixPayload(payload: string): boolean {
  return /br\.gov\.bcb\.pix/i.test(payload) || /^000201/i.test(payload.slice(0, 10))
}
