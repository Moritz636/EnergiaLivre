// ============================================
// GOOGLE PLACES - LOADER + AUTOCOMPLETE
// ============================================
// Com fallback automático para Nominatim (OpenStreetMap)
// quando GOOGLE_MAPS_API_KEY não está configurada.
//
// Custo Google:
//   - $200/mês de crédito grátis (cobre ~70k geocodings)
//   - Places Autocomplete (novo): "per session" ~$2.83/1k
//   - Geocoding API: $5/1k requisições
//
// Setup (opcional):
//   1. https://console.cloud.google.com → criar projeto
//   2. Ativar APIs: Places API (New), Geocoding API
//   3. Criar API Key com restrição HTTP referrer (energialivre.dev.br/*)
//   4. Adicionar ao .env.local e Vercel:
//        NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...
// ============================================

export interface PlaceResult {
  /** Endereço formatado (Rua, Número, Bairro, Cidade - UF) */
  formattedAddress: string
  /** Componentes do endereço (street, city, state, country, postal_code) */
  components: PlaceComponents
  /** Latitude (se disponível) */
  lat: number | null
  /** Longitude (se disponível) */
  lng: number | null
  /** ID único do lugar (Google Place ID) */
  placeId: string | null
  /** Fonte do resultado */
  source: 'google' | 'nominatim'
}

export interface PlaceComponents {
  street?: string
  number?: string
  neighborhood?: string
  city?: string
  state?: string
  stateCode?: string // UF (2 letras)
  country?: string
  countryCode?: string
  postalCode?: string
}

export interface AutocompleteSuggestion {
  /** Texto principal a exibir */
  mainText: string
  /** Texto secundário (cidade, estado) */
  secondaryText: string
  /** ID único (Place ID do Google, ou índice do Nominatim) */
  id: string
  /** Resultado completo, se já selecionado */
  place?: PlaceResult
}

const GOOGLE_SCRIPT_ID = 'google-maps-places-loader'
const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

/**
 * Indica se o Google Places está configurado (tem API key)
 */
export function isGooglePlacesEnabled(): boolean {
  return Boolean(GOOGLE_API_KEY && GOOGLE_API_KEY.startsWith('AIza'))
}

/**
 * Carrega o script do Google Places (uma única vez por página).
 * Retorna true se o Google está disponível, false se nem tentou carregar.
 */
