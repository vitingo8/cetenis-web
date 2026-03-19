import nodemailer from 'nodemailer';
import {
    buildContactEmailPlain,
    buildContactEmailHtml,
    getLogoAttachment,
    getSiteUrl,
} from '../lib/contact-email.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { category, from_name, from_email, country, message } = req.body;

    if (!from_name || !from_email || !country || !message) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const emailUser = process.env.EMAIL_USER || 'cetenis@cetenis.es';
    const emailPass = process.env.EMAIL_PASS;

    if (!emailPass) {
        return res.status(500).json({ error: 'Email credentials not configured' });
    }

    const transporter = nodemailer.createTransport({
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
        auth: {
            user: emailUser,
            pass: emailPass,
        },
        tls: {
            ciphers: 'SSLv3',
        },
    });

    const data = { category, from_name, from_email, country, message };
    const text = buildContactEmailPlain(data);
    const rootDir = process.cwd();
    const logoAtt = getLogoAttachment(rootDir);
    const siteUrl = getSiteUrl();
    const logoSrc = logoAtt ? 'cid:cetenislogo' : `${siteUrl}/logo.png`;
    const html = buildContactEmailHtml(data, { logoSrc });

    const subject = `[CETENIS · Web] ${category} — ${from_name} (${country})`;

    const mailOpts = {
        from: `"CETENIS Web" <${emailUser}>`,
        to: 'cetenis@cetenis.es',
        subject,
        text,
        html,
        replyTo: from_email,
    };

    if (logoAtt) {
        mailOpts.attachments = [logoAtt];
    }

    try {
        await transporter.sendMail(mailOpts);

        return res.status(200).json({ success: true });
    } catch (err) {
        console.error('Email send error:', err);
        return res.status(500).json({ error: 'Failed to send email' });
    }
}
