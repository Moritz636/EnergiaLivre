import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { NextRequest } from 'next/server'
import { STRIPE_PRICE_IDS } from '@/lib/stripe-prices'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
  createServerClient: vi.fn(),
}))

import * as serverModule from '@/lib/supabase/server'
import { __stripeInstance } from 'stripe'
import { POST } from '@/app/api/stripe/checkout/route'

const createClientMock = vi.mocked(serverModule.createClient)
const stripe = __stripeInstance as unknown as {
  checkout: { sessions: { create: any; expire: any } }
}

const mockUser = { id: 'user-1', email: 'comprador@energia.livre' }

function makeSupabaseMock({ user = mockUser }: { user?: any } = {}) {
  return {
    auth: {
      getUser: vi.fn(async () => ({ data: { user }, error: null })),
    },
    from: vi.fn(),
  }
}

function jsonRequest(body: any) {
  return new Request('http://localhost/api/stripe/checkout', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }) as unknown as NextRequest
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('POST /api/stripe/checkout', () => {
  it('retorna 401 quando não autenticado', async () => {
    const sb = makeSupabaseMock({ user: null })
    createClientMock.mockResolvedValue(sb as any)

    const res = await POST(jsonRequest({ priceId: STRIPE_PRICE_IDS.CONSUMIDOR_BASICO }))
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Não autenticado')
  })

  it('retorna 400 quando priceId é inválido', async () => {
    const sb = makeSupabaseMock()
    createClientMock.mockResolvedValue(sb as any)

    const res = await POST(jsonRequest({ priceId: 'price_invalido' }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('priceId inválido')
  })

  it('cria sessão de checkout com sucesso', async () => {
    const sb = makeSupabaseMock()
    createClientMock.mockResolvedValue(sb as any)
    stripe.checkout.sessions.create.mockResolvedValue({
      url: 'https://checkout.stripe.com/cs_test_abc',
      id: 'cs_test_abc',
    })

    const res = await POST(jsonRequest({ priceId: STRIPE_PRICE_IDS.CONSUMIDOR_PREMIUM }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.url).toBe('https://checkout.stripe.com/cs_test_abc')
    expect(body.sessionId).toBe('cs_test_abc')
  })

  it('envia priceId, email e metadata com userId/userEmail/planoTipo/planoCodigo/planoNome', async () => {
    const sb = makeSupabaseMock()
    createClientMock.mockResolvedValue(sb as any)
    stripe.checkout.sessions.create.mockResolvedValue({ url: 'x', id: 's' })

    await POST(jsonRequest({ priceId: STRIPE_PRICE_IDS.CONSUMIDOR_BASICO }))

    const call = stripe.checkout.sessions.create.mock.calls[0][0]
    expect(call.line_items[0]).toEqual({ price: STRIPE_PRICE_IDS.CONSUMIDOR_BASICO, quantity: 1 })
    expect(call.mode).toBe('subscription')
    expect(call.payment_method_types).toEqual(['card'])
    expect(call.customer_email).toBe(mockUser.email)
    expect(call.metadata).toEqual({
      userId: mockUser.id,
      userEmail: mockUser.email,
      planoTipo: 'consumidor',
      planoCodigo: 'basico',
      planoNome: 'Plano Básico',
    })
  })

  it('usa success_url/cancel_url customizados quando enviados', async () => {
    const sb = makeSupabaseMock()
    createClientMock.mockResolvedValue(sb as any)
    stripe.checkout.sessions.create.mockResolvedValue({ url: 'x', id: 's' })

    await POST(jsonRequest({
      priceId: STRIPE_PRICE_IDS.GERADOR_PRO,
      planoTipo: 'gerador',
      successUrl: 'https://example.com/done',
      cancelUrl: 'https://example.com/cancel',
    }))

    const call = stripe.checkout.sessions.create.mock.calls[0][0]
    expect(call.success_url).toBe('https://example.com/done')
    expect(call.cancel_url).toBe('https://example.com/cancel')
    expect(call.metadata.planoTipo).toBe('gerador')
  })

  it('rota /dashboard-gerador quando plano é gerador e não há URL custom', async () => {
    const sb = makeSupabaseMock()
    createClientMock.mockResolvedValue(sb as any)
    stripe.checkout.sessions.create.mockResolvedValue({ url: 'x', id: 's' })

    await POST(jsonRequest({ priceId: STRIPE_PRICE_IDS.GERADOR_STARTER }))

    const call = stripe.checkout.sessions.create.mock.calls[0][0]
    expect(call.success_url).toContain('/dashboard-gerador?success=true')
    expect(call.cancel_url).toContain('/checkout-gerador?canceled=true')
    expect(call.metadata.planoTipo).toBe('gerador')
    expect(call.metadata.planoCodigo).toBe('starter')
  })

  it('rota /dashboard/match quando plano é member_plus e não há URL custom', async () => {
    const sb = makeSupabaseMock()
    createClientMock.mockResolvedValue(sb as any)
    stripe.checkout.sessions.create.mockResolvedValue({ url: 'x', id: 's' })

    await POST(jsonRequest({ priceId: STRIPE_PRICE_IDS.MEMBER_PLUS }))

    const call = stripe.checkout.sessions.create.mock.calls[0][0]
    expect(call.success_url).toContain('/dashboard/match?success=true')
    expect(call.cancel_url).toContain('/dashboard/match?canceled=true')
    expect(call.metadata.planoTipo).toBe('member_plus')
  })

  it('retorna 500 quando Stripe falha', async () => {
    const sb = makeSupabaseMock()
    createClientMock.mockResolvedValue(sb as any)
    stripe.checkout.sessions.create.mockRejectedValue(new Error('Stripe down'))

    const res = await POST(jsonRequest({ priceId: STRIPE_PRICE_IDS.CONSUMIDOR_BASICO }))
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toBe('Stripe down')
  })
})
