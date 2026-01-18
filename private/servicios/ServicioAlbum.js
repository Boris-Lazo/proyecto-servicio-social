const { ErrorNoEncontrado, ErrorValidacion, ErrorApp } = require('../errores/indice');

/**
 * Servicio de álbumes
 */
class ServicioAlbum {
    /**
     * @param {RepositorioAlbum} repositorioAlbum
     * @param {ServicioAlmacenamiento} servicioAlmacenamiento
     */
    constructor(repositorioAlbum, servicioAlmacenamiento) {
        this.repositorioAlbum = repositorioAlbum;
        this.servicioAlmacenamiento = servicioAlmacenamiento;
    }

    /**
     * Crea un nuevo álbum con fotos
     */
    async crearAlbum(datos, archivos) {
        const { titulo, fecha, descripcion = '' } = datos;

        if (!titulo || !fecha) {
            this.servicioAlmacenamiento.limpiarArchivosTemporales(archivos);
            throw new ErrorValidacion('Faltan título o fecha');
        }

        const slug = titulo
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        const nombreCarpeta = `${fecha} - ${slug}`;

        let carpetaDestino = null;

        try {
            carpetaDestino = this.servicioAlmacenamiento.crearCarpetaAlbum(nombreCarpeta);
            const archivosGuardados = this.servicioAlmacenamiento.guardarArchivosAlbum(archivos, nombreCarpeta);

            const album = {
                id: nombreCarpeta,
                titulo,
                fecha,
                descripcion,
                fotos: archivosGuardados,
            };

            await this.repositorioAlbum.crear(album);
            return album;
        } catch (error) {
            this.servicioAlmacenamiento.limpiarArchivosTemporales(archivos);
            if (carpetaDestino) {
                this.servicioAlmacenamiento.eliminarCarpeta(carpetaDestino);
            }

            if (error.esOperacional) throw error;
            throw new ErrorApp('Error al crear el álbum', 500, false);
        }
    }

    /**
     * Lista todos los álbumes
     */
    async listarAlbumes() {
        return this.repositorioAlbum.obtenerTodos();
    }

    /**
     * Elimina un álbum y sus archivos
     */
    async eliminarAlbum(id) {
        const album = await this.repositorioAlbum.obtenerPorId(id);
        if (!album) {
            throw new ErrorNoEncontrado('Álbum no encontrado');
        }

        this.servicioAlmacenamiento.eliminarAlbum(id);
        await this.repositorioAlbum.eliminarPorId(id);
    }
}

module.exports = ServicioAlbum;
