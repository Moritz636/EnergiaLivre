// ============================================
// GEOLOCATION - DISTÂNCIA, COORDENADAS, GEOCODING
// ============================================
// Usado por:
//   - components/LocationCapture.tsx (UI de captura)
//   - app/api/location/route.ts (POST save)
//   - lib/matches.ts (cálculo de distância)
// ============================================

const EARTH_RADIUS_KM = 6371

export interface Coordinates {
  lat: number
  lng: number
}

export interface GeolocationResult {
  lat: number
  lng: number
  accuracy_meters?: number
}

export interface GeocodeResult {
  lat: number
  lng: number
  cidade: string
  estado: string
}

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180
}

/**
 * Calcula distância entre dois pontos geográficos (Haversine).
 * Aceita 4 args (lat1, lng1, lat2, lng2) ou 2 objetos Coordinates.
 * Retorna distância em quilômetros.
 */
export function calculateDistance(
  lat1OrA: number | Coordinates,
  lng1OrB: number | Coordinates,
  lat2?: number,
  lng2?: number,
): number {
  let a: Coordinates
  let b: Coordinates
  if (typeof lat1OrA === 'object') {
    a = lat1OrA
    b = lng1OrB as Coordinates
  } else {
    a = { lat: lat1OrA, lng: lng1OrB as number }
    b = { lat: lat2!, lng: lng2! }
  }
  const dLat = toRadians(b.lat - a.lat)
  const dLng = toRadians(b.lng - a.lng)
  const lat1 = toRadians(a.lat)
  const lat2R = toRadians(b.lat)

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2R) * Math.sin(dLng / 2) ** 2
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

export function isValidCoordinate(lat: unknown, lng: unknown): lat is number {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  )
}

/**
 * Geocoding gratuito via Nominatim (OpenStreetMap).
 * Não requer API key. Limite: 1 req/segundo (uso justo).
 */
export async function geocodeCidadeUF(
  cidade: string,
  estado: string,
  signal?: AbortSignal,
): Promise<GeocodeResult | null> {
  if (!cidade?.trim() || !estado?.trim()) return null
  const query = encodeURIComponent(`${cidade}, ${estado}, Brasil`)
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=br`

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'EnergiaLivre/1.0 (https://energialivre.dev.br)',
        'Accept-Language': 'pt-BR,pt;q=0.9',
      },
      signal,
    })
    if (!res.ok) {
      throw new Error(`Nominatim retornou ${res.status}`)
    }
    const data = (await res.json()) as Array<{
      lat: string
      lon: string
      display_name?: string
    }>
    if (!data.length) return null
    const lat = Number(data[0].lat)
    const lng = Number(data[0].lon)
    if (!isValidCoordinate(lat, lng)) return null
    return { lat, lng, cidade, estado: estado.toUpperCase() }
  } catch (err) {
    throw err
  }
}

type SupabaseLike = {
  from: (table: string) => any
}

/**
 * Salva (upsert) a localização do usuário na tabela user_locations.
 * - Chave de conflito: user_id (1 location por usuário)
 */
export async function saveUserLocation(
  supabase: SupabaseLike,
  userId: string,
  lat: number,
  lng: number,
  cidade?: string,
  estado?: string,
  accuracyMeters?: number,
  source: 'browser' | 'geocoded' | 'manual' = 'manual',
  endereco?: string,
  cep?: string,
): Promise<{ success: boolean; message?: string }> {
  if (!isValidCoordinate(lat, lng)) {
    return { success: false, message: 'Coordenadas inválidas' }
  }

  const row = {
    user_id: userId,
    lat,
    lng,
    cidade: cidade?.trim() ?? null,
    estado: estado?.trim().toUpperCase() ?? null,
    endereco: endereco?.trim() ?? null,
    cep: cep?.replace(/\D/g, '') || null,
    accuracy_meters: accuracyMeters ?? null,
    source,
    updated_at: new Date().toISOString(),
  }

  try {
    const sb: any = supabase
    const result = await sb.from('user_locations').upsert(row, { onConflict: 'user_id' })
    if (result?.error) {
      return { success: false, message: result.error.message ?? 'Erro ao salvar' }
    }
    return { success: true }
  } catch (err: any) {
    return { success: false, message: err?.message ?? 'Erro inesperado' }
  }
}

export interface GetCurrentPositionOptions {
  timeoutMs?: number
  enableHighAccuracy?: boolean
  maximumAge?: number
}

/**
 * Wrapper em torno de navigator.geolocation.getCurrentPosition.
 * Rejeita se o navegador não suportar ou se a permissão for negada.
 */
export function getCurrentPosition(
  options: GetCurrentPositionOptions = {},
): Promise<GeolocationResult> {
  const { timeoutMs = 10_000, enableHighAccuracy = true, maximumAge = 60_000 } = options

  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocalização não suportada neste navegador'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy_meters: Math.round(pos.coords.accuracy),
        })
      },
      (err) => reject(new Error(err.message || 'Permissão negada')),
      { enableHighAccuracy, timeout: timeoutMs, maximumAge },
    )
  })
}
