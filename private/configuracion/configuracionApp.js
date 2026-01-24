const path = require('path');

/**
 * Configuración centralizada de la aplicación
 */
const configuracionApp = {
    puerto: process.env.PORT || 4000,
    secretoJwt: process.env.JWT_SECRET || 'tu_secreto_super_seguro_cambiar_esto',

    // Rutas de almacenamiento
    rutas: {
        baseSubida: path.join(__dirname, '..', 'upload'),
        albumes: path.join(__dirname, '..', 'upload', 'albums'),
        documentos: path.join(__dirname, '..', 'upload', 'docs'),
        albumesTemporales: path.join(__dirname, '..', 'upload', 'temp_albums'),
        miniaturas: path.join(__dirname, '..', 'upload', 'thumbnails'),
        baseDeDatos: path.join(__dirname, '..', 'base_de_datos', 'escuela.sqlite')
    },

    // Configuración SMTP
    smtp: {
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        puerto: parseInt(process.env.SMTP_PORT, 10) || 587,
        usuario: process.env.SMTP_USER,
        clave: process.env.SMTP_PASS,
        desde: process.env.SMTP_FROM || 'notificaciones@escuela.edu.sv'
    },

    // CORS
    origenCors: process.env.CORS_ORIGIN || '*'
};

module.exports = configuracionApp;
