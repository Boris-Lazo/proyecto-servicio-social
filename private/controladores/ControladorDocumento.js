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
    async crearDocumento(req, res, next) {
        try {
            const { titulo, mes } = req.body;
            const archivo = req.file;
            const resultado = await this.servicioDocumento.crearDocumento({ titulo, mes }, archivo);
            res.json({ ok: true, ...resultado });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Listar todos los documentos
     */
    async listarDocumentos(req, res, next) {
        try {
            const documentos = await this.servicioDocumento.listarDocumentos();
            res.json(documentos);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Eliminar un documento
     */
    async eliminarDocumento(req, res, next) {
        try {
            const { id } = req.params;
            await this.servicioDocumento.eliminarDocumento(parseInt(id, 10));
            res.json({ ok: true, mensaje: 'Documento eliminado' });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Obtener thumbnail de un documento
     */
    async obtenerMiniatura(req, res, next) {
        try {
            const { nombreArchivo } = req.params;
            const rutaMiniatura = await this.servicioDocumento.obtenerMiniatura(nombreArchivo);
            res.sendFile(rutaMiniatura);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = ControladorDocumento;
