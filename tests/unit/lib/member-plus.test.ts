import { describe, it, expect, vi } from 'vitest'
import {
  isMemberPlus,
  getMemberPlusStatus,
  activateMemberPlus,
  deactivateMemberPlus,
} from '@/lib/member-plus'

function makeSelectSupabase(profile: any) {
  const chain: any = {
    select: vi.fn(function (this: any) { return this }),
    eq: vi.fn(function (this: any) { return this }),
    single: vi.fn(async () => ({ data: profile, error: null })),
  }
  return { from: vi.fn(() => chain) } as any
}

function makeUpdateSupabase(updateResult: any = { error: null }) {
  const chain: any = {
    update: vi.fn(function (this: any) { return this }),
    eq: vi.fn(async () => updateResult),
  }
  return { from: vi.fn(() => chain) } as any
}

describe('isMemberPlus', () => {
  it('retorna false quando profile é null', async () => {
    const sb = makeSelectSupabase(null)
    expect(await isMemberPlus(sb, 'u1')).toBe(false)
  })

  it('retorna false quando member_plus_active é false', async () => {
    const sb = makeSelectSupabase({ member_plus_active: false })
    expect(await isMemberPlus(sb, 'u1')).toBe(false)
  })

  it('retorna false quando expires_at já passou', async () => {
    const sb = makeSelectSupabase({
      member_plus_active: true,
      member_plus_expires_at: new Date(Date.now() - 1000).toISOString(),
    })
    expect(await isMemberPlus(sb, 'u1')).toBe(false)
  })

  it('retorna true quando ativo e dentro do prazo', async () => {
    const sb = makeSelectSupabase({
      member_plus_active: true,
      member_plus_expires_at: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    })
    expect(await isMemberPlus(sb, 'u1')).toBe(true)
  })
})

describe('getMemberPlusStatus', () => {
  it('retorna status inativo quando sem profile', async () => {
    const sb = makeSelectSupabase(null)
    const status = await getMemberPlusStatus(sb, 'u1')
    expect(status.active).toBe(false)
    expect(status.daysRemaining).toBeNull()
  })

  it('calcula daysRemaining corretamente', async () => {
    const days = 15
    const sb = makeSelectSupabase({
      member_plus_active: true,
      member_plus_activated_at: new Date().toISOString(),
      member_plus_expires_at: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString(),
    })
    const status = await getMemberPlusStatus(sb, 'u1')
    expect(status.active).toBe(true)
    expect(status.daysRemaining).toBeGreaterThanOrEqual(days - 1)
    expect(status.daysRemaining).toBeLessThanOrEqual(days)
  })
})

describe('activateMemberPlus', () => {
  it('chama update com expires_at 30 dias no futuro', async () => {
    const sb = makeUpdateSupabase()

    await activateMemberPlus(sb, 'u1')

    expect(sb.from).toHaveBeenCalledWith('profiles')
    const updateCall = (sb.from as any).mock.results[0].value.update.mock.calls[0]
    const payload = updateCall[0]
    expect(payload.member_plus_active).toBe(true)
    expect(payload.member_plus_activated_at).toBeTruthy()
    expect(new Date(payload.member_plus_expires_at).getTime()).toBeGreaterThan(Date.now() + 29 * 24 * 60 * 60 * 1000)
  })

  it('aceita duração custom em dias', async () => {
    const sb = makeUpdateSupabase()

    await activateMemberPlus(sb, 'u1', 90)

    const updateCall = (sb.from as any).mock.results[0].value.update.mock.calls[0]
    const payload = updateCall[0]
    const expiresAt = new Date(payload.member_plus_expires_at).getTime()
    const expected = Date.now() + 90 * 24 * 60 * 60 * 1000
    expect(Math.abs(expiresAt - expected)).toBeLessThan(5000)
  })
})

describe('deactivateMemberPlus', () => {
  it('chama update com member_plus_active=false', async () => {
    const sb = makeUpdateSupabase()

    await deactivateMemberPlus(sb, 'u1')

    const updateCall = (sb.from as any).mock.results[0].value.update.mock.calls[0]
    expect(updateCall[0]).toEqual({ member_plus_active: false, member_plus_expires_at: null })
  })
})
