const BaseRepository = require('./BaseRepository');

/**
 * Repositorio para operaciones relacionadas con usuarios
 */
class UserRepository extends BaseRepository {
    /**
     * Busca un usuario por email
     * @param {string} email - Email del usuario
     * @returns {Promise<Object|null>} Usuario encontrado o null
     */
    async findByEmail(email) {
        return this.get('SELECT * FROM users WHERE user = ?', [email]);
    }

    /**
     * Busca un usuario por ID
     * @param {number} id - ID del usuario
     * @returns {Promise<Object|null>} Usuario encontrado o null
     */
    async findById(id) {
        return this.get('SELECT * FROM users WHERE id = ?', [id]);
    }

    /**
     * Actualiza la contraseña de un usuario
     * @param {string} email - Email del usuario
     * @param {string} hash - Hash de la nueva contraseña
     * @returns {Promise<Object>} Resultado de la actualización
     */
    async updatePassword(email, hash) {
        return this.run('UPDATE users SET hash = ? WHERE user = ?', [hash, email]);
    }

    /**
     * Crea un nuevo usuario
     * @param {string} email - Email del usuario
     * @param {string} hash - Hash de la contraseña
     * @returns {Promise<Object>} Resultado de la inserción
     */
    async create(email, hash) {
        return this.run('INSERT INTO users (user, hash) VALUES (?, ?)', [email, hash]);
    }
}

module.exports = UserRepository;
