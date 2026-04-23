import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  // Determine if HTTPS should be enabled based on mode or API base URL
  const isProduction = mode === 'production'
  const apiBaseUrl = env.VITE_API_BASE_URL || ''
  const isHttpsApi = apiBaseUrl.startsWith('https')
  const enableHttps = isProduction || isHttpsApi

  return {
    plugins: [
      react(),
      enableHttps ? basicSsl() : []
    ],
    server: {
      port: Number(env.FE_PORT) || 5173,
      https: enableHttps,
    },
  }
})