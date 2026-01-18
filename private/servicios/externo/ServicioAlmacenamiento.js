const fs = require('fs');
const path = require('path');

/**
 * Servicio de almacenamiento
 */
class ServicioAlmacenamiento {
    /**
     * @param {Object} rutas - Rutas de configuracionApp
     */
    constructor(rutas) {
        this.rutas = rutas;
    }

    /**
     * Crea una carpeta para un álbum
     */
    crearCarpetaAlbum(nombreCarpeta) {
        const rutaCarpeta = path.join(this.rutas.albumes, nombreCarpeta);
        fs.mkdirSync(rutaCarpeta, { recursive: true });
        return rutaCarpeta;
    }

    /**
     * Guarda archivos de álbum
     */
    guardarArchivosAlbum(archivos, nombreCarpeta) {
        const carpetaDestino = path.join(this.rutas.albumes, nombreCarpeta);
        const archivosGuardados = [];

        archivos.forEach((archivo) => {
            const rutaAntigua = archivo.path;
            const rutaNueva = path.join(carpetaDestino, archivo.filename);
            fs.renameSync(rutaAntigua, rutaNueva);
            archivosGuardados.push(archivo.filename);
        });

        return archivosGuardados;
    }

    /**
     * Elimina un álbum completo
     */
    eliminarAlbum(idAlbum) {
        const rutaAlbum = path.join(this.rutas.albumes, idAlbum);
        if (fs.existsSync(rutaAlbum)) {
            fs.rmSync(rutaAlbum, { recursive: true, force: true });
        }
    }

    /**
     * Elimina un archivo de documento
     */
    eliminarDocumento(nombreArchivo) {
        const rutaDoc = path.join(this.rutas.documentos, nombreArchivo);
        if (fs.existsSync(rutaDoc)) {
            fs.unlinkSync(rutaDoc);
        }
    }

    /**
     * Limpia archivos temporales
     */
    limpiarArchivosTemporales(archivos) {
        if (!archivos) return;

        archivos.forEach((archivo) => {
            if (fs.existsSync(archivo.path)) {
                fs.unlinkSync(archivo.path);
            }
        });
    }

    /**
     * Elimina una carpeta si existe
     */
    eliminarCarpeta(rutaCarpeta) {
        if (fs.existsSync(rutaCarpeta)) {
            fs.rmSync(rutaCarpeta, { recursive: true, force: true });
        }
    }

    /**
     * Verifica si un archivo existe
     */
    archivoExiste(rutaArchivo) {
        return fs.existsSync(rutaArchivo);
    }
}

module.exports = ServicioAlmacenamiento;
