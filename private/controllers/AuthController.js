const AuthService = require('../services/AuthService');

/**
 * Controlador de autenticación
 * Maneja peticiones HTTP relacionadas con autenticación
 */
class AuthController {
    /**
     * Login de usuario
     * @route POST /api/login
     */
    async login(req, res, next) {
        try {
            const { user, password } = req.body;

            console.log('[LOGIN] Intento de login para:', user);

            const token = await AuthService.login(user, password);

            console.log('[LOGIN] Login exitoso para:', user);
            res.json({ token });
        } catch (error) {
            console.error('[LOGIN] Error:', error.message);
            next(error);
        }
    }

    /**
     * Cambio de contraseña (usuario autenticado)
     * @route POST /api/change-password
     */
    async changePassword(req, res, next) {
        try {
            const { oldPass, newPass } = req.body;
            const email = req.user; // Viene del middleware auth

            await AuthService.changePassword(email, oldPass, newPass);

            res.json({ ok: true, msg: 'Contraseña cambiada' });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Solicitud de recuperación de contraseña
     * @route POST /api/recover
     */
    async recover(req, res, next) {
        try {
            const { email } = req.body;

            await AuthService.requestPasswordReset(email);

            // Respuesta genérica por seguridad
            res.json({
                ok: true,
                msg: 'Si el correo existe, se enviará un enlace.',
            });
        } catch (error) {
            console.error('[RECOVER] Error:', error);
            next(error);
        }
    }

    /**
     * Reset de contraseña con token
     * @route POST /api/recover/change
     */
    async resetPassword(req, res, next) {
        try {
            const { tempToken, newPass } = req.body;

            await AuthService.resetPassword(tempToken, newPass);

            res.json({ ok: true, msg: 'Contraseña actualizada' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AuthController();
