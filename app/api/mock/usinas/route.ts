// ============================================================
// GET /api/mock/usinas
// Lista usinas geradoras (mock para /match e /location).
// Retorna por estado, distribuidora ou subgrupo.
// ============================================================

import { NextResponse } from 'next/server'
import { MOCK_USINAS, type MockUsina } from '@/lib/mock-usinas'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const estado = url.searchParams.get('estado')?.toUpperCase()
    const distribuidora = url.searchParams.get('distribuidora')
    const subgrupo = url.searchParams.get('subgrupo')?.toUpperCase()
    const limit = Number(url.searchParams.get('limit') ?? '20')

    let result: MockUsina[] = MOCK_USINAS
    if (estado) result = result.filter((u) => u.estado === estado)
    if (distribuidora) {
      result = result.filter((u) =>
        u.distribuidora.toLowerCase().includes(distribuidora.toLowerCase())
      )
    }
    if (subgrupo) result = result.filter((u) => u.subgrupo_tarifario === subgrupo)

    return NextResponse.json({
      ok: true,
      count: result.length,
      usinas: result.slice(0, limit),
      mock: true,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
