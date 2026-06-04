import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { NextRequest } from 'next/server'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
  createServerClient: vi.fn(),
}))

import * as serverModule from '@/lib/supabase/server'
import { GET as GETMatches } from '@/app/api/matches/route'
import { POST as POSTPropose } from '@/app/api/matches/propose/route'
import { POST as POSTRespond } from '@/app/api/matches/respond/route'

const createClientMock = vi.mocked(serverModule.createClient)

const mockUser = { id: 'user-match-1', email: 'm@test.com' }

type Result = { data: any; error: any; count?: number | null }

interface Call {
  table: string
  op: string
  filters: Array<{ col: string; val: any }>
  payload?: any
}

function makeSupabaseMock({
  user = mockUser,
  responses = {} as Record<string, Result>,
}: { user?: any; responses?: Record<string, Result> } = {}) {
  const calls: Call[] = []
  const buildChain = (table: string) => {
    const chain: any = {
      _table: table,
      _filters: [] as Array<{ col: string; val: any }>,
      _lastOp: '',
      _payload: undefined as any,
    }
    const finalize = (op: string) => {
      calls.push({ table, op, filters: [...chain._filters], payload: chain._payload })
      const key = `${table}:${chain._filters.map((f: { col: string; val: any }) => `${f.col}=${f.val}`).join('|')}`
      const fallback = chain._filters.length === 0 ? `${table}:*` : null
      const r = responses[key] ?? (fallback ? responses[fallback] : undefined) ?? { data: null, error: null }
      return Promise.resolve(r)
    }
    chain.then = (onF: any, onR?: any) => finalize(chain._lastOp || 'await').then(onF, onR)

    chain.select = vi.fn(function (this: any) { this._lastOp = 'select'; return this })
    chain.insert = vi.fn(function (this: any, payload: any) { this._lastOp = 'insert'; this._payload = payload; return this })
    chain.update = vi.fn(function (this: any, payload: any) { this._lastOp = 'update'; this._payload = payload; return this })
    chain.delete = vi.fn(function (this: any) { this._lastOp = 'delete'; return this })
    chain.eq = vi.fn(function (this: any, col: string, val: any) { this._filters.push({ op: 'eq', col, val }); return this })
    chain.neq = vi.fn(function (this: any, col: string, val: any) { this._filters.push({ op: 'neq', col, val }); return this })
    chain.in = vi.fn(function (this: any) { return this })
    chain.order = vi.fn(function (this: any) { return this })
    chain.limit = vi.fn(function (this: any) { return this })
    chain.range = vi.fn(function (this: any) { return this })
    chain.single = vi.fn(function (this: any) { return finalize('single') })
    chain.maybeSingle = vi.fn(function (this: any) { return finalize('maybeSingle') })
    return chain
  }
  return {
    _calls: calls,
    auth: { getUser: vi.fn(async () => ({ data: { user }, error: null })) },
    from: vi.fn((table: string) => buildChain(table)),
    rpc: vi.fn(async () => ({ data: [], error: null })),
  }
}

function getRequest(url: string) {
  return new Request(url, { method: 'GET' }) as unknown as NextRequest
}

