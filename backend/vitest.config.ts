import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/setup.ts'],
    testTimeout: 15000,
    hookTimeout: 15000,
    // Vitest 4.x: 使用单线程避免 SQLite 并发冲突
    pool: 'forks',
    maxWorkers: 1,
    minWorkers: 1,
    fileParallelism: false,
    sequence: {
      concurrent: false,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
