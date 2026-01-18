/**
 * Controlador de documentos
 */
class DocumentController {
    /**
     * @param {DocumentService} documentService
     */
    constructor(documentService) {
        this.documentService = documentService;
    }

    /**
     * Crear un nuevo documento
     */
    async createDocument(req, res, next) {
        try {
            const { titulo, mes } = req.body;
            const file = req.file;
            const result = await this.documentService.createDocument({ titulo, mes }, file);
            res.json({ ok: true, ...result });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Listar todos los documentos
     */
    async listDocuments(req, res, next) {
        try {
            const documents = await this.documentService.listDocuments();
            res.json(documents);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Eliminar un documento
     */
    async deleteDocument(req, res, next) {
        try {
            const { id } = req.params;
            await this.documentService.deleteDocument(parseInt(id, 10));
            res.json({ ok: true, message: 'Documento eliminado' });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Obtener thumbnail de un documento
     */
    async getThumbnail(req, res, next) {
        try {
            const { filename } = req.params;
            const thumbnailPath = await this.documentService.getThumbnail(filename);
            res.sendFile(thumbnailPath);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = DocumentController;
