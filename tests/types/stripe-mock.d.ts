/// <reference types="vitest" />

declare module 'stripe' {
  export const __stripeInstance: {
    checkout: {
      sessions: {
        create: import('vitest').Mock
        expire: import('vitest').Mock
      }
    }
    subscriptions: {
      update: import('vitest').Mock
      retrieve: import('vitest').Mock
    }
    webhooks: {
      constructEvent: import('vitest').Mock
    }
  }
}
