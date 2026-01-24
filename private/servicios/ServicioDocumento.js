const { ErrorNoEncontrado, ErrorValidacion } = require('../errores/indice');
const fs = require('fs').promises;
const path = require('path');

/**
 * Servicio de documentos
 */
class ServicioDocumento {
    /**
     * @param {RepositorioDocumento} repositorioDocumento
     * @param {ServicioAlmacenamiento} servicioAlmacenamiento
     * @param {Object} configuracion - configuracionApp
     */
    constructor(repositorioDocumento, servicioAlmacenamiento, configuracion) {
        this.repositorioDocumento = repositorioDocumento;
        this.servicioAlmacenamiento = servicioAlmacenamiento;
        this.configuracion = configuracion;
    }

    /**
     * Crea un nuevo documento
     */
    async crearDocumento(datos, archivo) {
        const { titulo, mes } = datos;

        if (!titulo || !mes) {
            if (archivo) this.servicioAlmacenamiento.limpiarArchivosTemporales([archivo]);
            throw new ErrorValidacion('Faltan título o mes');
        }

        if (!archivo) {
            throw new ErrorValidacion('No se envió archivo');
        }

        const documento = { titulo, mes, nombreArchivo: archivo.filename };
        await this.repositorioDocumento.crear(documento);

        this.generarMiniatura(archivo.filename).catch(error => {
            console.error(`Error generando miniatura para ${archivo.filename}:`, error);
        });

        return { nombreArchivo: archivo.filename };
    }

    /**
     * Lista todos los documentos
     */
    async listarDocumentos() {
        return this.repositorioDocumento.obtenerTodos();
    }

    /**
     * Elimina un documento y su archivo
     */
    async eliminarDocumento(id) {
        const documento = await this.repositorioDocumento.obtenerPorId(id);
        if (!documento) throw new ErrorNoEncontrado('Documento no encontrado');

        this.servicioAlmacenamiento.eliminarDocumento(documento.nombre_archivo);

        try {
            const rutaMiniatura = path.join(this.configuracion.rutas.miniaturas, `${documento.nombre_archivo}.png`);
            await fs.unlink(rutaMiniatura);
        } catch (error) {}

        await this.repositorioDocumento.eliminarPorId(id);
    }

    /**
     * Genera miniatura de un PDF
     */
    async generarMiniatura(nombreArchivo) {
        const rutaPdf = path.join(this.configuracion.rutas.documentos, nombreArchivo);
        const rutaMiniatura = path.join(this.configuracion.rutas.miniaturas, `${nombreArchivo}.png`);

        try {
            const { pdf } = await import('pdf-to-img');
            const documentoPdf = await pdf(rutaPdf, { scale: 2.0 });
            const primeraPagina = await documentoPdf.getPage(1);
            await fs.writeFile(rutaMiniatura, primeraPagina);
        } catch (error) {
            console.error(`Error generando miniatura para ${nombreArchivo}:`, error);
            throw error;
        }
    }

    /**
     * Obtiene el miniatura de un documento
     */
    async obtenerMiniatura(nombreArchivo) {
        const rutaMiniatura = path.join(this.configuracion.rutas.miniaturas, `${nombreArchivo}.png`);

        try {
            await fs.access(rutaMiniatura);
            return rutaMiniatura;
        } catch (error) {
            await this.generarMiniatura(nombreArchivo);
            return rutaMiniatura;
        }
    }
}

module.exports = ServicioDocumento;
