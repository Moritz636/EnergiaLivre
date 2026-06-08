import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/public/commissions
 *
 * Retorna os percentuais de comissão publicamente visíveis.
 * Lido de system_settings (chave/valor/descricao).
 *
 * - Sem auth (publico)
 * - Cache 5 min (revalidate)
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await (supabase
      .from('system_settings')
      .select('key, value, description')
      .in('key', [
        'commission.signup_percent',
        'commission.recurring_percent',
        'commission.embaixador_percent',
        'commission.ufv_percent',
      ]) as any)

    if (error) {
      console.error('[public/commissions] error:', error)
      return NextResponse.json({ error: 'Erro ao buscar comissões' }, { status: 500 })
    }

    const map: Record<string, { value: number; description: string }> = {}
    for (const row of (data ?? []) as Array<any>) {
      const v = typeof row.value === 'number' ? row.value : Number(row.value)
      map[row.key] = { value: v, description: row.description ?? '' }
    }

    // Defaults (se tabela nao tiver os valores) - baseados em 20260605_admin_god_mode.sql
    const result = {
      signup: map['commission.signup_percent']?.value ?? 15,
      recurring: map['commission.recurring_percent']?.value ?? 10,
      embaixador: map['commission.embaixador_percent']?.value ?? 5,
      ufv: map['commission.ufv_percent']?.value ?? 15,
      descriptions: {
        signup: map['commission.signup_percent']?.description ?? 'Comissao de cadastro do cliente',
        recurring: map['commission.recurring_percent']?.description ?? 'Comissão recorrente mensal',
        embaixador: map['commission.embaixador_percent']?.description ?? 'Bonus para parceiro que indicou',
        ufv: map['commission.ufv_percent']?.description ?? 'Percentual retido pela UFV (gerador)',
      },
    }

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (err: any) {
    console.error('[public/commissions] exception:', err)
    return NextResponse.json({ error: err?.message ?? 'Erro interno' }, { status: 500 })
  }
}
