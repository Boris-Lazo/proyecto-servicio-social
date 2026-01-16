const BaseRepository = require('./BaseRepository');

/**
 * Repositorio para operaciones relacionadas con documentos
 */
class DocumentRepository extends BaseRepository {
    /**
     * Crea un nuevo documento
     * @param {Object} doc - Datos del documento
     * @param {string} doc.titulo - Título del documento
     * @param {string} doc.mes - Mes del documento
     * @param {string} doc.filename - Nombre del archivo
     * @returns {Promise<Object>} Resultado de la inserción
     */
    async create(doc) {
        return this.run('INSERT INTO docs (titulo, mes, filename) VALUES (?, ?, ?)', [
            doc.titulo,
            doc.mes,
            doc.filename,
        ]);
    }

    /**
     * Obtiene todos los documentos ordenados por mes descendente
     * @returns {Promise<Array>} Array de documentos
     */
    async findAll() {
        return this.all('SELECT * FROM docs ORDER BY mes DESC', []);
    }

    /**
     * Busca un documento por ID
     * @param {number} id - ID del documento
     * @returns {Promise<Object|null>} Documento encontrado o null
     */
    async findById(id) {
        return this.get('SELECT * FROM docs WHERE id = ?', [id]);
    }

    /**
     * Elimina un documento por ID
     * @param {number} id - ID del documento
     * @returns {Promise<Object>} Resultado de la eliminación
     */
    async deleteById(id) {
        return this.run('DELETE FROM docs WHERE id = ?', [id]);
    }
}

module.exports = DocumentRepository;
