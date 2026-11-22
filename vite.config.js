import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'
import fs from 'fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'

// Where vite-plugin-mkcert keeps its local certificate authority (CA) and certificates
const MKCERT_DIR = path.join(os.homedir(), '.vite-plugin-mkcert')

/**
 * Serves the PUBLIC part of the local development CA at /dev-ca.crt so a phone on the same
 * Wi-Fi can download and trust it (needed for camera/QR scanning and push notifications).
 * The CA private key is never served.
 */
function devCaDownload() {
  return {
    name: 'dev-ca-download',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/dev-ca.crt', (req, res) => {
        const caFile = path.join(MKCERT_DIR, 'rootCA.pem')
        if (!fs.existsSync(caFile)) {
          res.statusCode = 404
          res.end('Development CA not generated yet')
          return
        }
        res.setHeader('Content-Type', 'application/x-x509-ca-cert')
        res.setHeader('Content-Disposition', 'attachment; filename="queueless-dev-ca.crt"')
        res.end(fs.readFileSync(caFile))
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Where the Spring Boot backend runs during development
  const backendTarget = env.VITE_PROXY_TARGET || 'http://localhost:8081'

  // HTTPS is on by default so the app also works on phones (camera/QR scanner and push
  // notifications require HTTPS on non-localhost addresses). The certificate is issued by a
  // local CA (mkcert) and covers localhost plus this PC's network IPs; it is regenerated
  // automatically when the IP changes. Run `npm run trust-cert` once so this PC trusts it.
  // Set VITE_DEV_HTTPS=false to use plain HTTP instead.
  const useHttps = env.VITE_DEV_HTTPS !== 'false'

  const proxyOptions = {
    target: backendTarget,
    changeOrigin: true,
    secure: false, // allow a self-signed backend certificate if the backend uses HTTPS
  }

  return {
    plugins: [react(), ...(useHttps ? [mkcert({ savePath: MKCERT_DIR }), devCaDownload()] : [])],
    define: {
      global: 'window',
    },
    server: {
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
