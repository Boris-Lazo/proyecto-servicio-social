const nodemailer = require('nodemailer');

/**
 * Servicio de correo electrónico
 * Abstrae nodemailer para facilitar cambio de proveedor
 */
class MailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.ethereal.email',
            port: process.env.SMTP_PORT || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    /**
     * Envía un correo de recuperación de contraseña
     * @param {string} email - Email del destinatario
     * @param {string} token - Código de verificación
     * @returns {Promise<Object>} Información del correo enviado
     */
    async sendRecoveryCode(email, token) {
        const html = `
      <div style="font-family: sans-serif; text-align: center; color: #333;">
        <h1>Código de Recuperación</h1>
        <p>Has solicitado restablecer tu contraseña.</p>
        <p>Tu código de verificación es:</p>
        <div style="background: #f0f8ff; padding: 20px; margin: 20px auto; border-radius: 8px; display: inline-block;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #0056b3;">${token}</span>
        </div>
        <p>Este código expira en 15 minutos.</p>
        <small>Si no solicitaste este cambio, ignora este correo.</small>
      </div>
    `;

        const info = await this.transporter.sendMail({
            from: `"Centro Escolar" <${process.env.SMTP_FROM}>`,
            to: email,
            subject: `Código de recuperación: ${token}`,
            html: html,
        });

        console.log('Message sent: %s', info.messageId);

        // Preview only available when sending through an Ethereal account
        if (nodemailer.getTestMessageUrl(info)) {
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        }

        return info;
    }

    /**
     * Método genérico para enviar correos
     * @param {Object} options - Opciones de correo
     * @param {string} options.to - Destinatario
     * @param {string} options.subject - Asunto
     * @param {string} options.html - Contenido HTML
     * @returns {Promise<Object>} Información del correo enviado
     */
    async sendMail(options) {
        return this.transporter.sendMail({
            from: `"Centro Escolar" <${process.env.SMTP_FROM}>`,
            ...options,
        });
    }
}

module.exports = new MailService();
