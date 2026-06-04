import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { NextRequest } from 'next/server'

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

    const res = await POST(jsonRequest({ priceId: 'price_x' }))
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Não autenticado')
  })

  it('cria sessão de checkout com sucesso', async () => {
    const sb = makeSupabaseMock()
    createClientMock.mockResolvedValue(sb as any)
    stripe.checkout.sessions.create.mockResolvedValue({
      url: 'https://checkout.stripe.com/cs_test_abc',
    })

    const res = await POST(jsonRequest({ priceId: 'price_premium' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.url).toBe('https://checkout.stripe.com/cs_test_abc')
  })

  it('envia priceId, email e metadata com userId/userEmail', async () => {
    const sb = makeSupabaseMock()
    createClientMock.mockResolvedValue(sb as any)
    stripe.checkout.sessions.create.mockResolvedValue({ url: 'x' })

    await POST(jsonRequest({ priceId: 'price_basico' }))

    const call = stripe.checkout.sessions.create.mock.calls[0][0]
    expect(call.line_items[0]).toEqual({ price: 'price_basico', quantity: 1 })
    expect(call.mode).toBe('subscription')
    expect(call.payment_method_types).toEqual(['card'])
    expect(call.customer_email).toBe(mockUser.email)
    expect(call.metadata).toEqual({
      userId: mockUser.id,
      userEmail: mockUser.email,
    })
  })

  it('inclui success_url e cancel_url baseados no env', async () => {
    const sb = makeSupabaseMock()
    createClientMock.mockResolvedValue(sb as any)
    stripe.checkout.sessions.create.mockResolvedValue({ url: 'x' })

    await POST(jsonRequest({ priceId: 'price_x' }))

    const call = stripe.checkout.sessions.create.mock.calls[0][0]
    expect(call.success_url).toContain('/dashboard?success=true')
    expect(call.cancel_url).toContain('/checkout')
  })

  it('retorna 500 quando Stripe falha', async () => {
    const sb = makeSupabaseMock()
    createClientMock.mockResolvedValue(sb as any)
    stripe.checkout.sessions.create.mockRejectedValue(new Error('Stripe down'))

    const res = await POST(jsonRequest({ priceId: 'price_x' }))
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toBe('Stripe down')
  })
})
