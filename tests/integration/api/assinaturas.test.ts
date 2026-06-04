import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { NextRequest } from 'next/server'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
  createServerClient: vi.fn(),
}))

import * as serverModule from '@/lib/supabase/server'
import { __stripeInstance } from 'stripe'
import { POST, GET, DELETE } from '@/app/api/assinaturas/route'
import { STRIPE_PRICE_IDS } from '@/lib/stripe-prices'

const createClientMock = vi.mocked(serverModule.createClient)
const createServerClientMock = vi.mocked(serverModule.createServerClient)
const stripe = __stripeInstance as unknown as {
  checkout: { sessions: { create: any; expire: any } }
  subscriptions: { update: any; retrieve: any }
  webhooks: { constructEvent: any }
}

const mockUser = { id: 'user-1', email: 'test@energia.livre' }

type Result = { data: any; error: any; count?: number | null }

function makeSupabaseMock({
  user = mockUser,
  resultFor = (_op: string, _table: string, _filters: Array<{ col: string; val: any }>) =>
    ({ data: null, error: null } as Result),
}: {
  user?: any
  resultFor?: (
    op: string,
    table: string,
    filters: Array<{ col: string; val: any }>
  ) => Result
} = {}) {
  const chain: any = {
    _table: 'unknown',
    _filters: [] as Array<{ col: string; val: any }>,
    _lastOp: '',
  }
  const finalize = (op: string) => {
    chain._lastOp = op
    return Promise.resolve(resultFor(op, chain._table, chain._filters))
  }
  chain.then = (onFulfilled: any, onRejected?: any) => finalize('await').then(onFulfilled, onRejected)

  chain.select = vi.fn(function (this: any) { this._lastOp = 'select'; return this })
  chain.insert = vi.fn(function (this: any) { this._lastOp = 'insert'; return this })
  chain.update = vi.fn(function (this: any) { this._lastOp = 'update'; return this })
  chain.delete = vi.fn(function (this: any) { this._lastOp = 'delete'; return this })
  chain.upsert = vi.fn(function (this: any) { this._lastOp = 'upsert'; return this })
  chain.eq = vi.fn(function (this: any, col: string, val: any) { this._filters.push({ col, val }); return this })
  chain.neq = vi.fn(function (this: any) { return this })
  chain.order = vi.fn(function (this: any) { this._lastOp = 'order'; return this })
  chain.limit = vi.fn(function (this: any) { return this })
  chain.range = vi.fn(function (this: any) { this._lastOp = 'range'; return this })
  chain.single = vi.fn(function (this: any) { return finalize('single') })
  chain.maybeSingle = vi.fn(function (this: any) { return finalize('maybeSingle') })

  return {
    auth: {
      getUser: vi.fn(async () => ({ data: { user }, error: null })),
    },
    from: vi.fn((table: string) => {
      chain._table = table
      return chain
    }),
  }
}

