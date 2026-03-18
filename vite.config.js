import { defineConfig, loadEnv } from 'vite'
import { createServer } from 'http'

// Inline dev API handler so /api/contact works with `npm run dev`
function apiDevPlugin() {
    return {
        name: 'api-dev',
        configureServer(server) {
            server.middlewares.use('/api/contact', async (req, res) => {
                if (req.method !== 'POST') {
                    res.writeHead(405)
                    return res.end(JSON.stringify({ error: 'Method not allowed' }))
                }

                let body = ''
                req.on('data', chunk => (body += chunk))
                req.on('end', async () => {
                    try {
                        const data = JSON.parse(body)
                        // Dynamically import the handler (supports env vars via loadEnv)
                        const { default: handler } = await import('./api/contact.js?t=' + Date.now())
                        // Mock res/req for the serverless handler signature
                        const mockRes = {
                            _status: 200,
                            _body: null,
                            status(code) { this._status = code; return this },
                            json(payload) {
                                this._body = JSON.stringify(payload)
                                res.writeHead(this._status, { 'Content-Type': 'application/json' })
                                res.end(this._body)
                            }
                        }
                        await handler({ method: 'POST', body: data }, mockRes)
                    } catch (err) {
                        console.error('[api-dev] error:', err)
                        res.writeHead(500, { 'Content-Type': 'application/json' })
                        res.end(JSON.stringify({ error: 'Internal error' }))
                    }
                })
            })
        }
    }
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '')
    // Inject env vars so api/contact.js can read process.env
    process.env.EMAIL_USER = env.EMAIL_USER
    process.env.EMAIL_PASS = env.EMAIL_PASS

    return {
        base: './',
        plugins: [apiDevPlugin()],
        server: {
            port: 3000,
            strictPort: false,
        },
    }
})
