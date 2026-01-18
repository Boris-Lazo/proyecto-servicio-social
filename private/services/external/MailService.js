const nodemailer = require('nodemailer');

/**
 * Servicio de correo electrónico
 */
class MailService {
    /**
     * @param {Object} config - Configuración SMTP de appConfig
     */
    constructor(config) {
        this.config = config;
        this.transporter = nodemailer.createTransport({
            host: config.host,
            port: config.port,
            secure: config.port === 465,
            auth: {
                user: config.user,
                pass: config.pass,
            },
        });
    }

    /**
     * Envía un correo de recuperación de contraseña
     * @param {string} email - Email del destinatario
     * @param {string} token - Código de verificación
     * @returns {Promise<Object>}
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
            from: `"Centro Escolar" <${this.config.from}>`,
            to: email,
            subject: `Código de recuperación: ${token}`,
            html: html,
        });

        return info;
    }

    /**
     * Método genérico para enviar correos
     */
    async sendMail(options) {
        return this.transporter.sendMail({
            from: `"Centro Escolar" <${this.config.from}>`,
            ...options,
        });
    }
}

module.exports = MailService;
