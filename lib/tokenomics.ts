export const KWH_REFERENCE_PRICE = 0.95
export const KWATT_SYMBOL = 'KWATT'
export const KWATT_DECIMALS = 18

export const KWATT_CHAIN_ID = 137
export const KWATT_NETWORK = 'polygon-mainnet'
export const KWATT_RPC_URL = 'https://polygon-rpc.com'
export const KWATT_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000'
export const KWATT_EXPLORER_URL = 'https://polygonscan.com/token/' + KWATT_CONTRACT_ADDRESS
export const KWATT_DEPLOY_STATUS = 'not_deployed'
export const KWATT_LAUNCH_BLOCK_TARGET = 72_500_000

// ============================================
// REGRAS DE VALORIZAÇÃO
// ============================================
// O token KWATT é um utilitário do ecossistema EnergiaLivre.
//  - Uso interno: pagamento de faturas, cashback, staking
//  - Preço inicial: 30% do valor do kWh no Brasil (R$ 0,285)
//  - Cresce 3% ao mês (composto)
//  - Após compra: 50% liberado para movimentação
//  - Lançamento externo: 25 de janeiro de 2027
// ============================================

export const KWATT_INITIAL_RATIO = 0.30
export const KWATT_MONTHLY_GROWTH = 0.03
export const KWATT_RELEASE_PERCENT = 0.50

export const TOKEN_LAUNCH_DATE = new Date(2027, 0, 25, 0, 0, 0)
export const PRESALE_END_DATE = new Date(2027, 0, 25, 0, 0, 0)

// Data de referência para início da contagem de valorização
const PRICE_START_DATE = new Date(2026, 5, 8, 0, 0, 0)

export function getCurrentRatio(): number {
  const now = new Date()
  const monthsSinceStart = (now.getFullYear() - PRICE_START_DATE.getFullYear()) * 12
    + (now.getMonth() - PRICE_START_DATE.getMonth())

  if (monthsSinceStart <= 0) return KWATT_INITIAL_RATIO
  return KWATT_INITIAL_RATIO * Math.pow(1 + KWATT_MONTHLY_GROWTH, monthsSinceStart)
}

export function getCurrentUnitPrice(): number {
  return KWH_REFERENCE_PRICE * getCurrentRatio()
}

export function getPriceAtDate(date: Date): number {
  const monthsSinceStart = (date.getFullYear() - PRICE_START_DATE.getFullYear()) * 12
    + (date.getMonth() - PRICE_START_DATE.getMonth())
  if (monthsSinceStart <= 0) return KWH_REFERENCE_PRICE * KWATT_INITIAL_RATIO
  const ratio = KWATT_INITIAL_RATIO * Math.pow(1 + KWATT_MONTHLY_GROWTH, monthsSinceStart)
  return KWH_REFERENCE_PRICE * ratio
}

export const KWATT_UNIT_PRICE = getCurrentUnitPrice()

export function getTokenExplorerLink(addr?: string): string {
  const a = addr && addr !== '0x0000000000000000000000000000000000000000' ? addr : KWATT_CONTRACT_ADDRESS
  return `https://polygonscan.com/token/${a}`
}

export function getTokenDeployStatus(): 'not_deployed' | 'pending' | 'deployed' | 'verified' {
  return KWATT_CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000'
    ? 'not_deployed'
    : 'deployed'
}

export const TOKEN_TOTAL_SUPPLY = 1_000_000_000
export const PRESALE_ALLOCATION = 0.20
export const REWARDS_ALLOCATION = 0.15
export const TREASURY_ALLOCATION = 0.25
export const LIQUIDITY_ALLOCATION = 0.20
export const ECOSYSTEM_ALLOCATION = 0.15
export const ADVISORS_ALLOCATION = 0.05

export interface TokenPackage {
  code: string
  tokens: number
  basePrice: number
  discount: number
  bonus: number
  popular: boolean
  description: string
  referralBonus: number
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

export function getFinalPrice(pkg: TokenPackage): number {
  return pkg.basePrice * (1 - pkg.discount / 100)
}

export function getTotalTokens(pkg: TokenPackage): number {
  return pkg.tokens + pkg.bonus
}

export function getReleasedTokens(tokens: number): number {
  return Math.round(tokens * KWATT_RELEASE_PERCENT)
}

export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export function formatTokens(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`
  return value.toLocaleString('pt-BR')
}

export const TOKEN_USE_CASES = [
  {
    icon: 'Zap',
    title: 'Pagar sua conta de energia',
    description: 'Cada 1 KWATT equivale a 30% de 1 kWh. Use tokens para abater do seu consumo real na fatura.',
    color: 'emerald',
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

export const TOKEN_DISTRIBUTION = [
  { label: 'Pré-venda pública', percent: PRESALE_ALLOCATION * 100, tokens: TOKEN_TOTAL_SUPPLY * PRESALE_ALLOCATION, color: 'emerald' },
  { label: 'Recompensas usuários', percent: REWARDS_ALLOCATION * 100, tokens: TOKEN_TOTAL_SUPPLY * REWARDS_ALLOCATION, color: 'cyan' },
  { label: 'Tesouraria / DAO', percent: TREASURY_ALLOCATION * 100, tokens: TOKEN_TOTAL_SUPPLY * TREASURY_ALLOCATION, color: 'yellow' },
  { label: 'Liquidez DEX', percent: LIQUIDITY_ALLOCATION * 100, tokens: TOKEN_TOTAL_SUPPLY * LIQUIDITY_ALLOCATION, color: 'amber' },
  { label: 'Ecossistema', percent: ECOSYSTEM_ALLOCATION * 100, tokens: TOKEN_TOTAL_SUPPLY * ECOSYSTEM_ALLOCATION, color: 'pink' },
  { label: 'Advisors', percent: ADVISORS_ALLOCATION * 100, tokens: TOKEN_TOTAL_SUPPLY * ADVISORS_ALLOCATION, color: 'purple' },
]
