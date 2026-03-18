import nodemailer from 'nodemailer';

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

    const emailBody = `
New inquiry from the Cetenis website
─────────────────────────────────────
Category : ${category}
Name     : ${from_name}
Email    : ${from_email}
Country  : ${country}

Message:
${message}
─────────────────────────────────────
    `.trim();

    try {
        await transporter.sendMail({
            from:     `"Cetenis Web" <${emailUser}>`,
            to:       'cetenis@cetenis.es',
            subject:  `[${category}] Inquiry from ${from_name} – ${country}`,
            text:     emailBody,
            replyTo:  from_email,
        });

        return res.status(200).json({ success: true });
    } catch (err) {
        console.error('Email send error:', err);
        return res.status(500).json({ error: 'Failed to send email' });
    }
}
