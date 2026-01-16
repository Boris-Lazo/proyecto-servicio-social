const DocumentRepository = require('../repositories/DocumentRepository');
const StorageService = require('./external/StorageService');
const { NotFoundError, ValidationError } = require('../errors');
const fs = require('fs').promises;
const path = require('path');

/**
 * Servicio de documentos
 * Maneja toda la lógica de negocio relacionada con documentos PDF
 */
class DocumentService {
    constructor() {
        this.documentRepository = new DocumentRepository();
        this.thumbnailsDir = path.join(__dirname, '..', 'upload', 'thumbnails');
        this.docsDir = path.join(__dirname, '..', 'upload', 'docs');
    }

    /**
     * Crea un nuevo documento
     * @param {Object} data - Datos del documento
     * @param {string} data.titulo - Título del documento
     * @param {string} data.mes - Mes del documento
     * @param {Object} file - Archivo de multer
     * @returns {Promise<Object>} Documento creado
     * @throws {ValidationError} Si faltan datos o archivo
     */
    async createDocument(data, file) {
        const { titulo, mes } = data;

        // Validar datos requeridos
        if (!titulo || !mes) {
            // Limpiar archivo si se subió
            if (file) {
                StorageService.cleanupTempFiles([file]);
            }
            throw new ValidationError('Faltan título o mes');
        }

        if (!file) {
            throw new ValidationError('No se envió archivo');
        }

        // Preparar objeto de documento
        const doc = {
            titulo,
            mes,
            filename: file.filename,
        };

        // Guardar en BD
        await this.documentRepository.create(doc);

        // Generar thumbnail en segundo plano (no bloquear respuesta)
        this.generateThumbnail(file.filename).catch(err => {
            console.error(`Error generando thumbnail para ${file.filename}:`, err);
        });

        return { filename: file.filename };
    }

    /**
     * Lista todos los documentos
     * @returns {Promise<Array>} Array de documentos
     */
    async listDocuments() {
        return this.documentRepository.findAll();
    }

    /**
     * Elimina un documento y su archivo
     * @param {number} id - ID del documento
     * @returns {Promise<void>}
     * @throws {NotFoundError} Si el documento no existe
     */
    async deleteDocument(id) {
        // Verificar que el documento existe
        const doc = await this.documentRepository.findById(id);
        if (!doc) {
            throw new NotFoundError('Documento no encontrado');
        }

        // Eliminar archivo PDF
        StorageService.deleteDocument(doc.filename);

        // Eliminar thumbnail si existe
        try {
            const thumbnailPath = path.join(this.thumbnailsDir, `${doc.filename}.png`);
            await fs.unlink(thumbnailPath);
        } catch (err) {
            // Ignorar si no existe
        }

        // Eliminar de BD
        await this.documentRepository.deleteById(id);
    }

    /**
     * Genera thumbnail de un PDF
     * @param {string} filename - Nombre del archivo PDF
     * @returns {Promise<void>}
     */
    async generateThumbnail(filename) {
        const pdfPath = path.join(this.docsDir, filename);
        const thumbnailPath = path.join(this.thumbnailsDir, `${filename}.png`);

        try {
            // Dynamic import for ESM module
            const { pdf } = await import('pdf-to-img');

            // Generar thumbnail de la primera página
            const document = await pdf(pdfPath, { scale: 2.0 });

            // Obtener solo la primera página
            const firstPage = await document.getPage(1);

            // Guardar como PNG
            await fs.writeFile(thumbnailPath, firstPage);
        } catch (err) {
            console.error(`Error generando thumbnail para ${filename}:`, err);
            throw err;
        }
    }

    /**
     * Obtiene el thumbnail de un documento
     * @param {string} filename - Nombre del archivo PDF
     * @returns {Promise<string>} Ruta absoluta del thumbnail
     * @throws {NotFoundError} Si el thumbnail no existe
     */
    async getThumbnail(filename) {
        const thumbnailPath = path.join(this.thumbnailsDir, `${filename}.png`);

        // Verificar si el thumbnail ya existe
        try {
            await fs.access(thumbnailPath);
            return thumbnailPath;
        } catch (err) {
            // Si no existe, generarlo ahora
            await this.generateThumbnail(filename);
            return thumbnailPath;
        }
    }
}

module.exports = new DocumentService();
