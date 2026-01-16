const fs = require('fs');
const path = require('path');

/**
 * Servicio de almacenamiento
 * Abstrae operaciones del sistema de archivos para facilitar migración a S3/Cloud Storage
 */
class StorageService {
    constructor() {
        this.baseUploadPath = path.join(__dirname, '..', '..', 'upload');
        this.albumsPath = path.join(this.baseUploadPath, 'albums');
        this.docsPath = path.join(this.baseUploadPath, 'docs');
        this.tempAlbumsPath = path.join(this.baseUploadPath, 'temp_albums');
    }

    /**
     * Crea una carpeta para un álbum
     * @param {string} folderName - Nombre de la carpeta
     * @returns {string} Path completo de la carpeta creada
     */
    createAlbumFolder(folderName) {
        const folderPath = path.join(this.albumsPath, folderName);
        fs.mkdirSync(folderPath, { recursive: true });
        return folderPath;
    }

    /**
     * Guarda archivos de álbum (mueve de temporal a destino final)
     * @param {Array} files - Array de archivos de multer
     * @param {string} folderName - Nombre de la carpeta de destino
     * @returns {Array<string>} Array de nombres de archivo
     */
    saveAlbumFiles(files, folderName) {
        const targetFolder = path.join(this.albumsPath, folderName);
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
     * Elimina un álbum completo (carpeta y archivos)
     * @param {string} albumId - ID del álbum (nombre de carpeta)
     */
    deleteAlbum(albumId) {
        const albumPath = path.join(this.albumsPath, albumId);
        if (fs.existsSync(albumPath)) {
            fs.rmSync(albumPath, { recursive: true, force: true });
        }
    }

    /**
     * Elimina un archivo de documento
     * @param {string} filename - Nombre del archivo
     */
    deleteDocument(filename) {
        const docPath = path.join(this.docsPath, filename);
        if (fs.existsSync(docPath)) {
            fs.unlinkSync(docPath);
        }
    }

    /**
     * Limpia archivos temporales
     * @param {Array} files - Array de archivos de multer
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
     * @param {string} folderPath - Path de la carpeta
     */
    deleteFolder(folderPath) {
        if (fs.existsSync(folderPath)) {
            fs.rmSync(folderPath, { recursive: true, force: true });
        }
    }

    /**
     * Verifica si un archivo existe
     * @param {string} filePath - Path del archivo
     * @returns {boolean}
     */
    fileExists(filePath) {
        return fs.existsSync(filePath);
    }
}

module.exports = new StorageService();
