const RepositorioBase = require('./RepositorioBase');

/**
 * Repositorio para operaciones relacionadas con usuarios
 */
class RepositorioUsuario extends RepositorioBase {
    /**
     * Busca un usuario por email
     */
    async obtenerPorCorreo(correo) {
        return this.obtenerUno('SELECT * FROM usuarios WHERE usuario = ?', [correo]);
    }

    /**
     * Busca un usuario por ID
     */
    async obtenerPorId(id) {
        return this.obtenerUno('SELECT * FROM usuarios WHERE id = ?', [id]);
    }

    /**
     * Actualiza la contraseña de un usuario
     */
    async actualizarContrasena(correo, hash) {
        return this.ejecutar('UPDATE usuarios SET clave_hash = ? WHERE usuario = ?', [hash, correo]);
    }

    /**
     * Crea un nuevo usuario
     */
    async crear(correo, hash) {
        return this.ejecutar('INSERT INTO usuarios (usuario, clave_hash) VALUES (?, ?)', [correo, hash]);
    }
}

module.exports = RepositorioUsuario;
