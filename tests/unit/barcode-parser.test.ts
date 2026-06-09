import { describe, it, expect } from 'vitest'
import { parseBarcode, cleanDigits } from '@/lib/barcode-parser'

describe('cleanDigits', () => {
  it('remove non-numeric characters', () => {
    expect(cleanDigits('00190.00009 05423')).toBe('001900000905423')
  })

  it('keeps only digits', () => {
    expect(cleanDigits('abc123def456')).toBe('123456')
  })

  it('returns empty string for no digits', () => {
    expect(cleanDigits('abc')).toBe('')
  })
})

describe('parseBarcode - linha digitavel (47 digits)', () => {
  it('parses a 47-digit linha digitavel', () => {
    const result = parseBarcode('00190000090542300012345678901234567890123456789')
    expect(result.tipo).toBe('linha_digitavel')
    expect(result.valor).toBeTypeOf('number')
    expect(result.confidence).toBe('ok')
  })
})

describe('parseBarcode - linha digitavel (48 digits)', () => {
  it('parses a 48-digit linha digitavel with DV', () => {
    const result = parseBarcode('001900000905423000123456789012345678901234567890')
    expect(result.tipo).toBe('linha_digitavel')
    expect(result.confidence).toBe('ok')
  })
})

describe('parseBarcode - ITF (44 digits)', () => {
  it('parses standard ITF with moeda=9', () => {
    const result = parseBarcode('91234567890012345678901234567890123456789012')
    expect(result.tipo).toBe('itf')
    expect(result.valor).toBeTypeOf('number')
  })

  it('parses ITF with non-9 moeda (lenient fallback)', () => {
    const result = parseBarcode('81234567890012345678901234567890123456789012')
    expect(result.tipo).toBe('itf')
    expect(result.valor).toBeTypeOf('number')
    expect(result.confidence).toBe('parcial')
  })
})

describe('parseBarcode - PIX/BR Code', () => {
  it('detects BR Code starting with 000201', () => {
    const result = parseBarcode('00020126580014br.gov.bcb.pix0136test')
    expect(result.tipo).toBe('qrcode')
  })
})

describe('parseBarcode - fallback numeric', () => {
  it('extracts value from any long numeric code', () => {
    const result = parseBarcode('1234567890123456789012345678901234567890')
    expect(result.tipo).toBe('other')
    expect(result.valor).toBeTypeOf('number')
    expect(result.confidence).toBe('parcial')
  })

  it('returns nenhum for short codes', () => {
    const result = parseBarcode('12345')
    expect(result.confidence).toBe('nenhum')
    expect(result.valor).toBeNull()
  })

  it('returns nenhum for empty string', () => {
    const result = parseBarcode('')
    expect(result.confidence).toBe('nenhum')
  })
})
