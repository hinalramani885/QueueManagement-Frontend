import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import process from 'node:process'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Where the Spring Boot backend runs during development
  const backendTarget = env.VITE_PROXY_TARGET || 'http://localhost:8081'

  // The dev server runs on plain HTTP (http://localhost:5173) by default.
  // Set VITE_DEV_HTTPS=true to serve it over HTTPS with the self-signed certificate in ssl/
  // (browsers will show "Not secure" for that certificate).
  const useHttps = env.VITE_DEV_HTTPS === 'true'
    && fs.existsSync('ssl/key.pem') && fs.existsSync('ssl/cert.pem')

  const proxyOptions = {
    target: backendTarget,
    changeOrigin: true,
    secure: false, // allow a self-signed backend certificate if the backend uses HTTPS
  }

  return {
    plugins: [react()],
    define: {
      global: 'window',
    },
    server: {
      https: useHttps
        ? { key: fs.readFileSync('ssl/key.pem'), cert: fs.readFileSync('ssl/cert.pem') }
        : undefined,
      host: true,
      proxy: {
        '/api': proxyOptions,
        '/uploads': proxyOptions,
        // SockJS / STOMP endpoint (HTTP polling + WebSocket upgrade)
        '/ws': { ...proxyOptions, ws: true },
      },
    },
  }
})
