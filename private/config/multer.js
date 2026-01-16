const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * Filtro para validar que solo se suban imágenes
 */
const imageFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos de imagen (JPEG, PNG, GIF, WebP)'));
    }
};

/**
 * Filtro para validar que solo se suban PDFs
 */
const pdfFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos PDF'));
    }
};

/**
 * Configuración de storage para álbumes (carpeta temporal)
 */
const albumStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        const tempFolder = path.join(__dirname, '..', 'upload', 'temp_albums');
        fs.mkdirSync(tempFolder, { recursive: true });
        cb(null, tempFolder);
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
});

/**
 * Configuración de storage para documentos
 */
const documentStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        const docsFolder = path.join(__dirname, '..', 'upload', 'docs');
        fs.mkdirSync(docsFolder, { recursive: true });
        cb(null, docsFolder);
    },
    filename: (_req, file, cb) => {
        const safe = file.originalname.replace(/[^a-z0-9.-]/gi, '_');
        cb(null, `${Date.now()} - ${safe}`);
    },
});

/**
 * Configuración de multer para subida de álbumes
 */
const uploadAlbum = multer({
    storage: albumStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB por imagen
    fileFilter: imageFilter,
});

/**
 * Configuración de multer para subida de documentos
 */
const uploadDocument = multer({
    storage: documentStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    fileFilter: pdfFilter,
});

module.exports = {
    imageFilter,
    pdfFilter,
    albumStorage,
    documentStorage,
    uploadAlbum,
    uploadDocument,
};
