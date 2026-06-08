import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const products = [
  {
    key: 'MEMBER_PLUS',
    name: 'Member Plus – Match Viewer 30 dias',
    amount: 999,
    recurring: false,
    metadata: { planoTipo: 'member_plus', planoCodigo: 'member_plus', source: 'api_setup' },
  },
  {
    key: 'CONSUMIDOR_BASICO',
    name: 'Plano Básico',
    amount: 8990,
    recurring: true,
    metadata: { planoTipo: 'consumidor', planoCodigo: 'basico' },
  },
  {
    key: 'CONSUMIDOR_FAMILIAR',
    name: 'Plano Familiar',
    amount: 14990,
    recurring: true,
    metadata: { planoTipo: 'consumidor', planoCodigo: 'familiar' },
  },
  {
    key: 'CONSUMIDOR_PREMIUM',
    name: 'Plano Premium',
    amount: 28990,
    recurring: true,
    metadata: { planoTipo: 'consumidor', planoCodigo: 'premium' },
  },
  {
    key: 'GERADOR_STARTER',
    name: 'Solar Starter',
    amount: 4990,
    recurring: true,
    metadata: { planoTipo: 'gerador', planoCodigo: 'starter' },
  },
  {
    key: 'GERADOR_PRO',
    name: 'Solar Pro',
    amount: 9990,
    recurring: true,
    metadata: { planoTipo: 'gerador', planoCodigo: 'pro' },
  },
  {
    key: 'GERADOR_PREMIUM',
    name: 'Solar Premium',
    amount: 19990,
    recurring: true,
    metadata: { planoTipo: 'gerador', planoCodigo: 'premium' },
  },
]

const results = {}

for (const p of products) {
  const product = await stripe.products.create({
    name: p.name,
    metadata: p.metadata,
  })

  const priceData = {
    product: product.id,
    currency: 'brl',
    unit_amount: p.amount,
    metadata: p.metadata,
  }
  if (p.recurring) {
    priceData.recurring = { interval: 'month' }
  }

  const price = await stripe.prices.create(priceData)

  results[p.key] = price.id
  console.log(`Created: ${p.name} -> ${price.id}`)
}

console.log('\n=== PRICE ID MAPPING ===')
for (const [key, id] of Object.entries(results)) {
  console.log(`${key}: ${id}`)
}
