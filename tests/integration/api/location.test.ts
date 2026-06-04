import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { NextRequest } from 'next/server'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
  createServerClient: vi.fn(),
}))

import * as serverModule from '@/lib/supabase/server'
import { POST, GET } from '@/app/api/location/route'

const createClientMock = vi.mocked(serverModule.createClient)

const mockUser = { id: 'user-loc-1', email: 'loc@test.com' }

function makeSupabaseMock({ user = mockUser, upsertResult = { data: null, error: null }, selectResult = { data: null, error: null } }: { user?: any; upsertResult?: any; selectResult?: any } = {}) {
  const chain: any = {}
  chain.upsert = vi.fn().mockReturnValue(chain)
  chain.select = vi.fn().mockReturnValue(chain)
  chain.eq = vi.fn().mockReturnValue(chain)
  chain.maybeSingle = vi.fn(async () => selectResult)
  chain.then = undefined
  // Make upsert itself awaitable
  ;(chain.upsert as any) = vi.fn().mockImplementation(() => Promise.resolve(upsertResult))
  return {
    auth: {
      getUser: vi.fn(async () => ({ data: { user }, error: null })),
    },
    from: vi.fn((table: string) => {
      if (table === 'user_locations') return chain
      return chain
    }),
  }
}

function jsonRequest(body: any) {
  return new Request('http://localhost/api/location', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }) as unknown as NextRequest
}

function getRequest() {
  return new Request('http://localhost/api/location', { method: 'GET' }) as unknown as NextRequest
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('POST /api/location', () => {
  it('retorna 401 quando não autenticado', async () => {
    const sb = makeSupabaseMock({ user: null })
    createClientMock.mockResolvedValue(sb as any)

    const res = await POST(jsonRequest({ latitude: 1, longitude: 2 }))
    expect(res.status).toBe(401)
  })

  it('retorna 400 quando faltam latitude/longitude', async () => {
    const sb = makeSupabaseMock()
    createClientMock.mockResolvedValue(sb as any)

    const res = await POST(jsonRequest({}))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/Coordenadas inválidas|latitude/)
  })

  it('retorna 400 quando coordenadas são inválidas', async () => {
    const sb = makeSupabaseMock()
    createClientMock.mockResolvedValue(sb as any)

    const res = await POST(jsonRequest({ latitude: 999, longitude: -200 }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('Coordenadas inválidas')
  })

  it('salva localização com sucesso', async () => {
    const sb = makeSupabaseMock()
    createClientMock.mockResolvedValue(sb as any)

    const res = await POST(jsonRequest({
      latitude: -23.5505,
      longitude: -46.6333,
      cidade: 'São Paulo',
      estado: 'SP',
    }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
  })

  it('retorna 500 quando upsert falha', async () => {
    const sb = makeSupabaseMock({ upsertResult: { data: null, error: { message: 'db down' } } })
    createClientMock.mockResolvedValue(sb as any)

    const res = await POST(jsonRequest({ latitude: -23, longitude: -46, cidade: 'SP', estado: 'SP' }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('db down')
  })
})

describe('GET /api/location', () => {
  it('retorna 401 quando não autenticado', async () => {
    const sb = makeSupabaseMock({ user: null })
    createClientMock.mockResolvedValue(sb as any)

    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('retorna configured=false quando não há localização salva', async () => {
    const sb = makeSupabaseMock({ selectResult: { data: null, error: null } })
    createClientMock.mockResolvedValue(sb as any)

    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.configured).toBe(false)
    expect(body.location).toBeNull()
  })

  it('retorna configured=true com location normalizada quando existe', async () => {
    const sb = makeSupabaseMock({
      selectResult: { data: { latitude: -23.5, longitude: -46.6, cidade: 'São Paulo', estado: 'SP' }, error: null },
    })
    createClientMock.mockResolvedValue(sb as any)

    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.configured).toBe(true)
    expect(body.location.lat).toBe(-23.5)
    expect(body.location.lng).toBe(-46.6)
    expect(body.location.cidade).toBe('São Paulo')
  })
})