function jsonRequest(url: string, body: any) {
  return new Request(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }) as unknown as NextRequest
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('GET /api/matches', () => {
  it('retorna 401 quando não autenticado', async () => {
    const sb = makeSupabaseMock({ user: null })
    createClientMock.mockResolvedValue(sb as any)
    const res = await GETMatches(getRequest('http://localhost/api/matches?targetTipo=gerador'))
    expect(res.status).toBe(401)
  })

  it('retorna 400 quando targetTipo é inválido', async () => {
    const sb = makeSupabaseMock()
    createClientMock.mockResolvedValue(sb as any)
    const res = await GETMatches(getRequest('http://localhost/api/matches?targetTipo=parceiro'))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/targetTipo/)
  })

  it('retorna 400 quando targetTipo não é informado', async () => {
    const sb = makeSupabaseMock()
    createClientMock.mockResolvedValue(sb as any)
    const res = await GETMatches(getRequest('http://localhost/api/matches'))
    expect(res.status).toBe(400)
  })

  it('retorna 403 quando tipo do user não é consumidor nem gerador', async () => {
    const sb = makeSupabaseMock({
      responses: {
        'profiles:id=user-match-1': { data: { tipo: 'parceiro' }, error: null },
      },
    })
    createClientMock.mockResolvedValue(sb as any)
    const res = await GETMatches(getRequest('http://localhost/api/matches?targetTipo=gerador'))
    expect(res.status).toBe(403)
  })

  it('retorna 400 quando tipo do user é igual ao targetTipo', async () => {
    const sb = makeSupabaseMock({
      responses: {
        'profiles:id=user-match-1': { data: { tipo: 'gerador' }, error: null },
      },
    })
    createClientMock.mockResolvedValue(sb as any)
    const res = await GETMatches(getRequest('http://localhost/api/matches?targetTipo=gerador'))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/mesmo tipo/)
  })

  it('retorna 412 quando user não tem localização salva', async () => {
    const sb = makeSupabaseMock({
      responses: {
        'profiles:id=user-match-1': { data: { tipo: 'consumidor' }, error: null },
        'user_locations:user_id=user-match-1': { data: null, error: { message: 'not found' } },
      },
    })
    createClientMock.mockResolvedValue(sb as any)
    const res = await GETMatches(getRequest('http://localhost/api/matches?targetTipo=gerador'))
    expect(res.status).toBe(412)
  })

  it('retorna candidates quando user tem localização e tipo diferente', async () => {
    const sb = makeSupabaseMock({
      responses: {
        'profiles:id=user-match-1': { data: { tipo: 'consumidor' }, error: null },
        'user_locations:user_id=user-match-1': { data: { latitude: -23.55, longitude: -46.63 }, error: null },
        'user_locations:profiles.tipo=gerador|user_id=user-match-1': {
          data: [
            {
              user_id: 'g-1',
              lat: -23.5505,
              lng: -46.6333,
              cidade: 'São Paulo',
              estado: 'SP',
              profiles: { nome: 'Usina A', tipo: 'gerador', is_active: true, member_plus_active: true },
            },
            {
              user_id: 'g-2',
              lat: -23.5506,
              lng: -46.6334,
              cidade: 'São Paulo',
              estado: 'SP',
              profiles: { nome: 'Usina B', tipo: 'gerador', is_active: true, member_plus_active: false },
            },
          ] as any,
          error: null,
        },
      },
    })
    sb.rpc = vi.fn(async () => ({
      data: [] as any,
      error: null,
    }))
    createClientMock.mockResolvedValue(sb as any)

    const res = await GETMatches(getRequest('http://localhost/api/matches?targetTipo=gerador&radiusKm=200&limit=10'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.candidates.length).toBeGreaterThanOrEqual(1)
    expect(body.candidates[0].user_id).toMatch(/^g-/)
  })
})

