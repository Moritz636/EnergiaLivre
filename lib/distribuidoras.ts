// ============================================
// DISTRIBUIDORAS DE ENERGIA DO BRASIL
// ============================================
// Lista das maiores distribuidoras para o modo 'distributor' do match.
// Base: dados publicos ANEEL (2024). ~99% do mercado brasileiro coberto.
// ============================================

export interface Distribuidora {
  /** Nome fantasia / razao social abreviada */
  nome: string
  /** Codigo ANEEL (para queries) */
  codigo: string
  /** UFs atendidas */
  estados: string[]
  /** Market share aproximado (em %) */
  market_share: number
  /** ~numero de unidades consumidoras */
  consumidores: string
  /** Site oficial */
  site: string
}

export const DISTRIBUIDORAS: Distribuidora[] = [
  {
    nome: 'Enel',
    codigo: 'ENEL',
    estados: ['CE', 'GO', 'RJ', 'SP'],
    market_share: 13.0,
    consumidores: '~10 milhões',
    site: 'https://www.enel.com.br',
  },
  {
    nome: 'CEMIG',
    codigo: 'CEMIG',
    estados: ['MG'],
    market_share: 11.5,
    consumidores: '~8.7 milhões',
    site: 'https://www.cemig.com.br',
  },
  {
    nome: 'CPFL Energia',
    codigo: 'CPFL',
    estados: ['SP', 'RS', 'PR', 'MG'],
    market_share: 9.0,
    consumidores: '~7.5 milhões',
    site: 'https://www.cpfl.com.br',
  },
  {
    nome: 'Equatorial Energia',
    codigo: 'EQTL',
    estados: ['AL', 'AP', 'CE', 'GO', 'MA', 'PA', 'PI', 'RN', 'RS', 'SC', 'SP'],
    market_share: 14.0,
    consumidores: '~10 milhões',
    site: 'https://www.equatorialenergia.com.br',
  },
  {
    nome: 'Light',
    codigo: 'LIGHT',
    estados: ['RJ'],
    market_share: 4.5,
    consumidores: '~4.2 milhões',
    site: 'https://www.light.com.br',
  },
  {
    nome: 'Copel',
    codigo: 'COPEL',
    estados: ['PR'],
    market_share: 6.5,
    consumidores: '~4.5 milhões',
    site: 'https://www.copel.com',
  },
  {
    nome: 'Energisa',
    codigo: 'ENRG',
    estados: ['MG', 'SP', 'RJ', 'MS', 'MT', 'PR', 'RO', 'AC', 'TO'],
    market_share: 8.0,
    consumidores: '~7 milhões',
    site: 'https://www.energisa.com.br',
  },
  {
    nome: 'Elektro',
    codigo: 'ELEK',
    estados: ['SP', 'MS'],
    market_share: 2.0,
    consumidores: '~2.5 milhões',
    site: 'https://www.elektro.com.br',
  },
  {
    nome: 'CEEE Equatorial',
    codigo: 'CEEE',
    estados: ['RS'],
    market_share: 2.0,
    consumidores: '~1.7 milhão',
    site: 'https://www.ceee.com.br',
  },
  {
    nome: 'RGE Sul',
    codigo: 'RGE',
    estados: ['RS'],
    market_share: 1.5,
    consumidores: '~1.5 milhão',
    site: 'https://www.rge-rs.com.br',
  },
]

/**
 * Retorna lista ordenada por market share
 */
export function getDistribuidoras(): Distribuidora[] {
  return [...DISTRIBUIDORAS].sort((a, b) => b.market_share - a.market_share)
}

/**
 * Sugere distribuidoras para um estado
 */
export function getDistribuidorasPorEstado(uf: string): Distribuidora[] {
  const upper = uf.toUpperCase()
  return DISTRIBUIDORAS.filter((d) => d.estados.includes(upper))
}

/**
 * Encontra distribuidora por nome aproximado
 */
export function findDistribuidora(query: string): Distribuidora | null {
  const q = query.trim().toLowerCase()
  if (!q) return null
  return (
    DISTRIBUIDORAS.find((d) => d.nome.toLowerCase() === q) ||
    DISTRIBUIDORAS.find((d) => d.nome.toLowerCase().includes(q)) ||
    null
  )
}
