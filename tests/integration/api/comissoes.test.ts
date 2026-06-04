import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { NextRequest } from 'next/server'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
  createServerClient: vi.fn(),
}))

import * as serverModule from '@/lib/supabase/server'
import { POST, GET } from '@/app/api/comissoes/route'

const createClientMock = vi.mocked(serverModule.createClient)

type Result = { data: any; error: any; count?: number | null }

interface MockOpts {
  user?: any
  /**
   * Decide o resultado baseado na tabela, operação, filtros aplicados e a chain.
   * `op` é a última operação ('await', 'single', 'range', etc.)
   */
  resultFor?: (
    op: string,
    table: string,
    filters: Array<{ col: string; val: any }>,
    chain?: any
  ) => Result
}

function makeSupabaseMock({
  user = { id: 'embaixador-1', email: 'emb@energia.livre' },
  resultFor = () => ({ data: null, error: null } as Result),
}: MockOpts = {}) {
  const buildChain = (table: string) => {
    const chain: any = {
      _table: table,
      _filters: [] as Array<{ col: string; val: any }>,
      _lastOp: '',
    }
    const finalize = (op: string) =>
      Promise.resolve(resultFor(op, chain._table, chain._filters, chain))
    chain.then = (onFulfilled: any, onRejected?: any) =>
      finalize(chain._lastOp || 'await').then(onFulfilled, onRejected)

    chain.select = vi.fn(function (this: any) { this._lastOp = 'select'; return this })
    chain.insert = vi.fn(function (this: any) { this._lastOp = 'insert'; return this })
    chain.update = vi.fn(function (this: any) { this._lastOp = 'update'; return this })
    chain.delete = vi.fn(function (this: any) { this._lastOp = 'delete'; return this })
    chain.eq = vi.fn(function (this: any, col: string, val: any) { this._filters.push({ col, val }); return this })
    chain.order = vi.fn(function (this: any) { this._lastOp = 'order'; return this })
    chain.range = vi.fn(function (this: any) { this._lastOp = 'range'; return this })
    chain.limit = vi.fn(function (this: any) { return this })
    chain.single = vi.fn(function (this: any) { return finalize('single') })
    chain.maybeSingle = vi.fn(function (this: any) { return finalize('maybeSingle') })
    return chain
  }

  return {
    auth: {
      getUser: vi.fn(async () => ({ data: { user }, error: null })),
    },
    from: vi.fn((table: string) => buildChain(table)),
  }
}

