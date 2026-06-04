import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { NextRequest } from 'next/server'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
  createServerClient: vi.fn(),
}))

import * as serverModule from '@/lib/supabase/server'
import { GET, POST } from '@/app/api/referrals/route'

const createClientMock = vi.mocked(serverModule.createClient)

type Result = { data: any; error: any }

const mockUser = { id: 'user-1', email: 'u@energia.livre' }

function makeSupabaseMock({
  user = mockUser,
  resultFor = () => ({ data: null, error: null } as Result),
}: {
  user?: any
  resultFor?: (op: string, table: string, filters: any[]) => Result
} = {}) {
  const buildChain = (table: string) => {
    const chain: any = {
      _table: table,
      _filters: [] as Array<{ col: string; val: any }>,
      _lastOp: '',
      _payload: undefined as any,
    }
    const finalize = (op: string) =>
      Promise.resolve(resultFor(op, table, chain._filters))
    chain.then = (onFulfilled: any, onRejected?: any) =>
      finalize(chain._lastOp || 'await').then(onFulfilled, onRejected)

    chain.select = vi.fn(function (this: any) { this._lastOp = 'select'; return this })
    chain.insert = vi.fn(function (this: any, p: any) { this._lastOp = 'insert'; this._payload = p; return this })
    chain.update = vi.fn(function (this: any, p: any) { this._lastOp = 'update'; this._payload = p; return this })
    chain.eq = vi.fn(function (this: any, col: string, val: any) { this._filters.push({ col, val }); return this })
    chain.order = vi.fn(function (this: any) { this._lastOp = 'order'; return this })
    chain.single = vi.fn(function (this: any) { return finalize('single') })
    return chain
  }
  return {
    auth: { getUser: vi.fn(async () => ({ data: { user }, error: null })) },
    from: vi.fn((table: string) => buildChain(table)),
  }
}

function jsonRequest(body: any) {
  return new Request('http://localhost/api/referrals', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }) as unknown as NextRequest
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('GET /api/referrals', () => {
  it('retorna 401 sem autenticação', async () => {
    const sb = makeSupabaseMock({ user: null })
    createClientMock.mockResolvedValue(sb as any)
    const req = new Request('http://localhost/api/referrals') as unknown as NextRequest
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('retorna código e indicações do usuário', async () => {
    const sb = makeSupabaseMock({
      resultFor: (op, table) => {
        if (op === 'single' && table === 'profiles') {
          return { data: { referral_code: 'ABC123' }, error: null }
        }
        if (table === 'referrals' && op !== 'single') {
          return {
            data: [
              { id: 1, status: 'convertido' },
              { id: 2, status: 'pendente' },
            ],
            error: null,
          }
        }
        return { data: null, error: null }
      },
    })
    createClientMock.mockResolvedValue(sb as any)
    const req = new Request('http://localhost/api/referrals') as unknown as NextRequest
    const res = await GET(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.referralCode).toBe('ABC123')
    expect(body.referrals).toHaveLength(2)
    expect(body.stats).toEqual({ total: 2, convertidos: 1, pendentes: 1 })
  })
})

describe('POST /api/referrals', () => {
  it('retorna 400 sem referralCode', async () => {
    const sb = makeSupabaseMock()
    createClientMock.mockResolvedValue(sb as any)
    const res = await POST(jsonRequest({}))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('Código de indicação é obrigatório')
  })

  it('retorna 404 quando código não existe', async () => {
    const sb = makeSupabaseMock({
      resultFor: (op, table) => {
        if (op === 'single' && table === 'profiles') return { data: null, error: null }
        return { data: null, error: null }
      },
    })
    createClientMock.mockResolvedValue(sb as any)
    const res = await POST(jsonRequest({ referralCode: 'INVALID' }))
    expect(res.status).toBe(404)
  })

  it('retorna 400 quando user tenta indicar a si mesmo', async () => {
    const sb = makeSupabaseMock({
      resultFor: (op, table) => {
        if (op === 'single' && table === 'profiles') {
          return { data: { id: 'user-1' }, error: null } // mesmo id do user
        }
        return { data: null, error: null }
      },
    })
    createClientMock.mockResolvedValue(sb as any)
    const res = await POST(jsonRequest({ referralCode: 'ABC' }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toContain('si mesmo')
  })

  it('cria referral com sucesso', async () => {
    let capturedInsert: any = null
    const sb = makeSupabaseMock({
      resultFor: (op, table, filters) => {
        if (op === 'single' && table === 'profiles') {
          return { data: { id: 'referrer-1' }, error: null }
        }
        if (op === 'single' && table === 'referrals') {
          return { data: { id: 1, status: 'pendente' }, error: null }
        }
        return { data: null, error: null }
      },
    })
    createClientMock.mockResolvedValue(sb as any)
    const res = await POST(jsonRequest({ referralCode: 'abc' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.referral.id).toBe(1)
  })
})
