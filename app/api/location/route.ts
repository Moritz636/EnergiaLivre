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
    const lat = Number(body.lat)
    const lng = Number(body.lng)
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
      {
        lat,
        lng,
        cidade,
        estado,
        accuracy_meters: accuracy,
        source,
      },
      { supabase, userId: user.id },
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

    const { data, error } = await (supabase
      .from('user_locations')
      .select('lat, lng, cidade, estado, accuracy_meters, source, updated_at')
      .eq('user_id', user.id)
      .single() as any)

    if (error || !data) {
      return NextResponse.json({ configured: false }, { status: 200 })
    }

    return NextResponse.json({ configured: true, location: data })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? 'Erro ao buscar localização' },
      { status: 500 },
    )
  }
}