describe('POST /api/matches/propose', () => {
  it('retorna 401 quando não autenticado', async () => {
    const sb = makeSupabaseMock({ user: null })
    createClientMock.mockResolvedValue(sb as any)
    const res = await POSTPropose(jsonRequest('http://localhost/api/matches/propose', { targetUserId: 'u-2' }))
    expect(res.status).toBe(401)
  })

  it('retorna 400 quando falta toUserId', async () => {
    const sb = makeSupabaseMock()
    createClientMock.mockResolvedValue(sb as any)
    const res = await POSTPropose(jsonRequest('http://localhost/api/matches/propose', {}))
    expect(res.status).toBe(400)
  })

  it('cria proposta com sucesso (insert)', async () => {
    const sb = makeSupabaseMock({
      responses: {
        'match_proposals:from_user_id=user-match-1|to_user_id=u-2|status=pending': { data: [], error: null },
      },
    })
    createClientMock.mockResolvedValue(sb as any)
    const res = await POSTPropose(jsonRequest('http://localhost/api/matches/propose', {
      toUserId: 'u-2',
      message: 'Vamos conectar!',
    }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)

    // O insert termina em .single() (terminal), mas o payload é armazenado em _payload
    const calls = sb._calls.filter(c => c.table === 'match_proposals')
    const insertCall = calls.find(c => c.payload?.from_user_id === mockUser.id)
    expect(insertCall).toBeTruthy()
    expect(insertCall?.payload.from_user_id).toBe(mockUser.id)
    expect(insertCall?.payload.to_user_id).toBe('u-2')
    expect(insertCall?.payload.message).toBe('Vamos conectar!')
    expect(insertCall?.payload.status).toBe('pending')
  })

  it('retorna 409 quando já existe proposta pending', async () => {
    const sb = makeSupabaseMock({
      responses: {
        'match_proposals:from_user_id=user-match-1|to_user_id=u-2|status=pending': { data: [{ id: 'existing' }], error: null },
      },
    })
    createClientMock.mockResolvedValue(sb as any)
    const res = await POSTPropose(jsonRequest('http://localhost/api/matches/propose', { toUserId: 'u-2' }))
    expect(res.status).toBe(409)
  })
})

describe('POST /api/matches/respond', () => {
  it('retorna 401 quando não autenticado', async () => {
    const sb = makeSupabaseMock({ user: null })
    createClientMock.mockResolvedValue(sb as any)
    const res = await POSTRespond(jsonRequest('http://localhost/api/matches/respond', { proposalId: 'p-1', response: 'accepted' }))
    expect(res.status).toBe(401)
  })

  it('retorna 400 quando faltam params', async () => {
    const sb = makeSupabaseMock()
    createClientMock.mockResolvedValue(sb as any)
    const res = await POSTRespond(jsonRequest('http://localhost/api/matches/respond', { proposalId: 1 }))
    expect(res.status).toBe(400)
  })

  it('retorna 400 quando response não é accepted|rejected', async () => {
    const sb = makeSupabaseMock()
    createClientMock.mockResolvedValue(sb as any)
    const res = await POSTRespond(jsonRequest('http://localhost/api/matches/respond', { proposalId: 1, response: 'maybe' }))
    expect(res.status).toBe(400)
  })

  it('retorna 400 quando proposta não é do target', async () => {
    const sb = makeSupabaseMock({
      responses: {
        'match_proposals:id=1': { data: { id: 1, to_user_id: 'outro-user', status: 'pending', expires_at: new Date(Date.now() + 86400000).toISOString() }, error: null },
      },
    })
    createClientMock.mockResolvedValue(sb as any)
    const res = await POSTRespond(jsonRequest('http://localhost/api/matches/respond', { proposalId: 1, response: 'accepted' }))
    expect(res.status).toBe(400)
  })

  it('retorna 400 quando proposta não está mais pending', async () => {
    const sb = makeSupabaseMock({
      responses: {
        'match_proposals:id=1': { data: { id: 1, to_user_id: mockUser.id, status: 'accepted', expires_at: new Date(Date.now() + 86400000).toISOString() }, error: null },
      },
    })
    createClientMock.mockResolvedValue(sb as any)
    const res = await POSTRespond(jsonRequest('http://localhost/api/matches/respond', { proposalId: 1, response: 'accepted' }))
    expect(res.status).toBe(400)
  })

  it('atualiza proposta com sucesso (accepted)', async () => {
    const sb = makeSupabaseMock({
      responses: {
        'match_proposals:id=1': { data: { id: 1, to_user_id: mockUser.id, status: 'pending', expires_at: new Date(Date.now() + 86400000).toISOString() }, error: null },
      },
    })
    createClientMock.mockResolvedValue(sb as any)
    const res = await POSTRespond(jsonRequest('http://localhost/api/matches/respond', { proposalId: 1, response: 'accepted' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)

    const updateCall = sb._calls.find(c => c.table === 'match_proposals' && c.op === 'update')
    expect(updateCall?.payload.status).toBe('accepted')
  })
})
