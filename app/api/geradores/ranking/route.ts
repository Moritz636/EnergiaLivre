import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/geradores/ranking
 *
 * Retorna a lista de geradores ranqueados (status='ativo') ordenada
 * por melhor desconto (preço kWh + avaliação). Aceita parâmetros de
 * filtro opcionais.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const cidade = searchParams.get('cidade')
    const estado = searchParams.get('estado')
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10) || 20, 100)
    const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : null
    const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : null
    const radiusKm = searchParams.get('radiusKm') ? parseInt(searchParams.get('radiusKm')!, 10) : 100
    const mode = (searchParams.get('mode') ?? 'radius') as 'radius' | 'state' | 'distributor'
    const distribuidora = searchParams.get('distribuidora')

    // Tentar usar a RPC; se falhar, fallback query direta
    const rpcParams: Record<string, any> = { p_limit: limit }
    if (cidade) rpcParams.p_cidade = cidade
    if (estado) rpcParams.p_estado = estado
    if (distribuidora) rpcParams.p_distribuidora = distribuidora
    if (lat !== null && lng !== null && mode === 'radius') {
      rpcParams.p_user_lat = lat
      rpcParams.p_user_lng = lng
      rpcParams.p_radius_km = radiusKm
    }

    const { data: rpcData, error: rpcError } = await (supabase
      .rpc('get_top_geradores', rpcParams) as any)

    if (!rpcError && rpcData) {
      return NextResponse.json({ success: true, ranking: rpcData, source: 'rpc' })
    }

    // Fallback: query direta
    let q = supabase
      .from('geradores')
      .select('id, nome_usina, capacidade_kwp, excedente_mensal_kwh, cidade, estado, latitude, longitude, preco_kwh, desconto_percentual, pacote_kwh, pacote_preco, ranking_score, total_avaliacoes, media_avaliacoes, concessionaria, status')
      .eq('status', 'ativo')
      .order('ranking_score', { ascending: false })
      .limit(limit)

    if (cidade) q = q.ilike('cidade', cidade)
    if (estado) q = q.ilike('estado', estado)
    if (distribuidora) q = q.ilike('concessionaria', distribuidora)

    const { data, error } = await q
    if (error) {
      console.error('[geradores/ranking] error:', error)
      return NextResponse.json({ error: 'Erro ao buscar ranking' }, { status: 500 })
    }

    let ranked = data ?? []
    if (lat !== null && lng !== null && mode === 'radius' && ranked.length > 0) {
      const { calculateDistance } = await import('@/lib/geolocation')
      ranked = ranked
        .filter((g) => g.latitude != null && g.longitude != null)
        .map((g) => ({
          ...g,
          distance_km: calculateDistance({ lat: lat!, lng: lng! }, { lat: g.latitude!, lng: g.longitude! }),
        }))
        .filter((g) => g.distance_km <= radiusKm)
        .sort((a, b) => (b.ranking_score ?? 0) - (a.ranking_score ?? 0))
    }

    return NextResponse.json({ success: true, ranking: ranked, source: 'fallback', mode })
  } catch (err: any) {
    console.error('[geradores/ranking] exception:', err)
    return NextResponse.json({ error: err?.message ?? 'Erro interno' }, { status: 500 })
  }
}
