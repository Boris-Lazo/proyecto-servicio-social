const fs = require('fs');
const path = require('path');

/**
 * Servicio de almacenamiento
 */
class StorageService {
    /**
     * @param {Object} paths - Rutas de appConfig
     */
    constructor(paths) {
        this.paths = paths;
    }

    /**
     * Crea una carpeta para un álbum
     */
    createAlbumFolder(folderName) {
        const folderPath = path.join(this.paths.albums, folderName);
        fs.mkdirSync(folderPath, { recursive: true });
        return folderPath;
    }

    /**
     * Guarda archivos de álbum
     */
    saveAlbumFiles(files, folderName) {
        const targetFolder = path.join(this.paths.albums, folderName);
        const savedFiles = [];

        files.forEach((file) => {
            const oldPath = file.path;
            const newPath = path.join(targetFolder, file.filename);
            fs.renameSync(oldPath, newPath);
            savedFiles.push(file.filename);
        });

        return savedFiles;
    }

    /**
     * Elimina un álbum completo
     */
    deleteAlbum(albumId) {
        const albumPath = path.join(this.paths.albums, albumId);
        if (fs.existsSync(albumPath)) {
            fs.rmSync(albumPath, { recursive: true, force: true });
        }
    }

    /**
     * Elimina un archivo de documento
     */
    deleteDocument(filename) {
        const docPath = path.join(this.paths.docs, filename);
        if (fs.existsSync(docPath)) {
            fs.unlinkSync(docPath);
        }
    }

    /**
     * Limpia archivos temporales
     */
    cleanupTempFiles(files) {
        if (!files) return;

        files.forEach((file) => {
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
        });
    }

    /**
     * Elimina una carpeta si existe
     */
    deleteFolder(folderPath) {
        if (fs.existsSync(folderPath)) {
            fs.rmSync(folderPath, { recursive: true, force: true });
        }
    }

    /**
     * Verifica si un archivo existe
     */
    fileExists(filePath) {
        return fs.existsSync(filePath);
    }
}

module.exports = StorageService;
