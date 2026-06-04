import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { NextRequest } from 'next/server'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
  createServerClient: vi.fn(),
}))

import * as serverModule from '@/lib/supabase/server'
import { GET } from '@/app/api/admin/stats/route'

const createClientMock = vi.mocked(serverModule.createClient)

type Result = { data: any; error: any }

const adminUser = { id: 'admin-1', email: 'admin@energia.livre' }
const regularUser = { id: 'user-1', email: 'u@energia.livre' }

function makeSupabaseMock({
  user = adminUser,
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
    }
    const finalize = (op: string) =>
      Promise.resolve(resultFor(op, table, chain._filters))
    chain.then = (onFulfilled: any, onRejected?: any) =>
      finalize(chain._lastOp || 'await').then(onFulfilled, onRejected)

    chain.select = vi.fn(function (this: any) { this._lastOp = 'select'; return this })
    chain.insert = vi.fn(function (this: any) { this._lastOp = 'insert'; return this })
    chain.update = vi.fn(function (this: any) { this._lastOp = 'update'; return this })
    chain.eq = vi.fn(function (this: any, col: string, val: any) { this._filters.push({ col, val }); return this })
    chain.order = vi.fn(function (this: any) { this._lastOp = 'order'; return this })
    chain.limit = vi.fn(function (this: any) { return this })
    chain.single = vi.fn(function (this: any) { return finalize('single') })
    return chain
  }
  return {
    auth: { getUser: vi.fn(async () => ({ data: { user }, error: null })) },
    from: vi.fn((table: string) => buildChain(table)),
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('GET /api/admin/stats', () => {
  it('retorna 401 sem autenticação', async () => {
    const sb = makeSupabaseMock({ user: null })
    createClientMock.mockResolvedValue(sb as any)
    const req = new Request('http://localhost/api/admin/stats') as unknown as NextRequest
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('retorna 403 para usuário não-admin', async () => {
    const sb = makeSupabaseMock({
      user: regularUser,
      resultFor: (op, table) => {
        if (op === 'single' && table === 'profiles') {
          return { data: { role: 'user' }, error: null }
        }
        return { data: null, error: null }
      },
    })
    createClientMock.mockResolvedValue(sb as any)
    const req = new Request('http://localhost/api/admin/stats') as unknown as NextRequest
    const res = await GET(req)
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.error).toBe('Acesso negado')
  })

  it('retorna stats, leads recentes e comissões pendentes para admin', async () => {
    const sb = makeSupabaseMock({
      resultFor: (op, table) => {
        if (op === 'single' && table === 'profiles') {
          return { data: { role: 'admin' }, error: null }
        }
        if (op === 'single' && table === 'stats_cache') {
          return { data: { total_users: 100, total_revenue: 5000 }, error: null }
        }
        if (table === 'leads' && op !== 'single') {
          return { data: [{ id: 1, nome: 'Lead 1' }], error: null }
        }
        if (table === 'comissoes' && op !== 'single') {
          return { data: [{ id: 1, valor_comissao: 100 }], error: null }
        }
        return { data: null, error: null }
      },
    })
    createClientMock.mockResolvedValue(sb as any)
    const req = new Request('http://localhost/api/admin/stats') as unknown as NextRequest
    const res = await GET(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.stats).toEqual({ total_users: 100, total_revenue: 5000 })
    expect(body.leadsRecentes).toHaveLength(1)
    expect(body.comissoesPendentes).toHaveLength(1)
  })
})
