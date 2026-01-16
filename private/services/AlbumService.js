const AlbumRepository = require('../repositories/AlbumRepository');
const StorageService = require('./external/StorageService');
const { NotFoundError, ValidationError, AppError } = require('../errors');

/**
 * Servicio de álbumes
 * Maneja toda la lógica de negocio relacionada con álbumes de fotos
 */
class AlbumService {
    constructor() {
        this.albumRepository = new AlbumRepository();
    }

    /**
     * Crea un nuevo álbum con fotos
     * @param {Object} data - Datos del álbum
     * @param {string} data.titulo - Título del álbum
     * @param {string} data.fecha - Fecha del álbum
     * @param {string} data.descripcion - Descripción del álbum
     * @param {Array} files - Archivos de multer
     * @returns {Promise<Object>} Álbum creado
     * @throws {ValidationError} Si faltan datos requeridos
     */
    async createAlbum(data, files) {
        const { titulo, fecha, descripcion = '' } = data;

        // Validar datos requeridos
        if (!titulo || !fecha) {
            // Limpiar archivos temporales
            StorageService.cleanupTempFiles(files);
            throw new ValidationError('Faltan título o fecha');
        }

        // Generar slug y nombre de carpeta
        const slug = titulo
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        const folderName = `${fecha} - ${slug}`;

        let targetFolder = null;

        try {
            // Crear carpeta de álbum
            targetFolder = StorageService.createAlbumFolder(folderName);

            // Mover archivos a la carpeta
            const savedFiles = StorageService.saveAlbumFiles(files, folderName);

            // Preparar objeto de álbum
            const album = {
                id: folderName,
                titulo,
                fecha,
                descripcion,
                fotos: savedFiles,
            };

            // Guardar en BD
            await this.albumRepository.create(album);

            return album;
        } catch (error) {
            // Rollback: limpiar archivos temporales y carpeta creada si falla
            StorageService.cleanupTempFiles(files);
            if (targetFolder) {
                StorageService.deleteFolder(targetFolder);
            }

            // Re-lanzar error
            if (error.isOperational) {
                throw error;
            } else {
                throw new AppError('Error al crear el álbum', 500, false);
            }
        }
    }

    /**
     * Lista todos los álbumes
     * @returns {Promise<Array>} Array de álbumes
     */
    async listAlbums() {
        return this.albumRepository.findAll();
    }

    /**
     * Elimina un álbum y sus archivos
     * @param {string} id - ID del álbum
     * @returns {Promise<void>}
     * @throws {NotFoundError} Si el álbum no existe
     */
    async deleteAlbum(id) {
        // Verificar que el álbum existe
        const album = await this.albumRepository.findById(id);
        if (!album) {
            throw new NotFoundError('Álbum no encontrado');
        }

        // Eliminar archivos del álbum
        StorageService.deleteAlbum(id);

        // Eliminar de BD
        await this.albumRepository.deleteById(id);
    }
}

module.exports = new AlbumService();
