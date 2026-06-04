import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { NextRequest } from 'next/server'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
  createServerClient: vi.fn(),
}))

import * as serverModule from '@/lib/supabase/server'
import { GET, PATCH } from '@/app/api/notifications/route'

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
    }
    const finalize = (op: string) =>
      Promise.resolve(resultFor(op, table, chain._filters))
    chain.then = (onFulfilled: any, onRejected?: any) =>
      finalize(chain._lastOp || 'await').then(onFulfilled, onRejected)

    chain.select = vi.fn(function (this: any) { this._lastOp = 'select'; return this })
    chain.insert = vi.fn(function (this: any) { this._lastOp = 'insert'; return this })
    chain.update = vi.fn(function (this: any) { this._lastOp = 'update'; return this })
    chain.delete = vi.fn(function (this: any) { this._lastOp = 'delete'; return this })
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

function jsonRequest(body: any) {
  return new Request('http://localhost/api/notifications', {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }) as unknown as NextRequest
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('GET /api/notifications', () => {
  it('retorna 401 sem autenticação', async () => {
    const sb = makeSupabaseMock({ user: null })
    createClientMock.mockResolvedValue(sb as any)
    const req = new Request('http://localhost/api/notifications') as unknown as NextRequest
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('lista notificações do usuário', async () => {
    const sb = makeSupabaseMock({
      resultFor: (op, table) => {
        if (table === 'notifications' && op !== 'single') {
          return { data: [{ id: 1, message: 'Olá' }], error: null }
        }
        return { data: null, error: null }
      },
    })
    createClientMock.mockResolvedValue(sb as any)
    const req = new Request('http://localhost/api/notifications') as unknown as NextRequest
    const res = await GET(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.notifications).toHaveLength(1)
  })

  it('filtra apenas não lidas quando unread=true', async () => {
    const sb = makeSupabaseMock({
      resultFor: (op, table) => {
        if (table === 'notifications' && op !== 'single') {
          return { data: [], error: null }
        }
        return { data: null, error: null }
      },
    })
    createClientMock.mockResolvedValue(sb as any)
    const req = new Request('http://localhost/api/notifications?unread=true') as unknown as NextRequest
    const res = await GET(req)
    expect(res.status).toBe(200)
  })
})

describe('PATCH /api/notifications', () => {
  it('retorna 401 sem autenticação', async () => {
    const sb = makeSupabaseMock({ user: null })
    createClientMock.mockResolvedValue(sb as any)
    const res = await PATCH(jsonRequest({ notificationId: 1 }))
    expect(res.status).toBe(401)
  })

  it('marca todas como lidas quando markAllAsRead=true', async () => {
    let capturedFilters: any[] = []
    const sb = makeSupabaseMock({
      resultFor: (op, _t, filters) => {
        capturedFilters = filters
        if (op === 'update') return { data: null, error: null }
        return { data: null, error: null }
      },
    })
    createClientMock.mockResolvedValue(sb as any)
    const res = await PATCH(jsonRequest({ markAllAsRead: true }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.message).toContain('marcadas como lidas')
  })

  it('marca uma notificação específica como lida', async () => {
    const sb = makeSupabaseMock({
      resultFor: (op) => (op === 'update' ? { data: null, error: null } : { data: null, error: null }),
    })
    createClientMock.mockResolvedValue(sb as any)
    const res = await PATCH(jsonRequest({ notificationId: 42 }))
    expect(res.status).toBe(200)
  })

  it('retorna 400 sem notificationId nem markAllAsRead', async () => {
    const sb = makeSupabaseMock()
    createClientMock.mockResolvedValue(sb as any)
    const res = await PATCH(jsonRequest({}))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('ID da notificação é obrigatório')
  })
})