function jsonRequest(body: any, url = 'http://localhost/api/assinaturas') {
  return new Request(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }) as unknown as NextRequest
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('POST /api/assinaturas', () => {
  it('retorna 401 quando usuário não autenticado', async () => {
    const sb = makeSupabaseMock({ user: null })
    createClientMock.mockResolvedValue(sb as any)
    createServerClientMock.mockResolvedValue(sb as any)

    const res = await POST(jsonRequest({ priceId: STRIPE_PRICE_IDS.CONSUMIDOR_BASICO }))
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Não autenticado')
  })

  it('retorna 400 quando priceId é inválido', async () => {
    const sb = makeSupabaseMock()
    createClientMock.mockResolvedValue(sb as any)
    createServerClientMock.mockResolvedValue(sb as any)

    const res = await POST(jsonRequest({ priceId: 'price_invalido' }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('priceId inválido')
    expect(stripe.checkout.sessions.create).not.toHaveBeenCalled()
  })

  it('cria sessão de checkout com sucesso', async () => {
    const sb = makeSupabaseMock()
    createClientMock.mockResolvedValue(sb as any)
    createServerClientMock.mockResolvedValue(sb as any)
    stripe.checkout.sessions.create.mockResolvedValue({
      id: 'cs_test_1',
      url: 'https://stripe.com/checkout/cs_test_1',
    })

    const res = await POST(jsonRequest({ priceId: STRIPE_PRICE_IDS.CONSUMIDOR_BASICO }))

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.url).toBe('https://stripe.com/checkout/cs_test_1')
    expect(body.sessionId).toBe('cs_test_1')
    expect(stripe.checkout.sessions.create).toHaveBeenCalledTimes(1)
  })

  it('envia metadata correta para Stripe (planoTipo + planoCodigo + planoNome + userId)', async () => {
    const sb = makeSupabaseMock()
    createClientMock.mockResolvedValue(sb as any)
    createServerClientMock.mockResolvedValue(sb as any)
    stripe.checkout.sessions.create.mockResolvedValue({ id: 'cs', url: 'x' })

    await POST(jsonRequest({ priceId: STRIPE_PRICE_IDS.CONSUMIDOR_PREMIUM }))

    const call = stripe.checkout.sessions.create.mock.calls[0][0]
    expect(call.metadata).toEqual({
      userId: mockUser.id,
      userEmail: mockUser.email,
      planoTipo: 'consumidor',
      planoCodigo: 'premium',
      planoNome: 'Plano Premium',
    })
    expect(call.line_items[0].price).toBe(STRIPE_PRICE_IDS.CONSUMIDOR_PREMIUM)
    expect(call.mode).toBe('subscription')
  })

  it('roteia success_url/cancel_url por tipo de plano', async () => {
    const sb = makeSupabaseMock()
    createClientMock.mockResolvedValue(sb as any)
    createServerClientMock.mockResolvedValue(sb as any)
    stripe.checkout.sessions.create.mockResolvedValue({ id: 'cs', url: 'x' })

    await POST(jsonRequest({ priceId: STRIPE_PRICE_IDS.GERADOR_STARTER }))

    const call = stripe.checkout.sessions.create.mock.calls[0][0]
    expect(call.success_url).toContain('/dashboard-gerador?success=true')
    expect(call.cancel_url).toContain('/checkout-gerador?canceled=true')
    expect(call.metadata.planoTipo).toBe('gerador')
  })

  it('passa subscription_data.metadata para o subscription no Stripe', async () => {
    const sb = makeSupabaseMock()
    createClientMock.mockResolvedValue(sb as any)
    createServerClientMock.mockResolvedValue(sb as any)
    stripe.checkout.sessions.create.mockResolvedValue({ id: 'cs', url: 'x' })

    await POST(jsonRequest({ priceId: STRIPE_PRICE_IDS.MEMBER_PLUS }))

    const call = stripe.checkout.sessions.create.mock.calls[0][0]
    expect(call.subscription_data.metadata.planoTipo).toBe('member_plus')
  })

  it('retorna 500 quando Stripe falha', async () => {
    const sb = makeSupabaseMock()
    createClientMock.mockResolvedValue(sb as any)
    createServerClientMock.mockResolvedValue(sb as any)
    stripe.checkout.sessions.create.mockRejectedValue(new Error('stripe down'))

    const res = await POST(jsonRequest({ priceId: STRIPE_PRICE_IDS.CONSUMIDOR_BASICO }))
    expect(res.status).toBe(500)
  })
})

describe('GET /api/assinaturas', () => {
  it('retorna lista de assinaturas', async () => {
    const sb = makeSupabaseMock({
      resultFor: (op) =>
        op === 'await' ? { data: [{ id: 1, status: 'active' }], error: null } : { data: null, error: null },
    })
    createClientMock.mockResolvedValue(sb as any)
    createServerClientMock.mockResolvedValue(sb as any)

    const req = new Request('http://localhost/api/assinaturas') as unknown as NextRequest
    const res = await GET(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(Array.isArray(body.assinaturas)).toBe(true)
  })

  it('filtra por userId quando informado', async () => {
    let capturedFilters: any[] = []
    const sb = makeSupabaseMock({
      resultFor: (_op, _t, filters) => {
        capturedFilters = filters
        return { data: [], error: null }
      },
    })
    createClientMock.mockResolvedValue(sb as any)
    createServerClientMock.mockResolvedValue(sb as any)

    const req = new Request('http://localhost/api/assinaturas?userId=user-1') as unknown as NextRequest
    const res = await GET(req)
    expect(res.status).toBe(200)
    expect(capturedFilters.some(f => f.col === 'user_id' && f.val === 'user-1')).toBe(true)
  })
})

describe('DELETE /api/assinaturas', () => {
  it('cancela assinatura no Stripe e no banco', async () => {
    const sb = makeSupabaseMock()
    createClientMock.mockResolvedValue(sb as any)
    createServerClientMock.mockResolvedValue(sb as any)
    stripe.subscriptions.update.mockResolvedValue({ cancel_at_period_end: true })

    const res = await DELETE(jsonRequest({ subscriptionId: 'sub_1' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.cancel_at_period_end).toBe(true)
    expect(stripe.subscriptions.update).toHaveBeenCalledWith('sub_1', {
      cancel_at_period_end: true,
    })
  })
})
