import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { recordPaymentAgreement, CURRENT_TERMS_VERSION } from '@/lib/commissions'

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
    const accept = body.accept === true

    if (!accept) {
      return NextResponse.json(
        { error: 'É necessário aceitar o acordo de pagamento para continuar' },
        { status: 400 },
      )
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? request.headers.get('x-real-ip')
      ?? null
    const ua = request.headers.get('user-agent') ?? null

    const result = await recordPaymentAgreement(
      {
        userId: user.id,
        termsVersion: body.termsVersion ?? CURRENT_TERMS_VERSION,
        termsHash: body.termsHash,
        ipAddress: ip,
        userAgent: ua,
        documentUrl: body.documentUrl,
      },
      { supabase },
    )

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      alreadyAccepted: result.result?.alreadyAccepted ?? false,
      agreementId: result.result?.agreementId,
      acceptedAt: result.result?.acceptedAt,
    })
  } catch (err: any) {
    console.error('POST /api/agreements error:', err)
    return NextResponse.json(
      { error: err?.message ?? 'Erro ao registrar acordo' },
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
      .from('profiles')
      .select('agreed_to_payment_terms_at, last_terms_version')
      .eq('id', user.id)
      .single() as any)

    if (error || !data) {
      return NextResponse.json({
        hasAccepted: false,
        version: null,
        acceptedAt: null,
      })
    }

    return NextResponse.json({
      hasAccepted: !!data.agreed_to_payment_terms_at,
      version: data.last_terms_version,
      acceptedAt: data.agreed_to_payment_terms_at,
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? 'Erro ao consultar acordo' },
      { status: 500 },
    )
  }
}
