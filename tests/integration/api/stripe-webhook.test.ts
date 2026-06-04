import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { NextRequest } from 'next/server'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
  createServerClient: vi.fn(),
}))

import * as serverModule from '@/lib/supabase/server'
import { __stripeInstance } from 'stripe'
import { POST } from '@/app/api/stripe/webhook/route'
import { STRIPE_PRICE_IDS } from '@/lib/stripe-prices'

const createServerClientMock = vi.mocked(serverModule.createServerClient)
const stripe = __stripeInstance as unknown as {
  webhooks: { constructEvent: any }
}

type Result = { data: any; error: any; count?: number | null }

interface Call {
  table: string
  op: string
  filters: Array<{ col: string; val: any }>
  payload?: any
}

type ResultFor = (op: string, table: string, filters: Array<{ col: string; val: any }>, chain?: any) => Result

function makeSupabaseMock({
  resultFor = ((_op: string, _table: string, _filters: Array<{ col: string; val: any }>) =>
    ({ data: null, error: null } as Result)) as ResultFor,
}: { resultFor?: ResultFor } = {}) {
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
      return Promise.resolve(resultFor(op, table, chain._filters, chain))
    }
    chain.then = (onFulfilled: any, onRejected?: any) =>
      finalize(chain._lastOp || 'await').then(onFulfilled, onRejected)

    chain.select = vi.fn(function (this: any) { this._lastOp = 'select'; return this })
    chain.insert = vi.fn(function (this: any, payload: any) { this._lastOp = 'insert'; this._payload = payload; return this })
    chain.update = vi.fn(function (this: any, payload: any) { this._lastOp = 'update'; this._payload = payload; return this })
    chain.delete = vi.fn(function (this: any) { this._lastOp = 'delete'; return this })
    chain.eq = vi.fn(function (this: any, col: string, val: any) { this._filters.push({ col, val }); return this })
    chain.order = vi.fn(function (this: any) { this._lastOp = 'order'; return this })
    chain.range = vi.fn(function (this: any) { return this })
    chain.limit = vi.fn(function (this: any) { return this })
    chain.single = vi.fn(function (this: any) { return finalize('single') })
    chain.maybeSingle = vi.fn(function (this: any) { return finalize('maybeSingle') })
    return chain
  }

  return {
    _calls: calls,
    auth: { getUser: vi.fn() },
    from: vi.fn((table: string) => buildChain(table)),
  }
}

function makeWebhookRequest(body: any, signature = 't=1,v1=abc') {
  return new Request('http://localhost/api/stripe/webhook', {
    method: 'POST',
    headers: { 'stripe-signature': signature },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  }) as unknown as NextRequest
}

function makeSubscriptionEvent(type: string, overrides: any = {}) {
  return {
    type,
    data: {
      object: {
        id: 'sub_test_1',
        status: 'active',
        current_period_start: 1700000000,
        current_period_end: 1702592000,
        cancel_at_period_end: false,
        metadata: {
          userId: 'user-1',
          planoTipo: 'consumidor',
          planoNome: 'Plano Familiar',
        },
        items: {
          data: [
            { price: { id: STRIPE_PRICE_IDS.CONSUMIDOR_FAMILIAR, unit_amount: 14990 } },
          ],
        },
        ...overrides,
      },
    },
  }
}

