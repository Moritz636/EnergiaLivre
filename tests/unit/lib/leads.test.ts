import { describe, it, expect, vi } from 'vitest'
import {
  WHATSAPP_NUMBER,
  WHATSAPP_BASE,
  validateLead,
  buildLeadRow,
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  buildFollowUpMessage,
  buildFollowUpUrl,
  splitCidadeEstado,
  captureLead,
  type LeadConsumidorInput,
  type LeadGeradorInput,
} from '@/lib/leads'
import { createSupabaseMock } from '@/tests/mocks/supabase'

const baseConsumidor: Omit<LeadConsumidorInput, 'tipo'> = {
  nome: 'Maria Silva',
  email: 'maria@example.com',
  whatsapp: '+5584999998888',
  cidade: 'Natal',
  estado: 'RN',
  gastoMensal: 450,
}

const baseGerador: Omit<LeadGeradorInput, 'tipo'> = {
  nome: 'João Pereira',
  email: 'joao@usina.com',
  whatsapp: '+5584988887777',
  cidade: 'Mossoró',
  estado: 'RN',
  capacidadeKwp: 75,
  concessionaria: 'Cosern',
  cargo: 'Sócio',
}

describe('WHATSAPP constants', () => {
  it('expõe o número correto', () => {
    expect(WHATSAPP_NUMBER).toBe('5584987858668')
    expect(WHATSAPP_BASE).toBe('https://wa.me/5584987858668')
  })
})

describe('validateLead', () => {
  it('rejeita input não-objeto', () => {
    expect(validateLead(null)).toEqual({ ok: false, message: 'Dados do lead inválidos' })
    expect(validateLead(undefined)).toEqual({ ok: false, message: 'Dados do lead inválidos' })
    expect(validateLead('foo')).toEqual({ ok: false, message: 'Dados do lead inválidos' })
  })

  it('valida consumidor feliz', () => {
    const r = validateLead({ ...baseConsumidor, tipo: 'consumidor' })
    expect(r.ok).toBe(true)
    if (r.ok && r.data.tipo === 'consumidor') {
      expect(r.data.gastoMensal).toBe(450)
    }
  })

  it('valida gerador feliz (com opcionais)', () => {
    const r = validateLead({ ...baseGerador, tipo: 'gerador' })
    expect(r.ok).toBe(true)
    if (r.ok && r.data.tipo === 'gerador') {
      expect(r.data.capacidadeKwp).toBe(75)
      expect(r.data.concessionaria).toBe('Cosern')
    }
  })

  it('valida gerador sem concessionária/cargo', () => {
    const { concessionaria: _c, cargo: _r, ...rest } = baseGerador
    const r = validateLead({ ...rest, tipo: 'gerador' })
    expect(r.ok).toBe(true)
  })

  it('rejeita email inválido', () => {
    const r = validateLead({ ...baseConsumidor, email: 'invalido', tipo: 'consumidor' })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.field).toBe('email')
  })

  it('rejeita whatsapp com tamanho inválido', () => {
    const r = validateLead({ ...baseConsumidor, whatsapp: '123', tipo: 'consumidor' })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.field).toBe('whatsapp')
  })

  it('rejeita estado diferente de 2 caracteres', () => {
    const r = validateLead({ ...baseConsumidor, estado: 'Rio Grande do Norte', tipo: 'consumidor' })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.field).toBe('estado')
  })

  it('rejeita gasto mensal <= 0', () => {
    const r1 = validateLead({ ...baseConsumidor, gastoMensal: 0, tipo: 'consumidor' })
    const r2 = validateLead({ ...baseConsumidor, gastoMensal: -10, tipo: 'consumidor' })
    expect(r1.ok).toBe(false)
    expect(r2.ok).toBe(false)
  })

  it('rejeita capacidade <= 0', () => {
    const r = validateLead({ ...baseGerador, capacidadeKwp: 0, tipo: 'gerador' })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.field).toBe('capacidadeKwp')
  })

  it('rejeita tipo desconhecido', () => {
    const r = validateLead({ ...baseConsumidor, tipo: 'admin' })
    expect(r.ok).toBe(false)
  })

  it('aceita gastoMensal como string numérica', () => {
    const r = validateLead({ ...baseConsumidor, gastoMensal: '380,50', tipo: 'consumidor' })
    expect(r.ok).toBe(true)
    if (r.ok && r.data.tipo === 'consumidor') {
      expect(r.data.gastoMensal).toBe(380.5)
    }
  })

  it('trima nome, cidade e email', () => {
    const r = validateLead({
      ...baseConsumidor,
      nome: '  Maria Silva  ',
      cidade: '  Natal  ',
      email: '  maria@example.com  ',
      tipo: 'consumidor',
    })
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.data.nome).toBe('Maria Silva')
      expect(r.data.cidade).toBe('Natal')
      expect(r.data.email).toBe('maria@example.com')
    }
  })

  it('normaliza whatsapp removendo espaços', () => {
    const r = validateLead({
      ...baseConsumidor,
      whatsapp: '+55 84 99999-8888',
      tipo: 'consumidor',
    })
    expect(r.ok).toBe(true)
  })
})

