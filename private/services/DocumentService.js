const { NotFoundError, ValidationError } = require('../errors');
const fs = require('fs').promises;
const path = require('path');

/**
 * Servicio de documentos
 */
class DocumentService {
    /**
     * @param {DocumentRepository} documentRepository
     * @param {StorageService} storageService
     * @param {Object} config - appConfig
     */
    constructor(documentRepository, storageService, config) {
        this.documentRepository = documentRepository;
        this.storageService = storageService;
        this.config = config;
    }

    /**
     * Crea un nuevo documento
     */
    async createDocument(data, file) {
        const { titulo, mes } = data;

        if (!titulo || !mes) {
            if (file) this.storageService.cleanupTempFiles([file]);
            throw new ValidationError('Faltan título o mes');
        }

        if (!file) {
            throw new ValidationError('No se envió archivo');
        }

        const doc = { titulo, mes, filename: file.filename };
        await this.documentRepository.create(doc);

        this.generateThumbnail(file.filename).catch(err => {
            console.error(`Error generando thumbnail para ${file.filename}:`, err);
        });

        return { filename: file.filename };
    }

    /**
     * Lista todos los documentos
     */
    async listDocuments() {
        return this.documentRepository.findAll();
    }

    /**
     * Elimina un documento y su archivo
     */
    async deleteDocument(id) {
        const doc = await this.documentRepository.findById(id);
        if (!doc) throw new NotFoundError('Documento no encontrado');

        this.storageService.deleteDocument(doc.filename);

        try {
            const thumbnailPath = path.join(this.config.paths.thumbnails, `${doc.filename}.png`);
            await fs.unlink(thumbnailPath);
        } catch (err) {}

        await this.documentRepository.deleteById(id);
    }

    /**
     * Genera thumbnail de un PDF
     */
    async generateThumbnail(filename) {
        const pdfPath = path.join(this.config.paths.docs, filename);
        const thumbnailPath = path.join(this.config.paths.thumbnails, `${filename}.png`);

        try {
            const { pdf } = await import('pdf-to-img');
            const document = await pdf(pdfPath, { scale: 2.0 });
            const firstPage = await document.getPage(1);
            await fs.writeFile(thumbnailPath, firstPage);
        } catch (err) {
            console.error(`Error generando thumbnail para ${filename}:`, err);
            throw err;
        }
    }

    /**
     * Obtiene el thumbnail de un documento
     */
    async getThumbnail(filename) {
        const thumbnailPath = path.join(this.config.paths.thumbnails, `${filename}.png`);

        try {
            await fs.access(thumbnailPath);
            return thumbnailPath;
        } catch (err) {
            await this.generateThumbnail(filename);
            return thumbnailPath;
        }
    }
}

module.exports = DocumentService;
