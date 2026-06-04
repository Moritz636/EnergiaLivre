import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  // Plugin types are mismatched between vitest's vite and @vitejs/plugin-react's vite
  plugins: [react() as any],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    exclude: ['node_modules', '.next', '.vercel'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['app/api/**', 'lib/**'],
      exclude: ['**/*.d.ts', '**/*.types.ts'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