export function loadGooglePlacesScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false)
      return
    }
    if (!isGooglePlacesEnabled()) {
      resolve(false)
      return
    }
    // Já carregado?
    if ((window as any).google?.maps?.places) {
      resolve(true)
      return
    }
    // Já em carregamento?
    if (document.getElementById(GOOGLE_SCRIPT_ID)) {
      const existing = document.getElementById(GOOGLE_SCRIPT_ID) as HTMLScriptElement
      existing.addEventListener('load', () => resolve(true), { once: true })
      existing.addEventListener('error', () => resolve(false), { once: true })
      return
    }
    const script = document.createElement('script')
    script.id = GOOGLE_SCRIPT_ID
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places&v=weekly&loading=async`
    script.async = true
    script.defer = true
    script.addEventListener('load', () => resolve(true), { once: true })
    script.addEventListener('error', () => resolve(false), { once: true })
    document.head.appendChild(script)
  })
}

/**
 * Sessão de token para o novo Places Autocomplete (New API)
 * Retorna token que deve ser passado no fetch e invalidado ao final
 */
export async function createAutocompleteSessionToken(): Promise<any | null> {
  if (!(await loadGooglePlacesScript())) return null
  const places = (window as any).google?.maps?.places
  if (!places) return null
  try {
    return new places.AutocompleteSessionToken()
  } catch {
    return null
  }
}

/**
 * Faz fetch de sugestões via Google Places API (New) usando fetch direto
 * (mais leve que importar a lib completa)
 */
export async function googlePlacesAutocomplete(
  input: string,
  sessionToken?: any,
): Promise<AutocompleteSuggestion[]> {
  if (!input || input.trim().length < 3) return []
  if (!(await loadGooglePlacesScript())) return []

  const apiKey = GOOGLE_API_KEY
  try {
    const res = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'suggestions.placePrediction.placeId,suggestions.placePrediction.structuredFormat,suggestions.placePrediction.text',
      },
      body: JSON.stringify({
        input,
        sessionToken: sessionToken ? String(sessionToken) : undefined,
        includedRegionCodes: ['BR'],
        languageCode: 'pt-BR',
      }),
    })
    if (!res.ok) return []
    const data = (await res.json()) as {
      suggestions?: Array<{
        placePrediction?: {
          placeId: string
          text?: { text: string }
          structuredFormat?: {
            mainText?: { text: string }
            secondaryText?: { text: string }
          }
        }
      }>
    }
    return (data.suggestions ?? [])
      .map((s) => s.placePrediction)
      .filter((p): p is NonNullable<typeof p> => Boolean(p))
      .map((p) => ({
        mainText: p.structuredFormat?.mainText?.text ?? p.text?.text ?? '',
        secondaryText: p.structuredFormat?.secondaryText?.text ?? '',
        id: p.placeId,
      }))
  } catch {
    return []
  }
}

/**
 * Obtém detalhes de um Place ID específico (lat/lng, componentes de endereço)
 */
export async function googlePlaceDetails(placeId: string): Promise<PlaceResult | null> {
  if (!(await loadGooglePlacesScript())) return null
  const apiKey = GOOGLE_API_KEY
  try {
    const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
      headers: {
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'id,formattedAddress,location,addressComponents',
      },
    })
    if (!res.ok) return null
    const data = (await res.json()) as {
      id: string
      formattedAddress?: string
      location?: { latitude: number; longitude: number }
      addressComponents?: Array<{
        longText?: string
        shortText?: string
        types?: string[]
      }>
    }
    return {
      formattedAddress: data.formattedAddress ?? '',
      components: parseGoogleComponents(data.addressComponents ?? []),
      lat: data.location?.latitude ?? null,
      lng: data.location?.longitude ?? null,
      placeId: data.id,
      source: 'google',
    }
  } catch {
    return null
  }
}

function parseGoogleComponents(
  components: Array<{ longText?: string; shortText?: string; types?: string[] }>,
): PlaceComponents {
  const out: PlaceComponents = {}
  for (const c of components) {
    const long = c.longText ?? c.shortText ?? ''
    const short = c.shortText ?? long
    const types = c.types ?? []
    if (types.includes('route')) out.street = long
    if (types.includes('street_number')) out.number = long
    if (types.includes('sublocality') || types.includes('sublocality_level_1')) out.neighborhood = long
    if (types.includes('administrative_area_level_2')) out.city = long
    if (types.includes('administrative_area_level_1')) {
      out.state = long
      out.stateCode = short
    }
    if (types.includes('country')) {
      out.country = long
      out.countryCode = short
    }
    if (types.includes('postal_code')) out.postalCode = long
  }
  return out
}

// ============================================
// FALLBACK: NOMINATIM (OpenStreetMap)
// ============================================

/**
 * Geocoding via Nominatim - usado quando Google Places não está configurado.
 * Rate limit: 1 req/segundo (uso justo)
 */
export async function nominatimAutocomplete(
  input: string,
  signal?: AbortSignal,
): Promise<AutocompleteSuggestion[]> {
  if (!input || input.trim().length < 3) return []
  const query = encodeURIComponent(`${input.trim()}, Brasil`)
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=5&countrycodes=br&addressdetails=1`

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'EnergiaLivre/1.0 (https://energialivre.dev.br)',
        'Accept-Language': 'pt-BR,pt;q=0.9',
      },
      signal,
    })
    if (!res.ok) return []
    const data = (await res.json()) as Array<{
      place_id: number | string
      display_name: string
      lat: string
      lon: string
      address?: Record<string, string>
    }>
    return data.map((d) => {
      const a = d.address ?? {}
      const main = a.road
        ? `${a.road}${a.house_number ? ', ' + a.house_number : ''}`
        : a.suburb || a.town || a.city || d.display_name.split(',')[0]
      const secondary = [a.suburb, a.city || a.town, a.state].filter(Boolean).join(', ')
      return {
        mainText: main,
        secondaryText: secondary,
        id: String(d.place_id),
        place: {
          formattedAddress: d.display_name,
          components: {
            street: a.road,
            number: a.house_number,
            neighborhood: a.suburb || a.neighbourhood,
            city: a.city || a.town || a.municipality,
            state: a.state,
            stateCode: a.state_code?.toUpperCase(),
            country: a.country,
            countryCode: a.country_code?.toUpperCase(),
            postalCode: a.postcode,
          },
          lat: Number(d.lat),
          lng: Number(d.lon),
          placeId: String(d.place_id),
          source: 'nominatim',
        },
      }
    })
  } catch {
    return []
  }
}

// ============================================
// UNIFICADO (escolhe automaticamente)
// ============================================

export type AutocompleteProvider = 'google' | 'nominatim'

export function getActiveProvider(): AutocompleteProvider {
  return isGooglePlacesEnabled() ? 'google' : 'nominatim'
}

export async function unifiedAutocomplete(
  input: string,
  options: { signal?: AbortSignal; sessionToken?: any } = {},
): Promise<{ provider: AutocompleteProvider; suggestions: AutocompleteSuggestion[] }> {
  const provider = getActiveProvider()
  if (provider === 'google') {
    const suggestions = await googlePlacesAutocomplete(input, options.sessionToken)
    return { provider, suggestions }
  }
  const suggestions = await nominatimAutocomplete(input, options.signal)
  return { provider, suggestions }
}

export async function unifiedPlaceDetails(identifier: string): Promise<PlaceResult | null> {
  // identifier = Place ID (Google) ou display_name (Nominatim fallback)
  const provider = getActiveProvider()
  if (provider === 'google') {
    return googlePlaceDetails(identifier)
  }
  // Nominatim: re-busca por id não é direto; faz nova query
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/lookup?format=json&addressdetails=1&q=${encodeURIComponent(identifier)}`,
      {
        headers: {
          'User-Agent': 'EnergiaLivre/1.0 (https://energialivre.dev.br)',
        },
      },
    )
    if (!res.ok) return null
    const d = (await res.json()) as Array<any>
    if (!d.length) return null
    const a = d[0].address ?? {}
    return {
      formattedAddress: d[0].display_name,
      components: {
        street: a.road,
        number: a.house_number,
        neighborhood: a.suburb,
        city: a.city || a.town,
        state: a.state,
        stateCode: a.state_code?.toUpperCase(),
        country: a.country,
        countryCode: a.country_code?.toUpperCase(),
        postalCode: a.postcode,
      },
      lat: Number(d[0].lat),
      lng: Number(d[0].lon),
      placeId: String(d[0].place_id),
      source: 'nominatim',
    }
  } catch {
    return null
  }
}
