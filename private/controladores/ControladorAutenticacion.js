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
    async iniciarSesion(peticion, respuesta, siguiente) {
        try {
            const { usuario, contrasena } = peticion.body;
            console.log('[LOGIN] Intento de login para:', usuario);
            const token = await this.servicioAutenticacion.iniciarSesion(usuario, contrasena);
            respuesta.json({ token });
        } catch (error) {
            siguiente(error);
        }
    }

    /**
     * Cambio de contraseña
     */
    async cambiarContrasena(peticion, respuesta, siguiente) {
        try {
            const { viejaClave, nuevaClave } = peticion.body;
            const correo = peticion.correo;
            await this.servicioAutenticacion.cambiarContrasena(correo, viejaClave, nuevaClave);
            respuesta.json({ ok: true, mensaje: 'Contraseña cambiada' });
        } catch (error) {
            siguiente(error);
        }
    }

    /**
     * Solicitud de recuperación
     */
    async recuperar(peticion, respuesta, siguiente) {
        try {
            const { correo } = peticion.body;
            await this.servicioAutenticacion.solicitarRestablecimiento(correo);
            respuesta.json({ ok: true, mensaje: 'Si el correo existe, se enviará un enlace.' });
        } catch (error) {
            siguiente(error);
        }
    }

    /**
     * Reset de contraseña
     */
    async restablecerContrasena(peticion, respuesta, siguiente) {
        try {
            const { tokenTemporal, nuevaClave } = peticion.body;
            await this.servicioAutenticacion.restablecerContrasena(tokenTemporal, nuevaClave);
            respuesta.json({ ok: true, mensaje: 'Contraseña actualizada' });
        } catch (error) {
            siguiente(error);
        }
    }
}

module.exports = ControladorAutenticacion;
