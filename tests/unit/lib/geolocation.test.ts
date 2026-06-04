import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  calculateDistance,
  isValidCoordinate,
  geocodeCidadeUF,
  getCurrentPosition,
  saveUserLocation,
} from '@/lib/geolocation'

describe('calculateDistance', () => {
  it('retorna 0 para o mesmo ponto', () => {
    const d = calculateDistance(-23.5505, -46.6333, -23.5505, -46.6333)
    expect(d).toBeCloseTo(0, 5)
  })

  it('calcula distância SP→RJ (~360 km)', () => {
    const sp = { lat: -23.5505, lng: -46.6333 }
    const rj = { lat: -22.9068, lng: -43.1729 }
    const d = calculateDistance(sp.lat, sp.lng, rj.lat, rj.lng)
    expect(d).toBeGreaterThan(350)
    expect(d).toBeLessThan(400)
  })

  it('é simétrico', () => {
    const a = { lat: 10, lng: 20 }
    const b = { lat: 30, lng: 40 }
    const d1 = calculateDistance(a.lat, a.lng, b.lat, b.lng)
    const d2 = calculateDistance(b.lat, b.lng, a.lat, a.lng)
    expect(d1).toBeCloseTo(d2, 5)
  })
})

describe('isValidCoordinate', () => {
  it('aceita coordenadas válidas', () => {
    expect(isValidCoordinate(-23.5, -46.6)).toBe(true)
    expect(isValidCoordinate(0, 0)).toBe(true)
    expect(isValidCoordinate(89.9, 179.9)).toBe(true)
  })

  it('rejeita latitudes inválidas', () => {
    expect(isValidCoordinate(91, 0)).toBe(false)
    expect(isValidCoordinate(-91, 0)).toBe(false)
  })

  it('rejeita longitudes inválidas', () => {
    expect(isValidCoordinate(0, 181)).toBe(false)
    expect(isValidCoordinate(0, -181)).toBe(false)
  })

  it('rejeita NaN/null', () => {
    expect(isValidCoordinate(NaN, 0)).toBe(false)
    expect(isValidCoordinate(0, NaN)).toBe(false)
  })
})

describe('geocodeCidadeUF', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('retorna null quando Nominatim devolve 0 resultados', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => [],
    })) as any)
    const r = await geocodeCidadeUF('Cidade Inexistente', 'XX')
    expect(r).toBeNull()
  })

  it('retorna lat/lng quando Nominatim encontra', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => [{
        lat: '-23.5505',
        lon: '-46.6333',
        address: { city: 'São Paulo', state: 'São Paulo' },
      }],
    })) as any)

    const r = await geocodeCidadeUF('São Paulo', 'SP')
    expect(r).not.toBeNull()
    expect(r?.lat).toBeCloseTo(-23.5505, 3)
    expect(r?.lng).toBeCloseTo(-46.6333, 3)
  })

  it('lança erro quando fetch falha', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 500 })) as any)
    await expect(geocodeCidadeUF('SP', 'SP')).rejects.toThrow()
  })
})

describe('getCurrentPosition', () => {
  const originalGeolocation = (globalThis as any).navigator?.geolocation

  afterEach(() => {
    if (originalGeolocation) {
      ;(globalThis as any).navigator.geolocation = originalGeolocation
    }
  })

  it('rejeita quando navegador não tem geolocation', async () => {
    if ((globalThis as any).navigator) {
      delete (globalThis as any).navigator.geolocation
    }
    await expect(getCurrentPosition({ timeoutMs: 1000 })).rejects.toThrow(/Geolocalização/)
  })

  it('resolve com coords quando getCurrentPosition tem sucesso', async () => {
    ;(globalThis as any).navigator = (globalThis as any).navigator || {}
    ;(globalThis as any).navigator.geolocation = {
      getCurrentPosition: (success: any) => {
        success({ coords: { latitude: 1, longitude: 2, accuracy: 10 } })
      },
    }
    const pos = await getCurrentPosition({ timeoutMs: 1000 })
    expect(pos.lat).toBe(1)
    expect(pos.lng).toBe(2)
  })

  it('rejeita quando getCurrentPosition retorna erro', async () => {
    ;(globalThis as any).navigator = (globalThis as any).navigator || {}
    ;(globalThis as any).navigator.geolocation = {
      getCurrentPosition: (_s: any, err: any) => err(new Error('Permission denied')),
    }
    await expect(getCurrentPosition({ timeoutMs: 1000 })).rejects.toThrow(/Permission denied/)
  })
})

describe('saveUserLocation', () => {
  it('chama upsert com payload correto', async () => {
    const chain = {
      upsert: vi.fn(() => Promise.resolve({ data: null, error: null })),
    } as any
    const sb = { from: vi.fn(() => chain) } as any

    await saveUserLocation(sb, 'u1', -23.5, -46.6, 'SP', 'SP')

    expect(sb.from).toHaveBeenCalledWith('user_locations')
    expect(chain.upsert).toHaveBeenCalled()
    const args = chain.upsert.mock.calls[0]
    expect(args[0].user_id).toBe('u1')
    expect(args[0].latitude).toBe(-23.5)
    expect(args[1]).toEqual({ onConflict: 'user_id' })
  })
})
