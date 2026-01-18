const path = require('path');

/**
 * Configuración centralizada de la aplicación
 */
const configuracionApp = {
    puerto: process.env.PORT || 4000,
    secretoJwt: process.env.JWT_SECRET || 'tu_secreto_super_seguro_cambiar_esto',

    // Rutas de almacenamiento
    // Cuando se corre en Docker, estas rutas deben ser relativas al directorio raíz de la app en el contenedor (/app)
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
        port: parseInt(process.env.SMTP_PORT, 10) || 587,
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
        from: process.env.SMTP_FROM || 'notificaciones@escuela.edu.sv'
    },

    // CORS
    origenCors: process.env.CORS_ORIGIN || '*'
};

module.exports = configuracionApp;
