/**
 * Controlador de álbumes
 */
class AlbumController {
    /**
     * @param {AlbumService} albumService
     */
    constructor(albumService) {
        this.albumService = albumService;
    }

    /**
     * Crear un nuevo álbum
     */
    async createAlbum(req, res, next) {
        try {
            const { titulo, fecha, descripcion } = req.body;
            const files = req.files;
            const album = await this.albumService.createAlbum({ titulo, fecha, descripcion }, files);
            res.status(201).json({ ok: true, album });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Listar todos los álbumes
     */
    async listAlbums(req, res, next) {
        try {
            const albums = await this.albumService.listAlbums();
            res.json(albums);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Eliminar un álbum
     */
    async deleteAlbum(req, res, next) {
        try {
            const { id } = req.params;
            await this.albumService.deleteAlbum(id);
            res.json({ ok: true, message: 'Álbum eliminado' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = AlbumController;
