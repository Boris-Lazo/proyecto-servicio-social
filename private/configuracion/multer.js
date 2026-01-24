const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * Filtro para validar que solo se suban imágenes
 */
const filtroImagen = (peticion, archivo, cb) => {
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (tiposPermitidos.includes(archivo.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos de imagen (JPEG, PNG, GIF, WebP)'));
    }
};

/**
 * Filtro para validar que solo se suban PDFs
 */
const filtroPdf = (peticion, archivo, cb) => {
    if (archivo.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos PDF'));
    }
};

/**
 * Configuración de almacenamiento para álbumes (carpeta temporal)
 */
const almacenamientoAlbum = multer.diskStorage({
    destination: (_peticion, _archivo, cb) => {
        const carpetaTemporal = path.join(__dirname, '..', 'upload', 'temp_albums');
        fs.mkdirSync(carpetaTemporal, { recursive: true });
        cb(null, carpetaTemporal);
    },
    filename: (_peticion, archivo, cb) => {
        const ext = path.extname(archivo.originalname);
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
});

/**
 * Configuración de almacenamiento para documentos
 */
const almacenamientoDocumento = multer.diskStorage({
    destination: (_peticion, _archivo, cb) => {
        const carpetaDocs = path.join(__dirname, '..', 'upload', 'docs');
        fs.mkdirSync(carpetaDocs, { recursive: true });
        cb(null, carpetaDocs);
    },
    filename: (_peticion, archivo, cb) => {
        const seguro = archivo.originalname.replace(/[^a-z0-9.-]/gi, '_');
        cb(null, `${Date.now()} - ${seguro}`);
    },
});

/**
 * Configuración de multer para subida de álbumes
 */
const subidaAlbum = multer({
    storage: almacenamientoAlbum,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB por imagen
    fileFilter: filtroImagen,
});

/**
 * Configuración de multer para subida de documentos
 */
const subidaDocumento = multer({
    storage: almacenamientoDocumento,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    fileFilter: filtroPdf,
});

module.exports = {
    filtroImagen,
    filtroPdf,
    almacenamientoAlbum,
    almacenamientoDocumento,
    subidaAlbum,
    subidaDocumento,
};
