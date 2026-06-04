import { vi } from 'vitest'

type ChainResult = { data: any; error: any; count?: number | null }

export function createSupabaseMock(overrides: {
  user?: any
  responses?: Record<string, ChainResult | ((params: any) => ChainResult)>
} = {}) {
  const responses = overrides.responses ?? {}

  const makeChain = (table: string) => {
    const chain: any = {
      _table: table,
      _filters: [] as Array<{ op: string; col: string; val: any }>,
    }

    const resolve = (): ChainResult => {
      const key = `${table}:${chain._filters.map((f: { col: string; val: any }) => `${f.col}=${f.val}`).join('|')}`
      const fallback = chain._filters.length === 0 ? `${table}:*` : null

      const r =
        responses[key] ??
        (fallback ? responses[fallback] : undefined) ??
        ({ data: null, error: null } as ChainResult)

      return typeof r === 'function' ? (r as any)(chain._filters) : r
    }

    const terminal = () => {
      const p = resolve()
      return Promise.resolve(p)
    }

    chain.select = vi.fn(() => chain)
    chain.insert = vi.fn(() => chain)
    chain.update = vi.fn(() => chain)
    chain.delete = vi.fn(() => chain)
    chain.upsert = vi.fn(() => chain)
    chain.eq = vi.fn((col: string, val: any) => {
      chain._filters.push({ op: 'eq', col, val })
      return chain
    })
    chain.neq = vi.fn((col: string, val: any) => {
      chain._filters.push({ op: 'neq', col, val })
      return chain
    })
    chain.gt = vi.fn(() => chain)
    chain.gte = vi.fn(() => chain)
    chain.lt = vi.fn(() => chain)
    chain.lte = vi.fn(() => chain)
    chain.in = vi.fn(() => chain)
    chain.is = vi.fn(() => chain)
    chain.or = vi.fn(() => chain)
    chain.order = vi.fn(() => chain)
    chain.limit = vi.fn(() => chain)
    chain.range = vi.fn(() => terminal())
    chain.single = vi.fn(() => terminal())
    chain.maybeSingle = vi.fn(() => terminal())

    return chain
  }

  const supabase = {
    auth: {
      getUser: vi.fn(async () => ({
        data: { user: overrides.user ?? null },
        error: null,
      })),
      getSession: vi.fn(async () => ({
        data: { session: overrides.user ? { user: overrides.user } : null },
        error: null,
      })),
    },
    from: vi.fn((table: string) => makeChain(table)),
  }

  return supabase
}

export const supabaseModuleMock = {
  createClient: vi.fn(),
  createServerClient: vi.fn(),
}

export function installSupabaseMock(overrides: Parameters<typeof createSupabaseMock>[0] = {}) {
  const mock = createSupabaseMock(overrides)
  supabaseModuleMock.createClient.mockImplementation(() => Promise.resolve(mock))
  supabaseModuleMock.createServerClient.mockImplementation(() => Promise.resolve(mock))
  return mock
}