function makeInvoiceEvent(type: string, overrides: any = {}) {
  return {
    type,
    data: {
      object: {
        id: 'in_test_1',
        subscription: 'sub_test_1',
        amount_paid: 14990,
        amount_due: 14990,
        period_start: 1700000000,
        period_end: 1702592000,
        payment_intent: 'pi_test_1',
        lines: { data: [{ description: 'Plano Teste' }] },
        ...overrides,
      },
    },
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('POST /api/stripe/webhook', () => {
  it('retorna 400 quando assinatura do webhook é inválida', async () => {
    stripe.webhooks.constructEvent.mockImplementation(() => {
      throw new Error('Invalid signature')
    })

    const res = await POST(makeWebhookRequest('{}', 'invalid'))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('Webhook signature verification failed')
  })

  it('customer.subscription.created: insere assinatura quando nova', async () => {
    const sb = makeSupabaseMock({
      resultFor: (op, table) => {
        // Não existe assinatura ainda
        if (op === 'single' && table === 'assinaturas') return { data: null, error: null }
        // Lead não tem embaixador
        if (op === 'single' && table === 'leads') return { data: null, error: null }
        return { data: null, error: null }
      },
    })
    createServerClientMock.mockResolvedValue(sb as any)
    stripe.webhooks.constructEvent.mockReturnValue(makeSubscriptionEvent('customer.subscription.created'))

    const res = await POST(makeWebhookRequest('{}'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.received).toBe(true)

    // Verifica que houve insert em assinaturas
    const insertAssinatura = sb._calls.find(c => c.table === 'assinaturas' && c.op === 'insert')
    expect(insertAssinatura).toBeTruthy()
    expect(insertAssinatura?.payload.user_id).toBe('user-1')
    expect(insertAssinatura?.payload.stripe_subscription_id).toBe('sub_test_1')
    expect(insertAssinatura?.payload.valor_mensal).toBe(149.9) // 14990/100
    expect(insertAssinatura?.payload.kwh_mensais).toBe(500) // CONSUMIDOR_FAMILIAR
    expect(insertAssinatura?.payload.economia_percentual).toBe(32) // CONSUMIDOR_FAMILIAR
    expect(insertAssinatura?.payload.tipo_plano).toBe('consumidor')
    expect(insertAssinatura?.payload.nome_plano).toBe('Plano Familiar')
  })

  it('customer.subscription.created: pula insert se já existe (idempotência)', async () => {
    const sb = makeSupabaseMock({
      resultFor: (op, table) => {
        if (op === 'single' && table === 'assinaturas') {
          return { data: { id: 99 }, error: null } // já existe
        }
        return { data: null, error: null }
      },
    })
    createServerClientMock.mockResolvedValue(sb as any)
    stripe.webhooks.constructEvent.mockReturnValue(makeSubscriptionEvent('customer.subscription.created'))

    const res = await POST(makeWebhookRequest('{}'))
    expect(res.status).toBe(200)

    const inserts = sb._calls.filter(c => c.op === 'insert')
    expect(inserts).toHaveLength(0)
  })

  it('customer.subscription.created: cria comissão de cadastro quando há embaixador', async () => {
    const sb = makeSupabaseMock({
      resultFor: (op, table) => {
        if (op === 'single' && table === 'assinaturas') return { data: null, error: null }
        if (op === 'single' && table === 'leads') {
          return { data: { embaixador_id: 'embaixador-1' }, error: null }
        }
        return { data: null, error: null }
      },
    })
    createServerClientMock.mockResolvedValue(sb as any)
    stripe.webhooks.constructEvent.mockReturnValue(makeSubscriptionEvent('customer.subscription.created'))

    const res = await POST(makeWebhookRequest('{}'))
    expect(res.status).toBe(200)

    const comissaoInsert = sb._calls.find(c => c.table === 'comissoes' && c.op === 'insert')
    expect(comissaoInsert).toBeTruthy()
    expect(comissaoInsert?.payload.embaixador_id).toBe('embaixador-1')
    expect(comissaoInsert?.payload.tipo_comissao).toBe('cadastro')
    expect(comissaoInsert?.payload.percentual).toBe(100)
    expect(comissaoInsert?.payload.status_pagamento).toBe('pago')
  })

  it('invoice.payment_succeeded: atualiza status e registra pagamento', async () => {
    const sb = makeSupabaseMock({
      resultFor: (op, table) => {
        if (op === 'single' && table === 'assinaturas') {
          return { data: { user_id: 'user-1' }, error: null }
        }
        if (op === 'single' && table === 'leads') return { data: null, error: null }
        return { data: null, error: null }
      },
    })
    createServerClientMock.mockResolvedValue(sb as any)
    stripe.webhooks.constructEvent.mockReturnValue(makeInvoiceEvent('invoice.payment_succeeded'))

    const res = await POST(makeWebhookRequest('{}'))
    expect(res.status).toBe(200)

    // Update de status
    const updateAssinatura = sb._calls.find(c => c.table === 'assinaturas' && c.op === 'update')
    expect(updateAssinatura?.payload.status).toBe('active')

    // Insert de pagamento
    const insertPagamento = sb._calls.find(c => c.table === 'pagamentos' && c.op === 'insert')
    expect(insertPagamento?.payload.valor).toBe(149.9)
    expect(insertPagamento?.payload.status).toBe('succeeded')
    expect(insertPagamento?.payload.tipo_pagamento).toBe('assinatura')
  })

  it('invoice.payment_succeeded: cria comissão recorrente (5%) para embaixador', async () => {
    const sb = makeSupabaseMock({
      resultFor: (op, table) => {
        if (op === 'single' && table === 'assinaturas') return { data: { user_id: 'user-1' }, error: null }
        if (op === 'single' && table === 'leads') return { data: { embaixador_id: 'emb-1' }, error: null }
        return { data: null, error: null }
      },
    })
    createServerClientMock.mockResolvedValue(sb as any)
    stripe.webhooks.constructEvent.mockReturnValue(makeInvoiceEvent('invoice.payment_succeeded'))

    const res = await POST(makeWebhookRequest('{}'))
    expect(res.status).toBe(200)

    const comissaoInsert = sb._calls.find(c => c.table === 'comissoes' && c.op === 'insert')
    expect(comissaoInsert?.payload.tipo_comissao).toBe('recorrente')
    expect(comissaoInsert?.payload.percentual).toBe(5)
    // 5% de 149.9 = 7.495
    expect(comissaoInsert?.payload.valor_comissao).toBeCloseTo(7.495, 3)
  })

  it('invoice.payment_succeeded: loga erro se assinatura não encontrada', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const sb = makeSupabaseMock({
      resultFor: (op, table) => {
        if (op === 'single' && table === 'assinaturas') return { data: null, error: null }
        return { data: null, error: null }
      },
    })
    createServerClientMock.mockResolvedValue(sb as any)
    stripe.webhooks.constructEvent.mockReturnValue(makeInvoiceEvent('invoice.payment_succeeded'))

    const res = await POST(makeWebhookRequest('{}'))
    expect(res.status).toBe(200)
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('não encontrada'))
    errorSpy.mockRestore()
  })

  it('invoice.payment_failed: atualiza status para past_due', async () => {
    const sb = makeSupabaseMock({
      resultFor: (op, table) => {
        if (op === 'single' && table === 'assinaturas') return { data: { user_id: 'user-1' }, error: null }
        return { data: null, error: null }
      },
    })
    createServerClientMock.mockResolvedValue(sb as any)
    stripe.webhooks.constructEvent.mockReturnValue(makeInvoiceEvent('invoice.payment_failed'))

    const res = await POST(makeWebhookRequest('{}'))
    expect(res.status).toBe(200)

    const update = sb._calls.find(c => c.table === 'assinaturas' && c.op === 'update')
    expect(update?.payload.status).toBe('past_due')

    const insertPagamento = sb._calls.find(c => c.table === 'pagamentos' && c.op === 'insert')
    expect(insertPagamento?.payload.status).toBe('failed')
  })

  it('customer.subscription.updated: atualiza status, datas e cancel_at_period_end', async () => {
    const sb = makeSupabaseMock()
    createServerClientMock.mockResolvedValue(sb as any)
    stripe.webhooks.constructEvent.mockReturnValue(
      makeSubscriptionEvent('customer.subscription.updated', {
        status: 'past_due',
        cancel_at_period_end: true,
      })
    )

    const res = await POST(makeWebhookRequest('{}'))
    expect(res.status).toBe(200)

    const update = sb._calls.find(c => c.table === 'assinaturas' && c.op === 'update')
    expect(update?.payload.status).toBe('past_due')
    expect(update?.payload.cancel_at_period_end).toBe(true)
  })

  it('customer.subscription.deleted: cancela assinatura e comissões pendentes', async () => {
    const sb = makeSupabaseMock()
    createServerClientMock.mockResolvedValue(sb as any)
    stripe.webhooks.constructEvent.mockReturnValue(
      makeSubscriptionEvent('customer.subscription.deleted', {
        metadata: { userId: 'user-1' },
      })
    )

    const res = await POST(makeWebhookRequest('{}'))
    expect(res.status).toBe(200)

    const updateAssinatura = sb._calls.find(
      c => c.table === 'assinaturas' && c.op === 'update'
    )
    expect(updateAssinatura?.payload.status).toBe('canceled')
    expect(updateAssinatura?.payload.canceled_at).toBeTruthy()

    const updateComissoes = sb._calls.find(
      c => c.table === 'comissoes' && c.op === 'update'
    )
    expect(updateComissoes?.payload.status_pagamento).toBe('cancelado')
  })

  it('charge.refunded: insere pagamento refunded', async () => {
    const sb = makeSupabaseMock({
      resultFor: (op, table) => {
        if (op === 'single' && table === 'assinaturas') {
          return { data: { user_id: 'user-1' }, error: null }
        }
        return { data: null, error: null }
      },
    })
    createServerClientMock.mockResolvedValue(sb as any)
    stripe.webhooks.constructEvent.mockReturnValue({
      type: 'charge.refunded',
      data: {
        object: {
          id: 'ch_test_1',
          customer: 'cus_test_1',
          invoice: 'sub_test_1',
          amount_refunded: 14990,
        },
      },
    })

    const res = await POST(makeWebhookRequest('{}'))
    expect(res.status).toBe(200)

    const insertPagamento = sb._calls.find(c => c.table === 'pagamentos' && c.op === 'insert')
    expect(insertPagamento?.payload.status).toBe('refunded')
    expect(insertPagamento?.payload.valor).toBe(149.9)
  })

  it('eventos desconhecidos são apenas logados', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const sb = makeSupabaseMock()
    createServerClientMock.mockResolvedValue(sb as any)
    stripe.webhooks.constructEvent.mockReturnValue({
      type: 'unknown.event',
      data: { object: {} },
    })

    const res = await POST(makeWebhookRequest('{}'))
    expect(res.status).toBe(200)
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Unhandled event type'))
    logSpy.mockRestore()
  })

  // ============================================
  // MEMBER PLUS
  // ============================================
  it('member_plus: customer.subscription.created ativa flag em profiles (não insere em assinaturas)', async () => {
    const sb = makeSupabaseMock()
    createServerClientMock.mockResolvedValue(sb as any)
    stripe.webhooks.constructEvent.mockReturnValue(
      makeSubscriptionEvent('customer.subscription.created', {
        metadata: { userId: 'user-mp-1', planoTipo: 'member_plus' },
      })
    )

    const res = await POST(makeWebhookRequest('{}'))
    expect(res.status).toBe(200)

    const updateProfile = sb._calls.find(c => c.table === 'profiles' && c.op === 'update')
    expect(updateProfile?.payload.member_plus_active).toBe(true)
    expect(updateProfile?.payload.member_plus_expires_at).toBeTruthy()

    const insertAssinatura = sb._calls.find(c => c.table === 'assinaturas' && c.op === 'insert')
    expect(insertAssinatura).toBeUndefined()
  })

  it('gerador: customer.subscription.created insere assinatura com tipo_plano=gerador', async () => {
    const sb = makeSupabaseMock({
      resultFor: (op, table) => {
        if (op === 'single' && table === 'assinaturas') return { data: null, error: null }
        if (op === 'single' && table === 'leads') return { data: null, error: null }
        return { data: null, error: null }
      },
    })
    createServerClientMock.mockResolvedValue(sb as any)
    stripe.webhooks.constructEvent.mockReturnValue(
      makeSubscriptionEvent('customer.subscription.created', {
        metadata: { userId: 'user-g-1', planoTipo: 'gerador', planoNome: 'Solar Pro' },
        items: { data: [{ price: { id: STRIPE_PRICE_IDS.GERADOR_PRO, unit_amount: 9990 } }] },
      })
    )

    const res = await POST(makeWebhookRequest('{}'))
    expect(res.status).toBe(200)

    const insertAssinatura = sb._calls.find(c => c.table === 'assinaturas' && c.op === 'insert')
    expect(insertAssinatura?.payload.tipo_plano).toBe('gerador')
    expect(insertAssinatura?.payload.nome_plano).toBe('Solar Pro')
    expect(insertAssinatura?.payload.capacidade_kwp).toBe(100)
  })

  it('member_plus: invoice.payment_succeeded atualiza member_plus_expires_at', async () => {
    const sb = makeSupabaseMock({
      resultFor: (op, table) => {
        if (op === 'single' && table === 'assinaturas') return { data: { user_id: 'user-mp-1' }, error: null }
        return { data: null, error: null }
      },
    })
    createServerClientMock.mockResolvedValue(sb as any)
    stripe.webhooks.constructEvent.mockReturnValue(
      makeInvoiceEvent('invoice.payment_succeeded', {
        lines: { data: [{ description: 'Member Plus', metadata: { planoTipo: 'member_plus' } }] },
      })
    )

    const res = await POST(makeWebhookRequest('{}'))
    expect(res.status).toBe(200)

    const updateProfile = sb._calls.find(c => c.table === 'profiles' && c.op === 'update')
    expect(updateProfile?.payload.member_plus_active).toBe(true)
    expect(updateProfile?.payload.member_plus_expires_at).toBeTruthy()
  })

  it('member_plus: customer.subscription.deleted desativa member_plus', async () => {
    const sb = makeSupabaseMock()
    createServerClientMock.mockResolvedValue(sb as any)
    stripe.webhooks.constructEvent.mockReturnValue(
      makeSubscriptionEvent('customer.subscription.deleted', {
        metadata: { userId: 'user-mp-1', planoTipo: 'member_plus' },
      })
    )

    const res = await POST(makeWebhookRequest('{}'))
    expect(res.status).toBe(200)

    const updateProfile = sb._calls.find(c => c.table === 'profiles' && c.op === 'update')
    expect(updateProfile?.payload.member_plus_active).toBe(false)

    const updateAssinatura = sb._calls.find(c => c.table === 'assinaturas' && c.op === 'update')
    expect(updateAssinatura).toBeUndefined()
  })
})
