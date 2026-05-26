import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { loadEnv } from 'vite'
import { sendContactEmail, type ContactRequest } from './api/lib/contact'
import { razorpayApiDev } from './vite-plugin-razorpay-api'

function readJsonBody(req: import('node:http').IncomingMessage) {
  return new Promise<ContactRequest>((resolve) => {
    let raw = ''

    req.on('data', (chunk) => {
      raw += chunk
    })

    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) as ContactRequest : {})
      } catch {
        resolve({})
      }
    })

    req.on('error', () => {
      resolve({})
    })
  })
}

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'clipcraft-contact-api',
        configureServer(server) {
          server.middlewares.use('/api/contact', async (req, res) => {
            res.setHeader('Content-Type', 'application/json')

            if (req.method === 'OPTIONS') {
              res.statusCode = 204
              res.end()
              return
            }

            if (req.method !== 'POST') {
              res.statusCode = 405
              res.end(JSON.stringify({ error: 'Method not allowed.' }))
              return
            }

            const body = await readJsonBody(req)
            const env = loadEnv(server.config.mode, server.config.root, '')
            const result = await sendContactEmail(body, env)
            res.statusCode = result.status
            res.end(JSON.stringify(result.body))
          })
        },
      },
      razorpayApiDev(),
    ],
  }
})
