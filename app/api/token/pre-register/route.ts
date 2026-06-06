import { NextRequest, NextResponse } from 'next/server'
import { v } from '@/lib/validation'
import { createClient } from '@/lib/supabase/server'
import { TOKEN_PACKAGES, getFinalPrice } from '@/lib/tokenomics'
import { rateLimit, getClientIp } from '@/lib/ratelimit'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const ALLOWED_PACKAGES = TOKEN_PACKAGES.map((p) => p.code) as readonly string[]

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers)
    const rl = await rateLimit({ identifier: `token-pre:${ip}`, limit: 5, window: 60 })
    if (!rl.success) {
      return NextResponse.json({ error: 'Muitas tentativas. Aguarde 1 minuto.' }, { status: 429 })
    }

    const json = await request.json().catch(() => ({}))
    const parsed = v.object(json, {
      email: (i) => v.string(i, { max: 120, email: true }),
      walletAddress: v.optional((i) => v.string(i, { max: 100 })),
      packageCode: v.optional((i) => v.enum(i, ALLOWED_PACKAGES)),
      referredByCode: v.optional((i) => v.string(i, { max: 16 })),
      utmSource: v.optional((i) => v.string(i, { max: 60 })),
      utmMedium: v.optional((i) => v.string(i, { max: 60 })),
      utmCampaign: v.optional((i) => v.string(i, { max: 60 })),
    })
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }
    const data = parsed.data

    const supabase = await createClient()
    const pkg = data.packageCode ? TOKEN_PACKAGES.find((p) => p.code === data.packageCode) : null
    if (data.packageCode && !pkg) {
      return NextResponse.json({ error: 'Pacote inválido' }, { status: 400 })
    }

    const since = new Date(Date.now() - 24 * 3600_000).toISOString()
    const { data: recent } = await supabase
      .from('token_pre_registrations')
      .select('id')
      .eq('email', data.email)
      .gte('created_at', since)
      .limit(1)
      .maybeSingle()

    if (recent) {
      return NextResponse.json({
        success: true,
        message: 'Já temos seu pré-registro nas últimas 24h. Em breve você recebe o link de compra.',
        alreadyRegistered: true,
      })
    }

    const insert = {
      email: data.email,
      wallet_address: data.walletAddress || null,
      package_code: pkg?.code ?? null,
      package_tokens: pkg ? pkg.tokens + pkg.bonus : null,
      referred_by_code: data.referredByCode || null,
      utm_source: data.utmSource ?? null,
      utm_medium: data.utmMedium ?? null,
      utm_campaign: data.utmCampaign ?? null,
      ip_address: ip,
      user_agent: request.headers.get('user-agent')?.slice(0, 200) ?? null,
    }

    const { data: created, error } = await (supabase
      .from('token_pre_registrations')
      .insert(insert as any)
      .select('id, email, package_code, package_tokens, referred_by_code')
      .single() as any)

    if (error) {
      console.error('[token/pre-register] error:', error)
      return NextResponse.json({ error: 'Não foi possível registrar seu interesse. Tente novamente.' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      registration: created,
      message: pkg
        ? `Pré-registro confirmado! Pacote ${pkg.code} reservado. Total: ${pkg.tokens + pkg.bonus} KWATT por ${formatFinal(pkg)}.`
        : 'Pré-registro confirmado! Você receberá um e-mail quando a pré-venda abrir.',
    })
  } catch (err: any) {
    console.error('[token/pre-register] exception:', err)
    return NextResponse.json({ error: err?.message ?? 'Erro interno' }, { status: 500 })
  }
}

function formatFinal(pkg: typeof TOKEN_PACKAGES[number]): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(getFinalPrice(pkg))
}
