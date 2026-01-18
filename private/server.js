const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const multer = require('multer');

// Importar contenedor de dependencias
const { appConfig } = require('./container');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

// Inicializar la aplicación de forma asíncrona
(async () => {
    try {
        // Inicializar la base de datos (tablas, seeds)
        await require('./db/init');

        const app = express();

        // Configurar CORS
        const corsOptions = {
            origin: appConfig.corsOrigin,
            optionsSuccessStatus: 200,
        };
        app.use(cors(corsOptions));
        app.use(express.json());

        // Servir archivos estáticos desde la carpeta public
        app.use(express.static(path.join(__dirname, '..', 'public')));

        // Servir fotos de álbumes y documentos
        app.use('/api/uploads', express.static(appConfig.paths.albums));
        app.use('/api/docs/file', express.static(appConfig.paths.docs));

        // Montar todas las rutas
        app.use(routes);

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
        app.use(errorHandler);

        // Arrancar servidor
        const PORT = appConfig.port;
        const server = app.listen(PORT, () =>
            console.log(`✅ Backend con arquitectura SOLID en http://localhost:${PORT}`)
        );

        // Cierre graceful
        process.on('SIGINT', () => {
            console.log('\n⏹️  Cerrando servidor...');
            server.close(() => {
                console.log('✅ Servidor cerrado');
                process.exit(0);
            });
        });
    } catch (error) {
        console.error('[ERROR] No se pudo inicializar la aplicación:', error);
        process.exit(1);
    }
})();
