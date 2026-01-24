const RepositorioBase = require('./RepositorioBase');

/**
 * Repositorio para operaciones relacionadas con álbumes
 */
class RepositorioAlbum extends RepositorioBase {
    /**
     * Crea un nuevo álbum
     * @param {Object} album - Datos del álbum
     */
    async crear(album) {
        return this.ejecutar(
            'INSERT INTO albumes (id, titulo, fecha, descripcion, fotos) VALUES (?, ?, ?, ?, ?)',
            [album.id, album.titulo, album.fecha, album.descripcion, JSON.stringify(album.fotos)]
        );
    }

    /**
     * Obtiene todos los álbumes ordenados por fecha descendente
     */
    async obtenerTodos() {
        const albumes = await super.obtenerTodos('SELECT * FROM albumes ORDER BY fecha DESC', []);
        return albumes.map((album) => ({
            ...album,
            fotos: album.fotos ? JSON.parse(album.fotos) : [],
        }));
    }

    /**
     * Busca un álbum por ID
     */
    async obtenerPorId(id) {
        const album = await this.obtenerUno('SELECT * FROM albumes WHERE id = ?', [id]);
        if (album && album.fotos) {
            album.fotos = JSON.parse(album.fotos);
        }
        return album;
    }

    /**
     * Elimina un álbum por ID
     */
    async eliminarPorId(id) {
        return this.ejecutar('DELETE FROM albumes WHERE id = ?', [id]);
    }
}

module.exports = RepositorioAlbum;
