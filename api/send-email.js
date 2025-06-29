const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const { name, company, email, phone, message } = req.body;

    // Validar datos requeridos
    if (!name || !company || !email || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Faltan campos requeridos' 
      });
    }

    // Configurar transporter de nodemailer
    // Puedes usar Gmail, Outlook, o cualquier SMTP
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Tu email de Gmail
        pass: process.env.EMAIL_PASS  // Tu contraseña de aplicación de Gmail
      }
    });

    // Configurar el email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'cetenis@cetenis.es',
      subject: `Nueva consulta de ${company} - ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            Nueva Consulta - CETENIS
          </h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #007bff; margin-top: 0;">Datos del Cliente</h3>
            <p><strong>Nombre:</strong> ${name}</p>
            <p><strong>Empresa:</strong> ${company}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Teléfono:</strong> ${phone || 'No proporcionado'}</p>
          </div>
          
          <div style="background: #ffffff; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px;">
            <h3 style="color: #333; margin-top: 0;">Mensaje</h3>
            <p style="line-height: 1.6; white-space: pre-line;">${message}</p>
          </div>
          
          <div style="margin-top: 30px; padding: 15px; background: #e9ecef; border-radius: 8px; font-size: 12px; color: #6c757d;">
            <p><strong>Enviado desde:</strong> Formulario web de CETENIS</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
            <p><strong>IP:</strong> ${req.headers['x-forwarded-for'] || req.connection.remoteAddress}</p>
          </div>
        </div>
      `,
      // También enviar versión texto plano
      text: `
Nueva Consulta - CETENIS

Datos del Cliente:
- Nombre: ${name}
- Empresa: ${company}
- Email: ${email}
- Teléfono: ${phone || 'No proporcionado'}

Mensaje:
${message}

---
Enviado desde el formulario web de CETENIS
Fecha: ${new Date().toLocaleString('es-ES')}
      `.trim()
    };

    // Enviar el email
    await transporter.sendMail(mailOptions);

    // Respuesta exitosa
    res.status(200).json({
      success: true,
      message: 'Email enviado correctamente'
    });

  } catch (error) {
    console.error('Error enviando email:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
} 