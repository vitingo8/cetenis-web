/**
 * Plantilla de correo corporativo CETENIS (HTML + texto plano).
 * Colores alineados con la web: negro, blanco, acentos discretos.
 */
import { existsSync } from 'fs'
import { resolve } from 'path'

// Paleta alineada con el logo oficial: blanco sobre negro (#000)
const BRAND = {
    black: '#000000',
    bg: '#0a0a0a',
    card: '#111111',
    border: '#2a2a2a',
    muted: '#a3a3a3',
    white: '#ffffff',
    accent: '#e5e5e5',
    badgeBg: 'rgba(255,255,255,0.08)',
    badgeBorder: 'rgba(255,255,255,0.35)',
}

function escapeHtml(s) {
    if (s == null) return ''
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/\n/g, '<br>')
}

function formatCategory(cat) {
    const map = {
        Investor: 'Investor',
        Government: 'Government (Gov)',
        'DC Operator': 'DC Operator',
    }
    return map[cat] || cat || '—'
}

function safeMailto(email) {
    return 'mailto:' + String(email).replace(/[\s<>"']/g, '')
}

export function buildContactEmailPlain({ category, from_name, from_email, country, message }) {
    const cat = formatCategory(category)
    return [
        'CETENIS — Nuevo contacto desde la web',
        '═'.repeat(44),
        '',
        `Perfil / categoría : ${cat}`,
        `Nombre             : ${from_name}`,
        `Email              : ${from_email}`,
        `País               : ${country}`,
        '',
        'Mensaje:',
        message,
        '',
        '─'.repeat(44),
        'Responder a este correo para contestar directamente al remitente.',
        'cetenis@cetenis.es · Empowering Data',
    ].join('\n')
}

/**
 * @param {object} data
 * @param {{ logoSrc: string }} opts - logoSrc: 'cid:logo' o URL absoluta
 */
export function buildContactEmailHtml(data, opts = {}) {
    const { category, from_name, from_email, country, message } = data
    const logoSrc = opts.logoSrc || 'https://cetenis-web.vercel.app/logo.png'
    const cat = escapeHtml(formatCategory(category))
    const name = escapeHtml(from_name)
    const emailEsc = escapeHtml(from_email)
    const mailtoHref = safeMailto(from_email)
    const ctry = escapeHtml(country)
    const msg = escapeHtml(message)

    return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width">
<title>Nuevo contacto — CETENIS</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.bg};font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${BRAND.bg};padding:32px 16px;">
<tr>
<td align="center">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:${BRAND.card};border:1px solid ${BRAND.border};border-radius:12px;overflow:hidden;">
<tr>
<td style="padding:26px 32px 22px;border-bottom:1px solid ${BRAND.border};background:${BRAND.black};">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0">
<tr>
<td valign="middle" style="padding-right:16px;">
<img src="${logoSrc}" alt="Cetenis" width="220" height="auto" style="display:block;max-height:56px;width:auto;height:auto;border:0;outline:none;-ms-interpolation-mode:bicubic;">
</td>
<td valign="middle" align="right" style="font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:${BRAND.muted};white-space:nowrap;">
Empowering Data
</td>
</tr>
</table>
</td>
</tr>
<tr>
<td style="padding:24px 32px 8px;">
<p style="margin:0 0 20px;font-size:20px;font-weight:700;color:${BRAND.white};letter-spacing:-0.02em;">
Nuevo contacto desde la web
</p>
<span style="display:inline-block;padding:6px 14px;border-radius:999px;border:1px solid ${BRAND.badgeBorder};background:${BRAND.badgeBg};color:${BRAND.white};font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">
${cat}
</span>
</td>
</tr>
<tr>
<td style="padding:8px 32px 24px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:20px;border-collapse:collapse;">
<tr>
<td style="padding:12px 0;border-bottom:1px solid ${BRAND.border};font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:${BRAND.muted};width:120px;vertical-align:top;">Nombre</td>
<td style="padding:12px 0;border-bottom:1px solid ${BRAND.border};font-size:15px;color:${BRAND.white};font-weight:600;">${name}</td>
</tr>
<tr>
<td style="padding:12px 0;border-bottom:1px solid ${BRAND.border};font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:${BRAND.muted};vertical-align:top;">Email</td>
<td style="padding:12px 0;border-bottom:1px solid ${BRAND.border};font-size:15px;"><a href="${mailtoHref}" style="color:${BRAND.accent};text-decoration:none;">${emailEsc}</a></td>
</tr>
<tr>
<td style="padding:12px 0;border-bottom:1px solid ${BRAND.border};font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:${BRAND.muted};vertical-align:top;">País</td>
<td style="padding:12px 0;border-bottom:1px solid ${BRAND.border};font-size:15px;color:${BRAND.white};">${ctry}</td>
</tr>
</table>
</td>
</tr>
<tr>
<td style="padding:0 32px 28px;">
<p style="margin:0 0 10px;font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:${BRAND.muted};">Mensaje</p>
<div style="padding:18px 20px;background:#0d0d0d;border:1px solid ${BRAND.border};border-radius:10px;border-left:3px solid ${BRAND.accent};font-size:14px;line-height:1.65;color:${BRAND.white};">
${msg}
</div>
</td>
</tr>
<tr>
<td style="padding:20px 32px;background:#0d0d0d;border-top:1px solid ${BRAND.border};">
<p style="margin:0;font-size:12px;line-height:1.6;color:${BRAND.muted};">
<strong style="color:${BRAND.white};">CETENIS SL</strong> · Infraestructura hyperscale de datos.<br>
Responde a este correo para contactar directamente con <strong style="color:${BRAND.accent};">${emailEsc}</strong>.
</p>
</td>
</tr>
</table>
<p style="margin:20px 0 0;font-size:11px;color:#525252;text-align:center;max-width:560px;">
Este mensaje se generó automáticamente desde el formulario de contacto de cetenis.es
</p>
</td>
</tr>
</table>
</body>
</html>`
}

/**
 * Adjunto CID para el logo (Outlook / Gmail suelen mostrarlo bien).
 */
export function getLogoAttachment(rootDir) {
    const logoPath = resolve(rootDir, 'public', 'logo.png')
    if (!existsSync(logoPath)) return null
    return {
        filename: 'logo.png',
        path: logoPath,
        cid: 'logo',
        contentType: 'image/png',
        contentDisposition: 'inline',
    }
}

export function getSiteUrl() {
    const u = process.env.PUBLIC_SITE_URL || process.env.VITE_SITE_URL || process.env.VERCEL_URL
    if (!u) return 'https://cetenis-web.vercel.app'
    if (u.startsWith('http')) return u.replace(/\/$/, '')
    return `https://${u}`.replace(/\/$/, '')
}