describe('buildLeadRow', () => {
  it('mapeia consumidor corretamente', () => {
    const v = validateLead({ ...baseConsumidor, tipo: 'consumidor' })
    if (!v.ok) throw new Error('expected valid')
    const row = buildLeadRow(v.data, 'user-1')
    expect(row.tipo).toBe('consumidor')
    expect(row.gasto_mensal).toBe(450)
    expect(row.capacidade_kwp).toBeNull()
    expect(row.concessionaria).toBeNull()
    expect(row.user_id).toBe('user-1')
    expect(row.estado).toBe('RN')
  })

  it('mapeia gerador corretamente', () => {
    const v = validateLead({ ...baseGerador, tipo: 'gerador' })
    if (!v.ok) throw new Error('expected valid')
    const row = buildLeadRow(v.data)
    expect(row.tipo).toBe('gerador')
    expect(row.capacidade_kwp).toBe(75)
    expect(row.concessionaria).toBe('Cosern')
    expect(row.gasto_mensal).toBeNull()
    expect(row.user_id).toBeNull()
  })

  it('normaliza estado para uppercase', () => {
    const v = validateLead({ ...baseConsumidor, estado: 'sp', tipo: 'consumidor' })
    if (!v.ok) throw new Error('expected valid')
    const row = buildLeadRow(v.data)
    expect(row.estado).toBe('SP')
  })
})

describe('buildWhatsAppMessage / buildWhatsAppUrl', () => {
  it('monta mensagem de consumidor', () => {
    const v = validateLead({ ...baseConsumidor, tipo: 'consumidor' })
    if (!v.ok) throw new Error('expected valid')
    const msg = buildWhatsAppMessage(v.data)
    expect(msg).toContain('Maria')
    expect(msg).toContain('Natal/RN')
    expect(msg).toContain('450')
  })

  it('monta mensagem de gerador', () => {
    const v = validateLead({ ...baseGerador, tipo: 'gerador' })
    if (!v.ok) throw new Error('expected valid')
    const msg = buildWhatsAppMessage(v.data)
    expect(msg).toContain('João')
    expect(msg).toContain('75')
    expect(msg).toContain('Mossoró/RN')
  })

  it('gera URL com encoding correto', () => {
    const v = validateLead({ ...baseConsumidor, tipo: 'consumidor' })
    if (!v.ok) throw new Error('expected valid')
    const url = buildWhatsAppUrl(v.data)
    expect(url.startsWith(`${WHATSAPP_BASE}?text=`)).toBe(true)
    const decoded = decodeURIComponent(url.split('text=')[1])
    expect(decoded).toBe(buildWhatsAppMessage(v.data))
  })
})

