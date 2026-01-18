/**
 * Controlador de autenticación
 */
class AuthController {
    /**
     * @param {AuthService} authService
     */
    constructor(authService) {
        this.authService = authService;
    }

    /**
     * Login de usuario
     */
    async login(req, res, next) {
        try {
            const { user, password } = req.body;
            console.log('[LOGIN] Intento de login para:', user);
            const token = await this.authService.login(user, password);
            res.json({ token });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Cambio de contraseña
     */
    async changePassword(req, res, next) {
        try {
            const { oldPass, newPass } = req.body;
            const email = req.user;
            await this.authService.changePassword(email, oldPass, newPass);
            res.json({ ok: true, msg: 'Contraseña cambiada' });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Solicitud de recuperación
     */
    async recover(req, res, next) {
        try {
            const { email } = req.body;
            await this.authService.requestPasswordReset(email);
            res.json({ ok: true, msg: 'Si el correo existe, se enviará un enlace.' });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Reset de contraseña
     */
    async resetPassword(req, res, next) {
        try {
            const { tempToken, newPass } = req.body;
            await this.authService.resetPassword(tempToken, newPass);
            res.json({ ok: true, msg: 'Contraseña actualizada' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = AuthController;
