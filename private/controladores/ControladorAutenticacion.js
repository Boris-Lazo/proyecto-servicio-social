/**
 * Controlador de autenticación
 */
class ControladorAutenticacion {
    /**
     * @param {ServicioAutenticacion} servicioAutenticacion
     */
    constructor(servicioAutenticacion) {
        this.servicioAutenticacion = servicioAutenticacion;
    }

    /**
     * Login de usuario
     */
    async iniciarSesion(req, res, next) {
        try {
            const { usuario, contrasena } = req.body;
            console.log('[LOGIN] Intento de login para:', usuario);
            const token = await this.servicioAutenticacion.iniciarSesion(usuario, contrasena);
            res.json({ token });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Cambio de contraseña
     */
    async cambiarContrasena(req, res, next) {
        try {
            const { viejaClave, nuevaClave } = req.body;
            const correo = req.user;
            await this.servicioAutenticacion.cambiarContrasena(correo, viejaClave, nuevaClave);
            res.json({ ok: true, mensaje: 'Contraseña cambiada' });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Solicitud de recuperación
     */
    async recuperar(req, res, next) {
        try {
            const { correo } = req.body;
            await this.servicioAutenticacion.solicitarRestablecimiento(correo);
            res.json({ ok: true, mensaje: 'Si el correo existe, se enviará un enlace.' });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Reset de contraseña
     */
    async restablecerContrasena(req, res, next) {
        try {
            const { tokenTemporal, nuevaClave } = req.body;
            await this.servicioAutenticacion.restablecerContrasena(tokenTemporal, nuevaClave);
            res.json({ ok: true, mensaje: 'Contraseña actualizada' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = ControladorAutenticacion;