describe('buildFollowUpMessage / buildFollowUpUrl', () => {
  it('mensagem de follow-up para consumidor (enviar fatura)', () => {
    const msg = buildFollowUpMessage('consumidor', { nome: 'Maria Silva', cidade: 'Natal' })
    expect(msg.toLowerCase()).toContain('fatura')
    expect(msg).toContain('Maria')
    expect(msg).toContain('Natal')
  })

  it('mensagem de follow-up para gerador (enviar documentos)', () => {
    const msg = buildFollowUpMessage('gerador', {
      nome: 'João Pereira',
      cidade: 'Mossoró',
      estado: 'RN',
      capacidadeKwp: 75,
    })
    expect(msg.toLowerCase()).toContain('documentos')
    expect(msg).toContain('João')
    expect(msg).toContain('75')
    expect(msg).toContain('RN')
  })

  it('usa fallback quando contexto vazio', () => {
    const msg = buildFollowUpMessage('gerador', {})
    expect(msg).toContain('cliente')
    expect(msg).toContain('N/I')
  })

  it('gera URL válido do follow-up', () => {
    const url = buildFollowUpUrl('consumidor', { nome: 'Maria', cidade: 'Natal' })
    expect(url).toMatch(/^https:\/\/wa\.me\/\d+\?text=/)
  })
})

describe('splitCidadeEstado', () => {
  it('separa "Cidade - UF"', () => {
    expect(splitCidadeEstado('São Paulo - SP')).toEqual({ cidade: 'São Paulo', estado: 'SP' })
  })

  it('separa "Cidade/UF"', () => {
    expect(splitCidadeEstado('Mossoró/RN')).toEqual({ cidade: 'Mossoró', estado: 'RN' })
  })

  it('separa "Cidade, UF"', () => {
    expect(splitCidadeEstado('Recife, PE')).toEqual({ cidade: 'Recife', estado: 'PE' })
  })

  it('mantém cidade se não houver UF', () => {
    expect(splitCidadeEstado('Natal')).toEqual({ cidade: 'Natal', estado: '' })
  })

  it('retorna vazio para entrada vazia', () => {
    expect(splitCidadeEstado('')).toEqual({ cidade: '', estado: '' })
  })
})

describe('captureLead', () => {
  it('insere lead válido no supabase', async () => {
    const insert = vi.fn().mockResolvedValue({ data: [{ id: 42 }], error: null })
    const result = await captureLead(
      { ...baseConsumidor, tipo: 'consumidor' },
      { supabase: {} as any, insert },
    )
    expect(result.success).toBe(true)
    expect(result.id).toBe(42)
    expect(insert).toHaveBeenCalledTimes(1)
    expect(insert.mock.calls[0][0].tipo).toBe('consumidor')
  })

  it('não insere quando inválido', async () => {
    const insert = vi.fn()
    const result = await captureLead(
      { ...baseConsumidor, email: 'invalido', tipo: 'consumidor' },
      { supabase: {} as any, insert },
    )
    expect(result.success).toBe(false)
    expect(result.message).toMatch(/email/i)
    expect(insert).not.toHaveBeenCalled()
  })

  it('retorna erro do supabase', async () => {
    const insert = vi.fn().mockResolvedValue({ data: null, error: { message: 'DB offline' } })
    const result = await captureLead(
      { ...baseConsumidor, tipo: 'consumidor' },
      { supabase: {} as any, insert },
    )
    expect(result.success).toBe(false)
    expect(result.message).toBe('DB offline')
  })

  it('aceita insert customizado (teste de injeção)', async () => {
    const insert = vi.fn().mockResolvedValue({ data: [{ id: 7 }], error: null })
    const result = await captureLead(
      { ...baseGerador, tipo: 'gerador' },
      { supabase: {} as any, insert },
    )
    expect(result.success).toBe(true)
    expect(result.id).toBe(7)
    expect(insert).toHaveBeenCalledTimes(1)
    const rowArg = insert.mock.calls[0][0]
    expect(rowArg.tipo).toBe('gerador')
    expect(rowArg.capacidade_kwp).toBe(75)
  })

  it('trata exceção inesperada', async () => {
    const insert = vi.fn().mockRejectedValue(new Error('boom'))
    const result = await captureLead(
      { ...baseConsumidor, tipo: 'consumidor' },
      { supabase: {} as any, insert },
    )
    expect(result.success).toBe(false)
    expect(result.message).toBe('boom')
  })
})
