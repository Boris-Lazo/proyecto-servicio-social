const RepositorioBase = require('./RepositorioBase');

/**
 * Repositorio para operaciones relacionadas con usuarios
 */
class RepositorioUsuario extends RepositorioBase {
    /**
     * Busca un usuario por email
     */
    async obtenerPorCorreo(correo) {
        return this.obtenerUno('SELECT * FROM users WHERE user = ?', [correo]);
    }

    /**
     * Busca un usuario por ID
     */
    async obtenerPorId(id) {
        return this.obtenerUno('SELECT * FROM users WHERE id = ?', [id]);
    }

    /**
     * Actualiza la contraseña de un usuario
     */
    async actualizarContrasena(correo, hash) {
        return this.ejecutar('UPDATE users SET hash = ? WHERE user = ?', [hash, correo]);
    }

    /**
     * Crea un nuevo usuario
     */
    async crear(correo, hash) {
        return this.ejecutar('INSERT INTO users (user, hash) VALUES (?, ?)', [correo, hash]);
    }
}

module.exports = RepositorioUsuario;
