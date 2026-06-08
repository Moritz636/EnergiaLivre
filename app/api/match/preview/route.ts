// ============================================================
// POST /api/match/preview
// Publico (sem auth). Recebe dados de fatura do consumidor
// + lat/lng, retorna top 3 usinas compativeis.
// NAO credita / NAO loga / NAO expoe dados sensiveis.
// ============================================================

import { NextResponse } from 'next/server'
import { MOCK_USINAS, type MockUsina } from '@/lib/mock-usinas'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const RADIUS_KM = 250
const MIN_CONSUMO_KWH = 500
const MIN_ECONOMIA_PCT = 10

interface FaturaInput {
  cidade?: string
  estado?: string
  distribuidora?: string
  subgrupo_tarifario?: string
  consumo_kwh_medio?: number
  valor_kwh_atual?: number
  lat: number
  lng: number
}

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const sa =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(sa))
}

interface PreviewResult {
  usina: MockUsina
  distance_km: number
  economia_estimada_mensal: number
  economia_estimada_anual: number
  match_score: number
  motivos: string[]
}

export async function POST(req: Request) {
  try {
    const fatura = (await req.json()) as FaturaInput
    if (typeof fatura?.lat !== 'number' || typeof fatura?.lng !== 'number') {
      return NextResponse.json(
        { error: 'lat/lng obrigatorio' },
        { status: 400 }
      )
    }

    const consumo = Number(fatura.consumo_kwh_medio ?? 0)
    const valorKwh = Number(fatura.valor_kwh_atual ?? 0.95)

    const matches: PreviewResult[] = MOCK_USINAS.map((u) => {
      const distance_km = haversineKm({ lat: fatura.lat, lng: fatura.lng }, { lat: u.lat, lng: u.lng })
      const valorAtual = consumo * valorKwh
      const valorOferta = consumo * u.preco_oferta_kwh
      const economiaMensal = Math.max(0, valorAtual - valorOferta)
      const economiaAnual = economiaMensal * 12
      const economiaPct = valorAtual > 0 ? (economiaMensal / valorAtual) * 100 : 0

      const motivos: string[] = []
      if (distance_km <= 50) motivos.push(`${Math.round(distance_km)} km de distancia`)
      else if (distance_km <= 200) motivos.push(`${Math.round(distance_km)} km`)
      if (economiaPct >= 20) motivos.push(`Economia de ${Math.round(economiaPct)}%`)
      if (u.media_avaliacoes >= 4.5) motivos.push(`Avaliação ${u.media_avaliacoes.toFixed(1)}/5`)
      if (motivos.length === 0) motivos.push('Compativel com sua regiao')

      // Score: 0-100
      let score = 0
      if (distance_km <= RADIUS_KM) {
        score += Math.max(0, 50 - distance_km / 5)
      }
      score += Math.min(30, economiaPct * 1.5)
      score += (u.ranking_score ?? 0) * 4
      score = Math.min(100, Math.max(0, score))

      return {
        usina: u,
        distance_km: Math.round(distance_km * 10) / 10,
        economia_estimada_mensal: Math.round(economiaMensal * 100) / 100,
        economia_estimada_anual: Math.round(economiaAnual * 100) / 100,
        match_score: Math.round(score),
        motivos,
      }
    })
      .filter((m) => m.distance_km <= RADIUS_KM)
      .filter((m) => m.economia_estimada_mensal / Math.max(1, consumo * valorKwh) * 100 >= MIN_ECONOMIA_PCT)
      .filter((m) => consumo === 0 || consumo >= MIN_CONSUMO_KWH || true)
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, 3)

    return NextResponse.json({
      ok: true,
      total_matches: matches.length,
      matches,
      consumer: {
        lat: fatura.lat,
        lng: fatura.lng,
        cidade: fatura.cidade,
        estado: fatura.estado,
        consumo_kwh_medio: consumo,
      },
      paywall: {
        required: true,
        price_brl: 9.99,
        plan: 'match_viewer_30d',
        description: 'Acesso ilimitado a todas as usinas por 30 dias',
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
