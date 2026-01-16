const BaseRepository = require('./BaseRepository');

/**
 * Repositorio para operaciones de tokens de recuperación de contraseña
 */
class PasswordResetRepository extends BaseRepository {
    /**
     * Crea un token de recuperación
     * @param {string} email - Email del usuario
     * @param {string} token - Token de recuperación
     * @param {number} expiresAt - Timestamp de expiración
     * @returns {Promise<Object>} Resultado de la inserción
     */
    async create(email, token, expiresAt) {
        return this.run(
            'INSERT INTO password_resets (user_email, token, expires_at) VALUES (?, ?, ?)',
            [email, token, expiresAt]
        );
    }

    /**
     * Busca un token de recuperación
     * @param {string} token - Token a buscar
     * @returns {Promise<Object|null>} Token encontrado o null
     */
    async findByToken(token) {
        return this.get('SELECT * FROM password_resets WHERE token = ?', [token]);
    }

    /**
     * Elimina un token de recuperación
     * @param {string} token - Token a eliminar
     * @returns {Promise<Object>} Resultado de la eliminación
     */
    async deleteByToken(token) {
        return this.run('DELETE FROM password_resets WHERE token = ?', [token]);
    }

    /**
     * Elimina tokens expirados (limpieza)
     * @returns {Promise<Object>} Resultado de la eliminación
     */
    async deleteExpired() {
        return this.run('DELETE FROM password_resets WHERE expires_at < ?', [Date.now()]);
    }
}

module.exports = PasswordResetRepository;
