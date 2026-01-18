const RepositorioBase = require('./RepositorioBase');

/**
 * Repositorio para operaciones relacionadas con documentos
 */
class RepositorioDocumento extends RepositorioBase {
    /**
     * Crea un nuevo documento
     */
    async crear(doc) {
        return this.ejecutar('INSERT INTO docs (titulo, mes, filename) VALUES (?, ?, ?)', [
            doc.titulo,
            doc.mes,
            doc.filename,
        ]);
    }

    /**
     * Obtiene todos los documentos ordenados por mes descendente
     */
    async obtenerTodos() {
        return super.obtenerTodos('SELECT * FROM docs ORDER BY mes DESC', []);
    }

    /**
     * Busca un documento por ID
     */
    async obtenerPorId(id) {
        return this.obtenerUno('SELECT * FROM docs WHERE id = ?', [id]);
    }

    /**
     * Elimina un documento por ID
     */
    async eliminarPorId(id) {
        return this.ejecutar('DELETE FROM docs WHERE id = ?', [id]);
    }
}

module.exports = RepositorioDocumento;
