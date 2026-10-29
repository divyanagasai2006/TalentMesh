import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'

const localEnvPath = resolve(process.cwd(), '.env.local')

if (existsSync(localEnvPath)) {
  const localEnv = readFileSync(localEnvPath, 'utf8').split(/\r?\n/)

  for (const line of localEnv) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)

    if (!match || !match[1].startsWith('VITE_')) continue

    process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2').trim()
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
