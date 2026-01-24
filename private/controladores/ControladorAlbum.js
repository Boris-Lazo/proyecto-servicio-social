/**
 * Controlador de álbumes
 */
class ControladorAlbum {
    /**
     * @param {ServicioAlbum} servicioAlbum
     */
    constructor(servicioAlbum) {
        this.servicioAlbum = servicioAlbum;
    }

    /**
     * Crear un nuevo álbum
     */
    async crearAlbum(peticion, respuesta, siguiente) {
        try {
            const { titulo, fecha, descripcion } = peticion.body;
            const archivos = peticion.files;
            const album = await this.servicioAlbum.crearAlbum({ titulo, fecha, descripcion }, archivos);
            respuesta.status(201).json({ ok: true, album });
        } catch (error) {
            siguiente(error);
        }
    }

    /**
     * Listar todos los álbumes
     */
    async listarAlbumes(peticion, respuesta, siguiente) {
        try {
            const albumes = await this.servicioAlbum.listarAlbumes();
            respuesta.json(albumes);
        } catch (error) {
            siguiente(error);
        }
    }

    /**
     * Eliminar un álbum
     */
    async eliminarAlbum(peticion, respuesta, siguiente) {
        try {
            const { id } = peticion.params;
            await this.servicioAlbum.eliminarAlbum(id);
            respuesta.json({ ok: true, mensaje: 'Álbum eliminado' });
        } catch (error) {
            siguiente(error);
        }
    }
}

module.exports = ControladorAlbum;
