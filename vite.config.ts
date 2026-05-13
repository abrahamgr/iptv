import { readFileSync } from 'node:fs'
import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => ({
  // requires trailing slash for loading assets properly in production
  base: `/tv${mode === 'production' ? '/' : ''}`,
  plugins: [tailwindcss(), reactRouter()],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    port: 3000,
    host: true,
    ...(process.env.HTTPS === 'true' && {
      https: {
        key: readFileSync('certs/cert.key'),
        cert: readFileSync('certs/cert.pem'),
      },
    }),
  },
}))
