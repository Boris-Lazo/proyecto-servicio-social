const nodemailer = require('nodemailer');

/**
 * Servicio de correo electrónico
 */
class ServicioCorreo {
    /**
     * @param {Object} configuracion - Configuración SMTP de configuracionApp
     */
    constructor(configuracion) {
        this.configuracion = configuracion;
        this.transportador = nodemailer.createTransport({
            host: configuracion.host,
            port: configuracion.puerto,
            secure: configuracion.puerto === 465,
            auth: {
                user: configuracion.usuario,
                pass: configuracion.clave,
            },
        });
    }

    /**
     * Envía un correo de recuperación de contraseña
     */
    async enviarCodigoRecuperacion(correo, token) {
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

        const info = await this.transportador.sendMail({
            from: `"Centro Escolar" <${this.configuracion.desde}>`,
            to: correo,
            subject: `Código de recuperación: ${token}`,
            html: html,
        });

        return info;
    }

    /**
     * Método genérico para enviar correos
     */
    async enviarCorreo(opciones) {
        return this.transportador.sendMail({
            from: `"Centro Escolar" <${this.configuracion.desde}>`,
            ...opciones,
        });
    }
}

module.exports = ServicioCorreo;
