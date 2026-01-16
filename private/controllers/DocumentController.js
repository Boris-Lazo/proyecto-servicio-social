const DocumentService = require('../services/DocumentService');

/**
 * Controlador de documentos
 * Maneja peticiones HTTP relacionadas con documentos PDF
 */
class DocumentController {
    /**
     * Crear un nuevo documento
     * @route POST /api/docs
     */
    async createDocument(req, res, next) {
        try {
            const { titulo, mes } = req.body;
            const file = req.file;

            const result = await DocumentService.createDocument({ titulo, mes }, file);

            res.json({ ok: true, ...result });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Listar todos los documentos
     * @route GET /api/docs
     */
    async listDocuments(req, res, next) {
        try {
            const documents = await DocumentService.listDocuments();
            res.json(documents);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Eliminar un documento
     * @route DELETE /api/docs/:id
     */
    async deleteDocument(req, res, next) {
        try {
            const { id } = req.params;

            await DocumentService.deleteDocument(parseInt(id, 10));

            res.json({ ok: true, message: 'Documento eliminado' });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Obtener thumbnail de un documento
     * @route GET /api/docs/thumbnail/:filename
     */
    async getThumbnail(req, res, next) {
        try {
            const { filename } = req.params;

            const thumbnailPath = await DocumentService.getThumbnail(filename);

            res.sendFile(thumbnailPath);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new DocumentController();
