const BaseRepository = require('./BaseRepository');

/**
 * Repositorio para operaciones relacionadas con álbumes
 */
class AlbumRepository extends BaseRepository {
    /**
     * Crea un nuevo álbum
     * @param {Object} album - Datos del álbum
     * @param {string} album.id - ID del álbum
     * @param {string} album.titulo - Título del álbum
     * @param {string} album.fecha - Fecha del álbum
     * @param {string} album.descripcion - Descripción del álbum
     * @param {Array<string>} album.fotos - Array de nombres de archivos
     * @returns {Promise<Object>} Resultado de la inserción
     */
    async create(album) {
        return this.run(
            'INSERT INTO albums (id, titulo, fecha, descripcion, fotos) VALUES (?, ?, ?, ?, ?)',
            [album.id, album.titulo, album.fecha, album.descripcion, JSON.stringify(album.fotos)]
        );
    }

    /**
     * Obtiene todos los álbumes ordenados por fecha descendente
     * @returns {Promise<Array>} Array de álbumes
     */
    async findAll() {
        const albums = await this.all('SELECT * FROM albums ORDER BY fecha DESC', []);
        // Parsear el JSON de fotos
        return albums.map((album) => ({
            ...album,
            fotos: album.fotos ? JSON.parse(album.fotos) : [],
        }));
    }

    /**
     * Busca un álbum por ID
     * @param {string} id - ID del álbum
     * @returns {Promise<Object|null>} Álbum encontrado o null
     */
    async findById(id) {
        const album = await this.get('SELECT * FROM albums WHERE id = ?', [id]);
        if (album && album.fotos) {
            album.fotos = JSON.parse(album.fotos);
        }
        return album;
    }

    /**
     * Elimina un álbum por ID
     * @param {string} id - ID del álbum
     * @returns {Promise<Object>} Resultado de la eliminación
     */
    async deleteById(id) {
        return this.run('DELETE FROM albums WHERE id = ?', [id]);
    }
}

module.exports = AlbumRepository;
