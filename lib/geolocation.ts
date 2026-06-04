// ============================================
// GEOLOCATION - DISTÂNCIA, COORDENADAS, GEOCODING
// ============================================
// Usado por:
//   - components/LocationCapture.tsx (UI de captura)
//   - app/api/location/route.ts (POST save)
//   - lib/matches.ts (cálculo de distância)
// ============================================

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

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

/**
 * Calcula distância entre dois pontos geográficos (Haversine).
 * Retorna distância em quilômetros.
 */
export function calculateDistance(a: Coordinates, b: Coordinates): number {
  const dLat = toRadians(b.lat - a.lat)
  const dLng = toRadians(b.lng - a.lng)
  const lat1 = toRadians(a.lat)
  const lat2 = toRadians(b.lat)

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180
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
        'User-Agent': 'EnergiaLivre/1.0 (https://energialivre.com.br)',
        'Accept-Language': 'pt-BR,pt;q=0.9',
      },
      signal,
    })
    if (!res.ok) return null
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
  } catch {
    return null
  }
}

export interface SaveLocationDeps {
  supabase: SupabaseClient<Database>
  userId: string
  insert?: (row: Database['public']['Tables']['user_locations']['Insert']) => Promise<{ error: any }>
  upsert?: (row: Database['public']['Tables']['user_locations']['Insert']) => Promise<{ error: any }>
}

export interface SaveLocationInput {
  lat: number
  lng: number
  cidade: string
  estado: string
  accuracy_meters?: number
  source?: 'browser' | 'geocoded' | 'manual'
}

export interface SaveLocationResult {
  success: boolean
  message?: string
}

export async function saveUserLocation(
  input: SaveLocationInput,
  deps: SaveLocationDeps,
): Promise<SaveLocationResult> {
  if (!isValidCoordinate(input.lat, input.lng)) {
    return { success: false, message: 'Coordenadas inválidas' }
  }
  if (!input.cidade?.trim() || !input.estado?.trim()) {
    return { success: false, message: 'Cidade/estado são obrigatórios' }
  }

  const row: Database['public']['Tables']['user_locations']['Insert'] = {
    user_id: deps.userId,
    lat: input.lat,
    lng: input.lng,
    cidade: input.cidade.trim(),
    estado: input.estado.trim().toUpperCase(),
    accuracy_meters: input.accuracy_meters ?? null,
    source: input.source ?? 'manual',
  }

  try {
    if (deps.upsert) {
      const { error } = await deps.upsert(row)
      if (error) return { success: false, message: error.message ?? 'Erro ao salvar' }
      return { success: true }
    }
    if (deps.insert) {
      const { error } = await deps.insert(row)
      if (error) return { success: false, message: error.message ?? 'Erro ao salvar' }
      return { success: true }
    }
    const result = await (deps.supabase
      .from('user_locations')
      .upsert(row as any) as any)
    if (result?.error) {
      return { success: false, message: result.error.message ?? 'Erro ao salvar' }
    }
    return { success: true }
  } catch (err: any) {
    return { success: false, message: err?.message ?? 'Erro inesperado' }
  }
}

export function getCurrentPosition(): Promise<GeolocationResult> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocalização não suportada neste navegador'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy_meters: Math.round(pos.coords.accuracy),
        }),
      (err) => reject(new Error(err.message || 'Permissão negada')),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    )
  })
}
