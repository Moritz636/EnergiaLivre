import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Inicializa o Stripe com a chave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`❌ Webhook Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Processa os eventos que nos interessam
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      console.log(`✅ Pagamento concluído! Session ID: ${session.id}`);
      console.log(`👤 Cliente: ${session.customer_email}`);
      console.log(`💰 Valor: ${session.amount_total / 100} ${session.currency}`);
      // TODO: Ativar assinatura do cliente no banco
      break;

    case 'invoice.paid':
      const invoice = event.data.object as Stripe.Invoice;
      console.log(`💰 Fatura paga: ${invoice.id}`);
      console.log(`👤 Cliente: ${invoice.customer_email}`);
      // TODO: Renovar créditos de energia
      break;

    case 'invoice.payment_failed':
      const failedInvoice = event.data.object as Stripe.Invoice;
      console.log(`❌ Falha no pagamento: ${failedInvoice.id}`);
      console.log(`👤 Cliente: ${failedInvoice.customer_email}`);
      // TODO: Notificar cliente sobre falha
      break;

    case 'customer.subscription.deleted':
      const subscription = event.data.object as Stripe.Subscription;
      console.log(`🔒 Assinatura cancelada: ${subscription.id}`);
      // TODO: Revogar acesso do cliente
      break;

    default:
      console.log(`⚠️ Evento não tratado: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}