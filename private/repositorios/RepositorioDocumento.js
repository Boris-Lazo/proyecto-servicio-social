const RepositorioBase = require('./RepositorioBase');

/**
 * Repositorio para operaciones relacionadas con documentos
 */
class RepositorioDocumento extends RepositorioBase {
    /**
     * Crea un nuevo documento
     */
    async crear(doc) {
        return this.ejecutar('INSERT INTO documentos (titulo, mes, nombre_archivo) VALUES (?, ?, ?)', [
            doc.titulo,
            doc.mes,
            doc.nombre_archivo,
        ]);
    }

    /**
     * Obtiene todos los documentos ordenados por mes descendente
     */
    async obtenerTodos() {
        return super.obtenerTodos('SELECT * FROM documentos ORDER BY mes DESC', []);
    }

    /**
     * Busca un documento por ID
     */
    async obtenerPorId(id) {
        return this.obtenerUno('SELECT * FROM documentos WHERE id = ?', [id]);
    }

    /**
     * Elimina un documento por ID
     */
    async eliminarPorId(id) {
        return this.ejecutar('DELETE FROM documentos WHERE id = ?', [id]);
    }
}

module.exports = RepositorioDocumento;
