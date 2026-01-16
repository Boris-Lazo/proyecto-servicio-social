const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
// const path = require('path'); // Removed duplicate

console.log('📧 Configuración SMTP:', {
  host: process.env.SMTP_HOST,
  user: process.env.SMTP_USER ? 'Definido' : 'NO DEFINIDO',
  pass: process.env.SMTP_PASS ? 'Definido' : 'NO DEFINIDO'
});
const multer = require('multer');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

// Inicializar la aplicación de forma asíncrona
(async () => {
  try {
    // Esperar a que la BD se inicialice
    await require('./db/init');

    const app = express();

    // Configurar CORS
    // En producción, se debe definir CORS_ORIGIN en .env con el dominio del frontend
    const corsOptions = {
      origin: process.env.CORS_ORIGIN || '*',
      optionsSuccessStatus: 200
    };
    app.use(cors(corsOptions));
    app.use(express.json());

    // Servir archivos estáticos desde la carpeta public
    app.use(express.static(path.join(__dirname, '..', 'public')));

    // Servir fotos de álbumes
    app.use('/api/uploads', express.static(path.join(__dirname, 'upload', 'albums')));

    // Servir archivos de documentos
    app.use('/api/docs/file', express.static(path.join(__dirname, 'upload', 'docs')));

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

    // Middleware global de manejo de errores (debe ser el último)
    app.use(errorHandler);

    // Arrancar servidor
    const PORT = process.env.PORT || 4000;
    const server = app.listen(PORT, () =>
      console.log(`✅ Backend con arquitectura por capas en http://localhost:${PORT}`)
    );

    // Cierre graceful del servidor
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