import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    // Playwright specs live in e2e/ and are run via `npm run test:e2e`
    exclude: ['e2e/**', 'node_modules/**', '.next/**'],
  },
})
