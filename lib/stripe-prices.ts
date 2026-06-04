// ============================================
// STRIPE PRICE IDS - MAPEAMENTO CENTRALIZADO
// ============================================
// Usado por:
//   - app/api/stripe/checkout/route.ts (cria sessão)
//   - app/api/stripe/webhook/route.ts (identifica plano no webhook)
//   - app/checkout/page.tsx (cliente)
//   - app/checkout-gerador/page.tsx (gerador)
//   - app/checkout-member-plus/page.tsx (member plus)
// ============================================

export const STRIPE_PRICE_IDS = {
  // Planos de Consumidor (cliente final)
  CONSUMIDOR_BASICO: 'price_consumidor_basico', // TODO: Stripe price_id
  CONSUMIDOR_FAMILIAR: 'price_consumidor_familiar', // TODO: Stripe price_id
  CONSUMIDOR_PREMIUM: 'price_consumidor_premium', // TODO: Stripe price_id

  // Planos de Gerador (quem vende excedente)
  GERADOR_STARTER: 'price_gerador_starter', // TODO: Stripe price_id
  GERADOR_PRO: 'price_gerador_pro', // TODO: Stripe price_id
  GERADOR_PREMIUM: 'price_gerador_premium', // TODO: Stripe price_id

  // Member Plus (acesso ao match)
  MEMBER_PLUS: 'price_member_plus', // TODO: Stripe price_id
} as const

export type StripePriceId = (typeof STRIPE_PRICE_IDS)[keyof typeof STRIPE_PRICE_IDS]

// ============================================
// STRIPE PAYMENT LINKS - CHECKOUTS HOSPEDADOS
// ============================================
// Stripe Payment Links (buy.stripe.com) são páginas de checkout prontas.
// O frontend redireciona o usuário diretamente para o link.
// O webhook do Stripe recebe os eventos de assinatura automaticamente.
//
// Vantagens:
//   - Sem necessidade de criar sessão via API
//   - Stripe cuida de toda a UX do checkout
//   - Menos código, menos manutenção
// ============================================

export const STRIPE_PAYMENT_LINKS = {
  // Planos de Consumidor
  CONSUMIDOR_BASICO: 'https://buy.stripe.com/8x228r42lcud0Wh9FP7Vm00',
  CONSUMIDOR_FAMILIAR: 'https://buy.stripe.com/8x25kD7ex51LeN719j7Vm01',
  CONSUMIDOR_PREMIUM: 'https://buy.stripe.com/dRmfZhgP7eCl5cxcS17Vm04',

  // Planos de Gerador
  GERADOR_STARTER: 'https://buy.stripe.com/4gM8wP9mFdyh7kFf097Vm05',
  GERADOR_PRO: 'https://buy.stripe.com/8x26oHeGZeCldJ33hr7Vm06',
  GERADOR_PREMIUM: 'https://buy.stripe.com/dRm8wP9mFam534p9FP7Vm03',

  // Member Plus
  MEMBER_PLUS: 'https://buy.stripe.com/9B66oHdCVam520l6tD7Vm02',
} as const

export type StripePaymentLinkKey = keyof typeof STRIPE_PAYMENT_LINKS

export type PlanoTipo = 'consumidor' | 'gerador' | 'member_plus'

export interface PlanoMetadata {
  tipo: PlanoTipo
  codigo: string
  nome: string
  valorMensal: number
  kwh?: number
  economiaPercentual?: number
  capacidadeKwp?: number
}

export const PLANOS_META: Record<string, PlanoMetadata> = {
  [STRIPE_PRICE_IDS.CONSUMIDOR_BASICO]: {
    tipo: 'consumidor',
    codigo: 'basico',
    nome: 'Plano Básico',
    valorMensal: 89.9,
    kwh: 300,
    economiaPercentual: 25,
  },
  [STRIPE_PRICE_IDS.CONSUMIDOR_FAMILIAR]: {
    tipo: 'consumidor',
    codigo: 'familiar',
    nome: 'Plano Familiar',
    valorMensal: 149.9,
    kwh: 500,
    economiaPercentual: 32,
  },
  [STRIPE_PRICE_IDS.CONSUMIDOR_PREMIUM]: {
    tipo: 'consumidor',
    codigo: 'premium',
    nome: 'Plano Premium',
    valorMensal: 289.9,
    kwh: 1000,
    economiaPercentual: 38,
  },
  [STRIPE_PRICE_IDS.GERADOR_STARTER]: {
    tipo: 'gerador',
    codigo: 'starter',
    nome: 'Solar Starter',
    valorMensal: 49.9,
    capacidadeKwp: 30,
  },
  [STRIPE_PRICE_IDS.GERADOR_PRO]: {
    tipo: 'gerador',
    codigo: 'pro',
    nome: 'Solar Pro',
    valorMensal: 99.9,
    capacidadeKwp: 100,
  },
  [STRIPE_PRICE_IDS.GERADOR_PREMIUM]: {
    tipo: 'gerador',
    codigo: 'premium',
    nome: 'Solar Premium',
    valorMensal: 199.9,
    capacidadeKwp: 500,
  },
  [STRIPE_PRICE_IDS.MEMBER_PLUS]: {
    tipo: 'member_plus',
    codigo: 'member_plus',
    nome: 'Member Plus',
    valorMensal: 9.99,
  },
}

export function getPlanoByPriceId(priceId: string): PlanoMetadata | null {
  return PLANOS_META[priceId] ?? null
}

export function isValidPriceId(priceId: string): priceId is StripePriceId {
  return priceId in PLANOS_META
}
