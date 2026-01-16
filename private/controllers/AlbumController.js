const AlbumService = require('../services/AlbumService');

/**
 * Controlador de álbumes
 * Maneja peticiones HTTP relacionadas con álbumes de fotos
 */
class AlbumController {
    /**
     * Crear un nuevo álbum
     * @route POST /api/albums
     */
    async createAlbum(req, res, next) {
        try {
            const { titulo, fecha, descripcion } = req.body;
            const files = req.files;

            const album = await AlbumService.createAlbum(
                { titulo, fecha, descripcion },
                files
            );

            res.status(201).json({ ok: true, album });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Listar todos los álbumes
     * @route GET /api/albums
     */
    async listAlbums(req, res, next) {
        try {
            const albums = await AlbumService.listAlbums();
            res.json(albums);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Eliminar un álbum
     * @route DELETE /api/albums/:id
     */
    async deleteAlbum(req, res, next) {
        try {
            const { id } = req.params;

            await AlbumService.deleteAlbum(id);

            res.json({ ok: true, message: 'Álbum eliminado' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AlbumController();
