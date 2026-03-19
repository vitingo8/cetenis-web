import { defineConfig, loadEnv } from 'vite'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import nodemailer from 'nodemailer'
import {
    buildContactEmailPlain,
    buildContactEmailHtml,
    getLogoAttachment,
    getSiteUrl,
} from './lib/contact-email.js'

function loadEnvLocal(root) {
    const path = resolve(root, '.env.local')
    if (!existsSync(path)) return {}
    const text = readFileSync(path, 'utf8')
    const out = {}
    for (const line of text.split('\n')) {
        const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/)
        if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '').trim()
    }
    return out
}

function apiDevPlugin(env) {
    return {
        name: 'api-dev',
        configureServer(server) {
            server.middlewares.use('/api/contact', (req, res) => {
                if (req.method !== 'POST') {
                    res.writeHead(405, { 'Content-Type': 'application/json' })
                    return res.end(JSON.stringify({ error: 'Method not allowed' }))
                }

                let body = ''
                req.on('data', chunk => (body += chunk))
                req.on('end', async () => {
                    try {
                        const { category, from_name, from_email, country, message } = JSON.parse(body)

                        if (!from_name || !from_email || !country || !message) {
                            res.writeHead(400, { 'Content-Type': 'application/json' })
                            return res.end(JSON.stringify({ error: 'Missing required fields' }))
                        }

                        const local = loadEnvLocal(process.cwd())
                        const emailUser = local.EMAIL_USER || env.EMAIL_USER || process.env.EMAIL_USER || 'cetenis@cetenis.es'
                        const emailPass = local.EMAIL_PASS || env.EMAIL_PASS || process.env.EMAIL_PASS

                        if (!emailPass) {
                            console.error('[api-dev] EMAIL_PASS not set in .env or .env.local')
                            res.writeHead(500, { 'Content-Type': 'application/json' })
                            return res.end(JSON.stringify({ error: 'EMAIL_PASS not configured' }))
                        }

                        const transporter = nodemailer.createTransport({
                            host: 'smtp.office365.com',
                            port: 587,
                            secure: false,
                            auth: { user: emailUser, pass: emailPass },
                            tls: { ciphers: 'SSLv3' },
                        })

                        const data = { category, from_name, from_email, country, message }
                        const text = buildContactEmailPlain(data)
                        const rootDir = process.cwd()
                        const logoAtt = getLogoAttachment(rootDir)
                        const siteUrl = getSiteUrl()
                        const logoSrc = logoAtt ? 'cid:logo' : `${siteUrl}/logo.png`
                        const html = buildContactEmailHtml(data, { logoSrc })

                        const mailOpts = {
                            from:    `"CETENIS Web" <${emailUser}>`,
                            to:      'cetenis@cetenis.es',
                            subject: `[CETENIS · Web] ${category} — ${from_name} (${country})`,
                            text,
                            html,
                            replyTo: from_email,
                        }
                        if (logoAtt) mailOpts.attachments = [logoAtt]

                        await transporter.sendMail(mailOpts)

                        res.writeHead(200, { 'Content-Type': 'application/json' })
                        res.end(JSON.stringify({ success: true }))
                    } catch (err) {
                        console.error('[api-dev] error:', err.message)
                        res.writeHead(500, { 'Content-Type': 'application/json' })
                        res.end(JSON.stringify({ error: 'Failed to send email' }))
                    }
                })
            })
        }
    }
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '')

    return {
        base: './',
        plugins: [apiDevPlugin(env)],
        server: {
            port: 3000,
            strictPort: false,
        },
    }
})
