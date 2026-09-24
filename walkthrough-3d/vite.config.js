import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // host: true exposes the dev server on the local network (open it from a phone on the same Wi-Fi)
  server: { port: 5174, host: true },
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 1600,
  },
})
