import { describe, it, expect } from 'vitest'
import { GET } from '@/app/api/health/route'

describe('GET /api/health', () => {
  it('retorna 200 com status healthy', async () => {
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.status).toBe('healthy')
  })

  it('inclui service name e version', async () => {
    const res = await GET()
    const body = await res.json()
    expect(body.service).toBe('energia-livre')
    expect(body.version).toBe('2.0.0')
  })

  it('reporta env vars de supabase e stripe', async () => {
    const res = await GET()
    const body = await res.json()
    expect(body.env.supabase).toBe(true)
    expect(body.env.stripe).toBe(true)
    expect(typeof body.env.node).toBe('string')
  })

  it('inclui timestamp e uptime', async () => {
    const res = await GET()
    const body = await res.json()
    expect(typeof body.timestamp).toBe('string')
    expect(new Date(body.timestamp).toString()).not.toBe('Invalid Date')
    expect(typeof body.uptime).toBe('number')
  })

  it('mede latência do próprio check', async () => {
    const res = await GET()
    const body = await res.json()
    expect(body.api.status).toBe('ok')
    expect(typeof body.api.latency).toBe('number')
    expect(body.api.latency).toBeGreaterThanOrEqual(0)
  })
})
