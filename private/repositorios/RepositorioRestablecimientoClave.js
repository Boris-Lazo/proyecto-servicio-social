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
            'INSERT INTO restablecimientos_clave (correo_usuario, token, expira_el) VALUES (?, ?, ?)',
            [correo, token, expiraEn]
        );
    }

    /**
     * Busca un token de recuperación
     */
    async obtenerPorToken(token) {
        return this.obtenerUno('SELECT * FROM restablecimientos_clave WHERE token = ?', [token]);
    }

    /**
     * Elimina un token de recuperación
     */
    async eliminarPorToken(token) {
        return this.ejecutar('DELETE FROM restablecimientos_clave WHERE token = ?', [token]);
    }

    /**
     * Elimina tokens expirados (limpieza)
     */
    async eliminarExpirados() {
        return this.ejecutar('DELETE FROM restablecimientos_clave WHERE expira_el < ?', [Date.now()]);
    }
}

module.exports = RepositorioRestablecimientoClave;
