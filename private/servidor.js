const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const multer = require('multer');

// Importar contenedor de dependencias
const { configuracionApp } = require('./contenedor');
const rutas = require('./rutas/indice');
const manejadorErrores = require('./intermediarios/manejadorErrores');

// Inicializar la aplicación de forma asíncrona
(async () => {
    try {
        // Inicializar la base de datos (tablas, seeds)
        await require('./base_de_datos/init');

        const app = express();

        // Configurar CORS
        const opcionesCors = {
            origin: configuracionApp.origenCors,
            optionsSuccessStatus: 200,
        };
        app.use(cors(opcionesCors));
        app.use(express.json());

        // Servir archivos estáticos desde la carpeta public
        app.use(express.static(path.join(__dirname, '..', 'public')));

        // Servir fotos de álbumes y documentos
        app.use('/api/uploads', express.static(configuracionApp.rutas.albumes));
        app.use('/api/docs/file', express.static(configuracionApp.rutas.documentos));

        // Montar todas las rutas
        app.use(rutas);

        // Middleware para capturar errores de multer
        app.use((err, req, res, next) => {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({ error: 'Archivo demasiado grande' });
                }
                return res.status(400).json({ error: `Error al subir archivo: ${err.message}` });
            } else if (err) {
                return res.status(400).json({ error: err.message });
            }
            next();
        });

        // Middleware global de manejo de errores
        app.use(manejadorErrores);

        // Arrancar servidor
        const PUERTO = configuracionApp.puerto;
        const servidor = app.listen(PUERTO, () =>
            console.log(`✅ Backend con arquitectura SOLID en http://localhost:${PUERTO}`)
        );

        // Cierre graceful
        process.on('SIGINT', () => {
            console.log('\n⏹️  Cerrando servidor...');
            servidor.close(() => {
                console.log('✅ Servidor cerrado');
                process.exit(0);
            });
        });
    } catch (error) {
        console.error('[ERROR] No se pudo inicializar la aplicación:', error);
        process.exit(1);
    }
})();
