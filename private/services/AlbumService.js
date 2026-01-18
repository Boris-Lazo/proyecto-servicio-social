const { NotFoundError, ValidationError, AppError } = require('../errors');

/**
 * Servicio de álbumes
 */
class AlbumService {
    /**
     * @param {AlbumRepository} albumRepository
     * @param {StorageService} storageService
     */
    constructor(albumRepository, storageService) {
        this.albumRepository = albumRepository;
        this.storageService = storageService;
    }

    /**
     * Crea un nuevo álbum con fotos
     */
    async createAlbum(data, files) {
        const { titulo, fecha, descripcion = '' } = data;

        if (!titulo || !fecha) {
            this.storageService.cleanupTempFiles(files);
            throw new ValidationError('Faltan título o fecha');
        }

        const slug = titulo
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        const folderName = `${fecha} - ${slug}`;

        let targetFolder = null;

        try {
            targetFolder = this.storageService.createAlbumFolder(folderName);
            const savedFiles = this.storageService.saveAlbumFiles(files, folderName);

            const album = {
                id: folderName,
                titulo,
                fecha,
                descripcion,
                fotos: savedFiles,
            };

            await this.albumRepository.create(album);
            return album;
        } catch (error) {
            this.storageService.cleanupTempFiles(files);
            if (targetFolder) {
                this.storageService.deleteFolder(targetFolder);
            }

            if (error.isOperational) throw error;
            throw new AppError('Error al crear el álbum', 500, false);
        }
    }

    /**
     * Lista todos los álbumes
     */
    async listAlbums() {
        return this.albumRepository.findAll();
    }

    /**
     * Elimina un álbum y sus archivos
     */
    async deleteAlbum(id) {
        const album = await this.albumRepository.findById(id);
        if (!album) {
            throw new NotFoundError('Álbum no encontrado');
        }

        this.storageService.deleteAlbum(id);
        await this.albumRepository.deleteById(id);
    }
}

module.exports = AlbumService;
