import { NextRequest, NextResponse } from 'next/server'
import { createPagSeguroCharge } from '@/lib/pagseguro'

export async function POST(req: NextRequest) {
  try {
    if (!process.env.PAGSEGURO_CLIENT_ID || !process.env.PAGSEGURO_CLIENT_SECRET) {
      return NextResponse.json(
        { error: 'PagSeguro ainda não configurado. Use Stripe ou PIX diretamente.', fallback: 'stripe' },
        { status: 503 }
      )
    }

    const body = await req.json()
    const {
      userId,
      type,
      description,
      amount,
      paymentMethod,
      customerName,
      customerEmail,
      customerTaxId,
      customerPhone,
      referenceId,
    } = body

    if (!userId || !amount || !paymentMethod || !customerName || !customerEmail) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
    }

    if (!['PIX', 'BOLETO', 'CREDIT_CARD'].includes(paymentMethod)) {
      return NextResponse.json({ error: 'Método inválido' }, { status: 400 })
    }

    const result = await createPagSeguroCharge({
      userId,
      referenceId: referenceId ?? `EL-${Date.now()}`,
      description: description ?? 'Pagamento EnergiaLivre',
      amount,
      paymentMethod,
      customer: {
        name: customerName,
        email: customerEmail,
        taxId: customerTaxId,
        phone: customerPhone,
      },
    })

    return NextResponse.json({ ok: true, charge: result })
  } catch (err: any) {
    console.error('[pagseguro/create]', err)
    return NextResponse.json({ error: err.message ?? 'Erro PagSeguro' }, { status: 500 })
  }
}