const RepositorioBase = require('./RepositorioBase');

/**
 * Repositorio para operaciones de tokens de recuperación de contraseña
 */
class RepositorioRestablecimientoClave extends RepositorioBase {
    /**
     * Crea un token de recuperación
     */
    async crear(correo, token, expiraEn) {
        return this.ejecutar(
            'INSERT INTO password_resets (user_email, token, expires_at) VALUES (?, ?, ?)',
            [correo, token, expiraEn]
        );
    }

    /**
     * Busca un token de recuperación
     */
    async obtenerPorToken(token) {
        return this.obtenerUno('SELECT * FROM password_resets WHERE token = ?', [token]);
    }

    /**
     * Elimina un token de recuperación
     */
    async eliminarPorToken(token) {
        return this.ejecutar('DELETE FROM password_resets WHERE token = ?', [token]);
    }

    /**
     * Elimina tokens expirados (limpieza)
     */
    async eliminarExpirados() {
        return this.ejecutar('DELETE FROM password_resets WHERE expires_at < ?', [Date.now()]);
    }
}

module.exports = RepositorioRestablecimientoClave;
