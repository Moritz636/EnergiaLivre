// ============================================
// TOKENOMICS - KWATT
// ============================================
// Constantes públicas do token utilitário $KWATT.
// NÃO inclui promessas de valorização ou retorno financeiro.
// Token de utilidade - Lei 14.478/2022 (Brasil)
// ============================================

export const KWH_REFERENCE_PRICE = 0.95 // Tarifa média ANEEL (R$/kWh)
export const KWATT_TO_KWH_RATIO = 0.30 // 1 kWatt = 30% de 1 kWh
export const KWATT_UNIT_PRICE = KWH_REFERENCE_PRICE * KWATT_TO_KWH_RATIO // R$ 0,285
export const KWATT_SYMBOL = 'KWATT'
export const KWATT_DECIMALS = 18 // Padrão ERC-20/BEP-20

export const TOKEN_LAUNCH_DATE = new Date(2027, 0, 5, 0, 0, 0) // 05/01/2027
export const PRESALE_END_DATE = new Date(2026, 2, 15, 23, 59, 59) // 15/03/2026

export const TOKEN_TOTAL_SUPPLY = 1_000_000_000 // 1 bilhão
export const PRESALE_ALLOCATION = 0.20 // 20% (200M tokens)
export const REWARDS_ALLOCATION = 0.15 // 15% (150M tokens) - usuários, staking
export const TREASURY_ALLOCATION = 0.25 // 25% (250M tokens) - DAO/equipe
export const LIQUIDITY_ALLOCATION = 0.20 // 20% (200M tokens) - pools DEX
export const ECOSYSTEM_ALLOCATION = 0.15 // 15% (150M tokens) - parcerias
export const ADVISORS_ALLOCATION = 0.05 // 5% (50M tokens) - advisors

export interface TokenPackage {
  code: string
  tokens: number
  basePrice: number // R$ sem desconto
  discount: number // 0-100
  bonus: number // tokens bônus
  popular: boolean
  description: string
  referralBonus: number // tokens extras por referral
}

export const TOKEN_PACKAGES: TokenPackage[] = [
  {
    code: 'starter',
    tokens: 50,
    basePrice: KWATT_UNIT_PRICE * 50,
    discount: 0,
    bonus: 0,
    popular: false,
    description: 'Para experimentar a rede',
    referralBonus: 5,
  },
  {
    code: 'basic',
    tokens: 100,
    basePrice: KWATT_UNIT_PRICE * 100,
    discount: 5,
    bonus: 5,
    popular: false,
    description: 'Acesso inicial ao ecossistema',
    referralBonus: 10,
  },
  {
    code: 'standard',
    tokens: 300,
    basePrice: KWATT_UNIT_PRICE * 300,
    discount: 10,
    bonus: 20,
    popular: true,
    description: 'Pacote mais equilibrado',
    referralBonus: 30,
  },
  {
    code: 'pro',
    tokens: 500,
    basePrice: KWATT_UNIT_PRICE * 500,
    discount: 15,
    bonus: 50,
    popular: false,
    description: 'Para usuários ativos',
    referralBonus: 50,
  },
  {
    code: 'business',
    tokens: 1000,
    basePrice: KWATT_UNIT_PRICE * 1000,
    discount: 20,
    bonus: 150,
    popular: false,
    description: 'Volume institucional',
    referralBonus: 100,
  },
]

/**
 * Calcula o preço final de um pacote aplicando o desconto
 */
export function getFinalPrice(pkg: TokenPackage): number {
  return pkg.basePrice * (1 - pkg.discount / 100)
}

/**
 * Calcula total de tokens com bônus
 */
export function getTotalTokens(pkg: TokenPackage): number {
  return pkg.tokens + pkg.bonus
}

/**
 * Formata um número como R$ pt-BR
 */
export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

/**
 * Formata quantidade de tokens com sufixo k/M
 */
export function formatTokens(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`
  return value.toLocaleString('pt-BR')
}

/**
 * Casos de uso oficiais do token $KWATT (utility - SEM promessa de valorização)
 */
export const TOKEN_USE_CASES = [
  {
    icon: 'Zap',
    title: 'Pagar sua conta de energia',
    description: 'Cada 1 KWATT equivale a 30% de 1 kWh. Use tokens para abater do seu consumo real na fatura.',
    color: 'emerald',
  },
  {
    icon: 'Smartphone',
    title: 'Recarga de celular',
    description: 'Compre recargas de todas as operadoras direto pela plataforma, pagando com KWATT ou saldo misto.',
    color: 'cyan',
  },
  {
    icon: 'TrendingUp',
    title: 'Cashback de até 12%',
    description: 'Receba parte do que gasta de volta em KWATT. Quanto mais usar, maior o percentual de retorno.',
    color: 'amber',
  },
  {
    icon: 'Gift',
    title: 'Programa de indicação',
    description: 'Convide amigos e ganhe KWATT a cada cadastro + compra. Limite semanal generoso.',
    color: 'pink',
  },
  {
    icon: 'Shield',
    title: 'Staking & governança',
    description: 'Trave tokens para votar em decisões do ecossistema e receber rewards por longos prazos.',
    color: 'purple',
  },
  {
    icon: 'Globe',
    title: 'Ecossistema EnergiaLivre',
    description: 'Use no marketplace de excedente solar, em assinaturas, serviços de instalação, certificações.',
    color: 'sky',
  },
] as const

/**
 * Token distribution breakdown
 */
export const TOKEN_DISTRIBUTION = [
  { label: 'Pré-venda pública', percent: PRESALE_ALLOCATION * 100, tokens: TOKEN_TOTAL_SUPPLY * PRESALE_ALLOCATION, color: 'emerald' },
  { label: 'Recompensas usuários', percent: REWARDS_ALLOCATION * 100, tokens: TOKEN_TOTAL_SUPPLY * REWARDS_ALLOCATION, color: 'cyan' },
  { label: 'Tesouraria / DAO', percent: TREASURY_ALLOCATION * 100, tokens: TOKEN_TOTAL_SUPPLY * TREASURY_ALLOCATION, color: 'yellow' },
  { label: 'Liquidez DEX', percent: LIQUIDITY_ALLOCATION * 100, tokens: TOKEN_TOTAL_SUPPLY * LIQUIDITY_ALLOCATION, color: 'amber' },
  { label: 'Ecossistema', percent: ECOSYSTEM_ALLOCATION * 100, tokens: TOKEN_TOTAL_SUPPLY * ECOSYSTEM_ALLOCATION, color: 'pink' },
  { label: 'Advisors', percent: ADVISORS_ALLOCATION * 100, tokens: TOKEN_TOTAL_SUPPLY * ADVISORS_ALLOCATION, color: 'purple' },
]
