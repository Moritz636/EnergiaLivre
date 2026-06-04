import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { saveUserLocation, isValidCoordinate } from '@/lib/geolocation'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const lat = Number(body.latitude ?? body.lat)
    const lng = Number(body.longitude ?? body.lng)
    const cidade = typeof body.cidade === 'string' ? body.cidade : ''
    const estado = typeof body.estado === 'string' ? body.estado : ''
    const accuracy = Number.isFinite(Number(body.accuracy_meters))
      ? Math.round(Number(body.accuracy_meters))
      : undefined
    const source = body.source === 'browser' || body.source === 'geocoded' || body.source === 'manual'
      ? body.source
      : 'manual'

    if (!isValidCoordinate(lat, lng)) {
      return NextResponse.json(
        { error: 'Coordenadas inválidas' },
        { status: 400 },
      )
    }
    if (!cidade.trim() || estado.trim().length !== 2) {
      return NextResponse.json(
        { error: 'Cidade/UF são obrigatórios' },
        { status: 400 },
      )
    }

    const result = await saveUserLocation(
      supabase,
      user.id,
      lat,
      lng,
      cidade,
      estado,
      accuracy,
      source,
    )

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('POST /api/location error:', err)
    return NextResponse.json(
      { error: err?.message ?? 'Erro ao salvar localização' },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const sb: any = supabase
    const { data, error } = await sb
      .from('user_locations')
      .select('latitude, longitude, cidade, estado, accuracy_meters, source, updated_at')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error || !data) {
      return NextResponse.json({ configured: false, location: null }, { status: 200 })
    }

    return NextResponse.json({
      configured: true,
      location: {
        lat: data.latitude,
        lng: data.longitude,
        cidade: data.cidade,
        estado: data.estado,
        accuracy_meters: data.accuracy_meters,
        source: data.source,
        updated_at: data.updated_at,
      },
    })
  } catch (err: any) {
    console.error('GET /api/location error:', err)
    return NextResponse.json(
      { error: err?.message ?? 'Erro ao buscar localização' },
      { status: 500 },
    )
  }
}
