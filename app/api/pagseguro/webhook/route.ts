import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyPagSeguroWebhook } from '@/lib/pagseguro'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const signature = req.headers.get('x-pagseguro-signature') ?? undefined

    const verified = verifyPagSeguroWebhook(body, signature)
    if (!verified.valid) {
      return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 })
    }

    const chargeId = verified.chargeId
    const status = body?.charge?.status ?? body?.resource?.charge?.status

    if (chargeId && status === 'PAID') {
      const referenceId = body?.charge?.reference_id ?? body?.resource?.charge?.reference_id
      const value = body?.charge?.amount?.value ?? body?.resource?.charge?.amount?.value

      if (referenceId) {
        await supabase.from('pagamentos').upsert({
          id: referenceId,
          charge_id: chargeId,
          valor: value ? (value as number) / 100 : null,
          status: 'paid',
          gateway: 'pagseguro',
          paid_at: new Date().toISOString(),
        })

        await supabase.rpc('credit_wallet', {
          p_user_id: referenceId.split('-')[0],
          p_amount: value ? (value as number) / 100 : 0,
        })
      }
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('[pagseguro/webhook]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}