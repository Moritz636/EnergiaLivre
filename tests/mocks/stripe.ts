import { vi } from 'vitest'

export const stripeMock = {
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

export function resetStripeMock() {
  vi.clearAllMocks()
}