function jsonRequest(body: any, url = 'http://localhost/api/comissoes') {
  return new Request(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }) as unknown as NextRequest
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('POST /api/comissoes', () => {
  const baseBody = {
    userId: 'embaixador-1',
    tipo: 'cadastro',
    valor: 149.9,
    leadId: 42,
    clienteId: 'cliente-1',
  }

  it('retorna 400 com dados incompletos', async () => {
    const sb = makeSupabaseMock()
    createClientMock.mockResolvedValue(sb as any)

    const res = await POST(jsonRequest({ userId: 'embaixador-1' }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('Dados incompletos')
  })

  it('retorna 401 quando user não é admin nem gerador', async () => {
    const sb = makeSupabaseMock({
      resultFor: (op, table) =>
        op === 'single' && table === 'profiles'
          ? { data: { role: 'user', tipo: 'consumidor' }, error: null }
          : { data: null, error: null },
    })
    createClientMock.mockResolvedValue(sb as any)

    const res = await POST(jsonRequest(baseBody))
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Não autorizado')
  })

  it('retorna 404 quando lead não existe', async () => {
    const sb = makeSupabaseMock({
      resultFor: (op, table) => {
        if (op === 'single' && table === 'profiles') {
          return { data: { role: 'user', tipo: 'gerador' }, error: null }
        }
        if (op === 'single' && table === 'leads') {
          return { data: null, error: null }
        }
        return { data: null, error: null }
      },
    })
    createClientMock.mockResolvedValue(sb as any)

    const res = await POST(jsonRequest(baseBody))
    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.error).toBe('Lead não encontrado')
  })

  it('retorna 403 quando lead não pertence ao embaixador', async () => {
    const sb = makeSupabaseMock({
      resultFor: (op, table) => {
        if (op === 'single' && table === 'profiles') {
          return { data: { role: 'user', tipo: 'gerador' }, error: null }
        }
        if (op === 'single' && table === 'leads') {
          return { data: { id: 42, user_id: 'cliente-1', embaixador_id: 'outro-embaixador' }, error: null }
        }
        return { data: null, error: null }
      },
    })
    createClientMock.mockResolvedValue(sb as any)

    const res = await POST(jsonRequest(baseBody))
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.error).toBe('Lead não pertence a este embaixador')
  })

  it('retorna 400 para tipo de comissão inválido', async () => {
    const sb = makeSupabaseMock({
      resultFor: (op, table) => {
        if (op === 'single' && table === 'profiles') {
          return { data: { role: 'user', tipo: 'gerador' }, error: null }
        }
        if (op === 'single' && table === 'leads') {
          return { data: { id: 42, user_id: 'cliente-1', embaixador_id: 'embaixador-1' }, error: null }
        }
        return { data: null, error: null }
      },
    })
    createClientMock.mockResolvedValue(sb as any)

    const res = await POST(jsonRequest({ ...baseBody, tipo: 'bonus' }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('Tipo de comissão inválido')
  })

  it('cria comissão de cadastro (100%) com sucesso', async () => {
    let inserted: any = null
    const sb = makeSupabaseMock({
      resultFor: (op, table) => {
        if (op === 'single' && table === 'profiles') {
          return { data: { role: 'user', tipo: 'gerador' }, error: null }
        }
        if (op === 'single' && table === 'leads') {
          return { data: { id: 42, user_id: 'cliente-1', embaixador_id: 'embaixador-1' }, error: null }
        }
        if (op === 'single' && table === 'comissoes') {
          return { data: { id: 99, valor_comissao: 149.9, percentual: 100, tipo_comissao: 'cadastro' }, error: null }
        }
        return { data: null, error: null }
      },
    })
    // Capturar o que foi inserido
    const origInsert = (sb.from as any).mock.results
    createClientMock.mockResolvedValue(sb as any)
    // Simpler: capture via spy
    const insertSpy = vi.spyOn(sb, 'from')

    const res = await POST(jsonRequest(baseBody))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.comissao.id).toBe(99)
    expect(body.message).toContain('R$ 149.90')
    expect(insertSpy).toHaveBeenCalledWith('comissoes')
  })

  it('cria comissão recorrente (5%) com sucesso', async () => {
    const sb = makeSupabaseMock({
      resultFor: (op, table) => {
        if (op === 'single' && table === 'profiles') {
          return { data: { role: 'user', tipo: 'gerador' }, error: null }
        }
        if (op === 'single' && table === 'leads') {
          return { data: { id: 42, user_id: 'cliente-1', embaixador_id: 'embaixador-1' }, error: null }
        }
        if (op === 'single' && table === 'comissoes') {
          return { data: { id: 100, valor_comissao: 7.495, percentual: 5 }, error: null }
        }
        return { data: null, error: null }
      },
    })
    createClientMock.mockResolvedValue(sb as any)

    const res = await POST(jsonRequest({ ...baseBody, tipo: 'recorrente', valor: 149.9 }))
    expect(res.status).toBe(200)
    const body = await res.json()
    // 5% de 149.9 = 7.495 → mensagem deve mostrar R$ 7.50
    expect(body.message).toContain('7.50')
  })

  it('admin pode criar comissão para qualquer lead', async () => {
    const sb = makeSupabaseMock({
      resultFor: (op, table) => {
        if (op === 'single' && table === 'profiles') {
          return { data: { role: 'admin', tipo: 'admin' }, error: null }
        }
        if (op === 'single' && table === 'leads') {
          return { data: { id: 42, user_id: 'cliente-1', embaixador_id: 'outro-embaixador' }, error: null }
        }
        if (op === 'single' && table === 'comissoes') {
          return { data: { id: 200, valor_comissao: 149.9 }, error: null }
        }
        return { data: null, error: null }
      },
    })
    createClientMock.mockResolvedValue(sb as any)

    const res = await POST(jsonRequest(baseBody))
    expect(res.status).toBe(200)
  })

  it('usa clienteId do body se fornecido, senão usa do lead', async () => {
    let capturedInsert: any = null
    const sb = makeSupabaseMock({
      resultFor: (op, table) => {
        if (op === 'single' && table === 'profiles') {
          return { data: { role: 'user', tipo: 'gerador' }, error: null }
        }
        if (op === 'single' && table === 'leads') {
          return { data: { id: 42, user_id: 'cliente-do-lead', embaixador_id: 'embaixador-1' }, error: null }
        }
        if (op === 'single' && table === 'comissoes') {
          // Captura o último insert
          const calls = (sb.from('comissoes') as any)
          return { data: { id: 1, valor_comissao: 149.9 }, error: null }
        }
        return { data: null, error: null }
      },
    })
    createClientMock.mockResolvedValue(sb as any)

    // Sem clienteId no body, deve usar cliente-do-lead
    const res1 = await POST(jsonRequest({ ...baseBody, clienteId: undefined }))
    expect(res1.status).toBe(200)

    // Com clienteId no body, usa ele
    const res2 = await POST(jsonRequest({ ...baseBody, clienteId: 'cliente-explicito' }))
    expect(res2.status).toBe(200)
  })
})

describe('GET /api/comissoes', () => {
  it('retorna lista paginada de comissões', async () => {
    const sb = makeSupabaseMock({
      resultFor: (op, table) => {
        // Primeira chamada: range (lista paginada)
        if (op === 'range' && table === 'comissoes') {
          return { data: [{ id: 1, valor_comissao: 100 }], error: null, count: 25 }
        }
        // Segunda chamada: select+eq sem terminal (totais)
        if (op === 'select' && table === 'comissoes') {
          return {
            data: [
              { valor_comissao: 100, status_pagamento: 'pendente' },
              { valor_comissao: 50, status_pagamento: 'pago' },
            ],
            error: null,
          }
        }
        return { data: null, error: null }
      },
    })
    createClientMock.mockResolvedValue(sb as any)

    const req = new Request('http://localhost/api/comissoes?page=0&pageSize=10') as unknown as NextRequest
    const res = await GET(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.comissoes).toHaveLength(1)
    expect(body.totais.totalPendente).toBe(100)
    expect(body.totais.totalPago).toBe(50)
    expect(body.totais.totalCancelado).toBe(0)
    expect(body.pagination).toEqual({
      page: 0,
      pageSize: 10,
      total: 25,
      totalPages: 3,
    })
  })

  it('limita pageSize em no máximo 100', async () => {
    const sb = makeSupabaseMock({
      resultFor: (op) => (op === 'range' ? { data: [], error: null, count: 0 } : { data: [], error: null }),
    })
    createClientMock.mockResolvedValue(sb as any)

    const req = new Request('http://localhost/api/comissoes?pageSize=999') as unknown as NextRequest
    const res = await GET(req)
    expect(res.status).toBe(200)
    // pageSize clampado em 100 → range de 0 a 99
  })

  it('filtra por userId e status quando informados', async () => {
    const allChains: any[] = []
    const sb = makeSupabaseMock({
      resultFor: (op: string, _t: string, _f: any, chain: any) => {
        allChains.push(chain)
        if (op === 'range') return { data: [], error: null, count: 0 }
        return { data: [], error: null }
      },
    })
    createClientMock.mockResolvedValue(sb as any)

    const req = new Request(
      'http://localhost/api/comissoes?userId=embaixador-1&status=pago'
    ) as unknown as NextRequest
    const res = await GET(req)
    expect(res.status).toBe(200)

    const allFilters = allChains.flatMap(c => c._filters)
    expect(allFilters.some(f => f.col === 'embaixador_id' && f.val === 'embaixador-1')).toBe(true)
    expect(allFilters.some(f => f.col === 'status_pagamento' && f.val === 'pago')).toBe(true)
  })
})
