import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

const BACKUP_PATH = path.resolve(__dirname, 'data/backup.json')

function backupPlugin(): Plugin {
  return {
    name: 'backup',
    configureServer(server) {
      server.middlewares.use('/api/backup', (req, res) => {
        if (req.method === 'GET') {
          if (!fs.existsSync(BACKUP_PATH)) {
            res.statusCode = 404
            res.end()
            return
          }
          res.setHeader('Content-Type', 'application/json')
          res.end(fs.readFileSync(BACKUP_PATH, 'utf-8'))
        } else if (req.method === 'POST') {
          let body = ''
          req.on('data', (chunk: Buffer) => { body += chunk.toString() })
          req.on('end', () => {
            const dir = path.dirname(BACKUP_PATH)
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
            fs.writeFileSync(BACKUP_PATH, body, 'utf-8')
            res.statusCode = 200
            res.end('ok')
          })
        } else {
          res.statusCode = 405
          res.end()
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), backupPlugin()],
})
