// ============================================================
// POST /api/mock/geocode
// Geocodifica um endereco e retorna lat/lng.
// Em producao: trocar por Google Geocoding API ou Mapbox.
// Em dev: retorna coordenadas reais de cidades conhecidas
// do Brasil (lookup simples, sem custo).
// ============================================================

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface CityCoord {
  keywords: string[]
  lat: number
  lng: number
  estado: string
  cidade: string
}

const KNOWN_CITIES: CityCoord[] = [
  { keywords: ['sao paulo', 'são paulo', 'sp'], lat: -23.5505, lng: -46.6333, estado: 'SP', cidade: 'Sao Paulo' },
  { keywords: ['campinas'], lat: -22.9056, lng: -47.0608, estado: 'SP', cidade: 'Campinas' },
  { keywords: ['rio de janeiro', 'rio', 'rj'], lat: -22.9068, lng: -43.1729, estado: 'RJ', cidade: 'Rio de Janeiro' },
  { keywords: ['belo horizonte', 'bh', 'mg'], lat: -19.9167, lng: -43.9345, estado: 'MG', cidade: 'Belo Horizonte' },
  { keywords: ['brasilia', 'df'], lat: -15.7942, lng: -47.8822, estado: 'DF', cidade: 'Brasilia' },
  { keywords: ['curitiba', 'pr'], lat: -25.4284, lng: -49.2733, estado: 'PR', cidade: 'Curitiba' },
  { keywords: ['porto alegre', 'rs'], lat: -30.0346, lng: -51.2177, estado: 'RS', cidade: 'Porto Alegre' },
  { keywords: ['pelotas'], lat: -31.7719, lng: -52.3425, estado: 'RS', cidade: 'Pelotas' },
  { keywords: ['salvador', 'ba'], lat: -12.9714, lng: -38.5014, estado: 'BA', cidade: 'Salvador' },
  { keywords: ['fortaleza', 'ce'], lat: -3.7172, lng: -38.5433, estado: 'CE', cidade: 'Fortaleza' },
  { keywords: ['recife', 'pe'], lat: -8.0476, lng: -34.877, estado: 'PE', cidade: 'Recife' },
  { keywords: ['manaus', 'am'], lat: -3.119, lng: -60.0217, estado: 'AM', cidade: 'Manaus' },
  { keywords: ['belem', 'belém', 'pa'], lat: -1.4558, lng: -48.5039, estado: 'PA', cidade: 'Belem' },
  { keywords: ['goiania', 'goiânia', 'go'], lat: -16.6869, lng: -49.2648, estado: 'GO', cidade: 'Goiania' },
  { keywords: ['uberlandia', 'uberlândia'], lat: -18.9186, lng: -48.2766, estado: 'MG', cidade: 'Uberlandia' },
  { keywords: ['florianopolis', 'florianópolis', 'sc'], lat: -27.5969, lng: -48.5495, estado: 'SC', cidade: 'Florianopolis' },
]

export async function POST(req: Request) {
  try {
    const { endereco, cep } = (await req.json().catch(() => ({}))) as {
      endereco?: string
      cep?: string
    }
    const query = (endereco || cep || '').toLowerCase().trim()
    if (!query) {
      return NextResponse.json({ error: 'endereço ou CEP obrigatório' }, { status: 400 })
    }

    const hit = KNOWN_CITIES.find((c) => c.keywords.some((k) => query.includes(k)))

    if (!hit) {
      // Fallback: centro do Brasil (Brasilia)
      return NextResponse.json({
        ok: true,
        mock: true,
        cidade: 'Centro do Brasil (fallback)',
        estado: 'DF',
        lat: -15.7942,
        lng: -47.8822,
        confidence: 'low',
        message: 'Cidade nao identificada — usando Brasilia como aproximacao',
      })
    }

    return NextResponse.json({
      ok: true,
      mock: true,
      cidade: hit.cidade,
      estado: hit.estado,
      lat: hit.lat,
      lng: hit.lng,
      confidence: 'high',
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
