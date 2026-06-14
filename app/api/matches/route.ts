import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { findCandidates, type TargetTipo } from '@/lib/matches'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const ALLOWED_TIPOS: TargetTipo[] = ['consumidor', 'gerador']

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const targetTipo = searchParams.get('targetTipo') as TargetTipo | null
    const radiusKm = Number(searchParams.get('radiusKm') ?? '50')
    const limit = Number(searchParams.get('limit') ?? '50')
    const mode = (searchParams.get('mode') ?? 'radius') as 'radius' | 'state' | 'distributor'
    const estado = searchParams.get('estado') || undefined
    const distribuidora = searchParams.get('distribuidora') || undefined

    if (!targetTipo || !ALLOWED_TIPOS.includes(targetTipo)) {
      return NextResponse.json(
        { error: 'targetTipo inválido (consumidor|gerador)' },
        { status: 400 },
      )
    }

    const { data: myProfile } = await (supabase
      .from('profiles')
      .select('tipo')
      .eq('id', user.id)
      .single() as any)

    const myTipo = (myProfile as { tipo?: string } | null)?.tipo
    if (myTipo && myTipo !== 'consumidor' && myTipo !== 'gerador') {
      return NextResponse.json(
        { error: 'Apenas consumidores e geradores podem buscar matches' },
        { status: 403 },
      )
    }
    if (myTipo && myTipo === targetTipo) {
      return NextResponse.json(
        { error: 'Você não pode buscar matches do mesmo tipo' },
        { status: 400 },
      )
    }

    // Para mode='radius' precisamos de localizacao obrigatoria
    // Para state/distributor, localizacao e opcional (mas recomendado para ordernacao)
    const { data: myLocation, error: locError } = await (supabase
      .from('user_locations')
      .select('lat, lng, estado')
      .eq('user_id', user.id)
      .maybeSingle() as any)

    if (mode === 'radius' && (locError || !myLocation)) {
      return NextResponse.json(
        { error: 'Você precisa configurar sua localização para usar o match' },
        { status: 412 },
      )
    }

    if (mode === 'state' && !estado && (!myLocation || !myLocation.estado)) {
      return NextResponse.json(
        { error: 'Para buscar por estado, defina sua localização (UF)' },
        { status: 412 },
      )
    }

    if (mode === 'distributor' && !distribuidora) {
      return NextResponse.json(
        { error: 'Para buscar por distribuidora, selecione uma distribuidora' },
        { status: 412 },
      )
    }

    // origin: lat/lng ou ponto neutro do Brasil (se mode!=radius)
    const origin = myLocation
      ? { lat: Number(myLocation.lat), lng: Number(myLocation.lng) }
      : { lat: -15.7801, lng: -47.9292 } // centro do Brasil, nao usado no filtro

    const candidates = await findCandidates(
      {
        userId: user.id,
        origin,
        targetTipo,
        radiusKm: Number.isFinite(radiusKm) ? radiusKm : 50,
        limit: Number.isFinite(limit) ? Math.min(limit, 200) : 50,
        mode,
        estadoFilter: estado || myLocation?.estado,
        distribuidoraFilter: distribuidora,
      },
      { supabase },
    )

    return NextResponse.json({ success: true, candidates, mode })
  } catch (err: any) {
    console.error('GET /api/matches error:', err)
    return NextResponse.json(
      { error: err?.message ?? 'Erro ao buscar matches' },
      { status: 500 },
    )
  }
}
