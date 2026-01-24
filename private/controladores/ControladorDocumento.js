/**
 * Controlador de documentos
 */
class ControladorDocumento {
    /**
     * @param {ServicioDocumento} servicioDocumento
     */
    constructor(servicioDocumento) {
        this.servicioDocumento = servicioDocumento;
    }

    /**
     * Crear un nuevo documento
     */
    async crearDocumento(peticion, respuesta, siguiente) {
        try {
            const { titulo, mes } = peticion.body;
            const archivo = peticion.file;
            const resultado = await this.servicioDocumento.crearDocumento({ titulo, mes }, archivo);
            respuesta.json({ ok: true, ...resultado });
        } catch (error) {
            siguiente(error);
        }
    }

    /**
     * Listar todos los documentos
     */
    async listarDocumentos(peticion, respuesta, siguiente) {
        try {
            const documentos = await this.servicioDocumento.listarDocumentos();
            respuesta.json(documentos);
        } catch (error) {
            siguiente(error);
        }
    }

    /**
     * Eliminar un documento
     */
    async eliminarDocumento(peticion, respuesta, siguiente) {
        try {
            const { id } = peticion.params;
            await this.servicioDocumento.eliminarDocumento(parseInt(id, 10));
            respuesta.json({ ok: true, mensaje: 'Documento eliminado' });
        } catch (error) {
            siguiente(error);
        }
    }

    /**
     * Obtener thumbnail de un documento
     */
    async obtenerMiniatura(peticion, respuesta, siguiente) {
        try {
            const { nombreArchivo } = peticion.params;
            const rutaMiniatura = await this.servicioDocumento.obtenerMiniatura(nombreArchivo);
            respuesta.sendFile(rutaMiniatura);
        } catch (error) {
            siguiente(error);
        }
    }
}

module.exports = ControladorDocumento;
