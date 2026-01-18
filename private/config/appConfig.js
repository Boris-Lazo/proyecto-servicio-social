const path = require('path');

/**
 * Configuración centralizada de la aplicación
 */
const appConfig = {
    port: process.env.PORT || 4000,
    jwtSecret: process.env.JWT_SECRET || 'tu_secreto_super_seguro_cambiar_esto',

    // Rutas de almacenamiento
    paths: {
        baseUpload: path.join(__dirname, '..', 'upload'),
        albums: path.join(__dirname, '..', 'upload', 'albums'),
        docs: path.join(__dirname, '..', 'upload', 'docs'),
        tempAlbums: path.join(__dirname, '..', 'upload', 'temp_albums'),
        thumbnails: path.join(__dirname, '..', 'upload', 'thumbnails'),
        database: path.join(__dirname, '..', 'db', 'escuela.sqlite')
    },

    // Configuración SMTP
    smtp: {
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: parseInt(process.env.SMTP_PORT, 10) || 587,
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
        from: process.env.SMTP_FROM || 'notificaciones@escuela.edu.sv'
    },

    // CORS
    corsOrigin: process.env.CORS_ORIGIN || '*'
};

module.exports = appConfig;
