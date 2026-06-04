import '@testing-library/jest-dom/vitest'
import { vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
  createServerClient: vi.fn(),
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/lib/supabase/singleton', () => ({
  getSupabase: vi.fn(),
  resetSupabase: vi.fn(),
}))

vi.mock('@/lib/supabaseAdmin', () => ({
  createAdminClient: vi.fn(),
}))

vi.mock('stripe', () => {
  const stripeInstance: any = {
    checkout: {
      sessions: {
        create: vi.fn(),
        expire: vi.fn(),
      },
    },
    subscriptions: {
      update: vi.fn(),
      retrieve: vi.fn(),
    },
    webhooks: {
      constructEvent: vi.fn(),
    },
  }
  const StripeCtor: any = vi.fn().mockImplementation(() => stripeInstance)
  return {
    default: StripeCtor,
    __stripeInstance: stripeInstance,
  }
})

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    getAll: vi.fn(() => []),
  })),
  headers: vi.fn(async () => new Map()),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

process.env.NEXT_PUBLIC_SUPABASE_URL ||= 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||= 'test-anon-key'
process.env.STRIPE_SECRET_KEY ||= 'sk_test_dummy'
process.env.STRIPE_WEBHOOK_SECRET ||= 'whsec_test_dummy'
process.env.NEXT_PUBLIC_SITE_URL ||= 'http://localhost:3000'
