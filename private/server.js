require('dotenv').config();
const express = require('express');
const sqlite = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const auth = require('./middleware/auth');

// Inicializar la aplicación de forma asíncrona
(async () => {
  try {
    // Esperar a que la BD se inicialice
    await require('./db/init');

    const app = express();
    // Configurar CORS - modo permisivo para desarrollo
    // Para producción, configurar CORS_ORIGIN en .env
    app.use(cors());
    app.use(express.json());

    // Servir archivos estáticos desde la carpeta public
    app.use(express.static(path.join(__dirname, '..', 'public')));

    const db = new sqlite.Database(path.join(__dirname, 'db', 'escuela.sqlite'));

    // ---------- LOGIN ----------
    app.post('/api/login', (req, res) => {
      const { user, password } = req.body;
      console.log('[LOGIN] Intento de login para:', user);

      if (!user || !password) {
        console.log('[LOGIN] Faltan credenciales');
        return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
      }

      db.get('SELECT * FROM users WHERE user = ?', [user], (err, row) => {
        if (err) {
          console.error('[LOGIN] Error de BD:', err);
          return res.status(500).json({ error: 'Error de base de datos' });
        }

        if (!row) {
          console.log('[LOGIN] Usuario no encontrado:', user);
          return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        console.log('[LOGIN] Usuario encontrado, verificando contraseña...');
        bcrypt.compare(password, row.hash, (err, ok) => {
          if (err) {
            console.error('[LOGIN] Error al comparar contraseñas:', err);
            return res.status(500).json({ error: 'Error al verificar contraseña' });
          }

          if (!ok) {
            console.log('[LOGIN] Contraseña incorrecta para:', user);
            return res.status(401).json({ error: 'Credenciales inválidas' });
          }

          console.log('[LOGIN] Login exitoso para:', user);
          const token = jwt.sign({ user }, process.env.JWT_SECRET, { expiresIn: '7d' });
          res.json({ token });
        });
      });
    });

    // ---------- CAMBIAR CONTRASEÑA ----------
    app.post('/api/change-password', auth, (req, res) => {
      const { oldPass, newPass } = req.body;
      if (!oldPass || !newPass) return res.status(400).json({ error: 'Faltan campos' });
      db.get('SELECT hash FROM users WHERE user = ?', [req.user], (err, row) => {
        if (err) return res.status(500).json({ error: 'DB error' });
        if (!row) return res.status(404).json({ error: 'Usuario no encontrado' });
        bcrypt.compare(oldPass, row.hash, (err, ok) => {
          if (err || !ok) return res.status(401).json({ error: 'Contraseña actual incorrecta' });
          // Usar versión asíncrona de hash
          bcrypt.hash(newPass, 10, (err, newHash) => {
            if (err) return res.status(500).json({ error: 'Error al procesar contraseña' });
            db.run('UPDATE users SET hash = ? WHERE user = ?', [newHash, req.user], function (err) {
              if (err) return res.status(500).json({ error: 'No se pudo actualizar' });
              res.json({ ok: true, msg: 'Contraseña cambiada' });
            });
          });
        });
      });
    });

    // ---------- SUBIR ÁLBUM ----------
    // Validar que solo se suban imágenes
    const imageFilter = (req, file, cb) => {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Solo se permiten archivos de imagen (JPEG, PNG, GIF, WebP)'));
      }
    };

    const storage = multer.diskStorage({
      destination: (_req, _file, cb) => {
        const folder = _req.folderName;
        const full = path.join(__dirname, 'upload', 'albums', folder);
        fs.mkdirSync(full, { recursive: true });
        cb(null, full);
      },
      filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}${ext}`);
      }
    });
    const upload = multer({
      storage,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
      fileFilter: imageFilter
    });

    app.post('/api/albums', auth, (req, res, next) => {
      const { titulo, fecha, descripcion } = req.body;
      if (!titulo || !fecha) return res.status(400).json({ error: 'Faltan título o fecha' });
      const slug = titulo.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      req.folderName = `${fecha}-${slug}`;
      next();
    }, upload.array('fotos', 30), (req, res) => {
      const fotos = req.files.map(f => f.filename);
      const album = { id: req.folderName, titulo: req.body.titulo, fecha: req.body.fecha, descripcion: req.body.descripcion || '', fotos };
      db.run('INSERT INTO albums (id, titulo, fecha, descripcion, fotos) VALUES (?, ?, ?, ?, ?)',
        [album.id, album.titulo, album.fecha, album.descripcion, JSON.stringify(album.fotos)],
        function (err) {
          if (err) return res.status(500).json({ error: 'No se pudo insertar' });
          res.status(201).json({ ok: true, album });
        });
    });

    // ---------- LISTAR ÁLBUMES ----------
    app.get('/api/albums', (_req, res) => {
      db.all('SELECT * FROM albums ORDER BY fecha DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'DB error' });
        rows.forEach(r => r.fotos = JSON.parse(r.fotos));
        res.json(rows);
      });
    });

    // ---------- ELIMINAR ÁLBUM ----------
    app.delete('/api/albums/:id', auth, (req, res) => {
      const { id } = req.params;

      // Buscar álbum en BD
      db.get('SELECT * FROM albums WHERE id = ?', [id], (err, album) => {
        if (err) return res.status(500).json({ error: 'DB error' });
        if (!album) return res.status(404).json({ error: 'Álbum no encontrado' });

        // Eliminar carpeta de fotos
        const albumPath = path.join(__dirname, 'upload', 'albums', id);
        if (fs.existsSync(albumPath)) {
          fs.rmSync(albumPath, { recursive: true, force: true });
        }

        // Eliminar de BD
        db.run('DELETE FROM albums WHERE id = ?', [id], function (err) {
          if (err) return res.status(500).json({ error: 'Error al eliminar de BD' });
          res.json({ ok: true, message: 'Álbum eliminado' });
        });
      });
    });

    // ---------- SUBIR DOCUMENTOS (PDF) ----------
    // Validar que solo se suban PDFs
    const pdfFilter = (req, file, cb) => {
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Solo se permiten archivos PDF'));
      }
    };

    const docStorage = multer.diskStorage({
      destination: (_req, _file, cb) => {
        const full = path.join(__dirname, 'upload', 'docs');
        fs.mkdirSync(full, { recursive: true });
        cb(null, full);
      },
      filename: (_req, file, cb) => {
        const safe = file.originalname.replace(/[^a-z0-9.-]/gi, '_');
        cb(null, `${Date.now()}-${safe}`);
      }
    });
    const uploadDoc = multer({
      storage: docStorage,
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
      fileFilter: pdfFilter
    });

    app.post('/api/docs', auth, uploadDoc.single('doc'), (req, res) => {
      if (!req.file) return res.status(400).json({ error: 'No se envió archivo' });
      const { titulo, mes } = req.body;
      if (!titulo || !mes) return res.status(400).json({ error: 'Faltan título o mes' });
      db.run('INSERT INTO docs (titulo, mes, filename) VALUES (?, ?, ?)',
        [titulo, mes, req.file.filename],
        function (err) {
          if (err) return res.status(500).json({ error: 'No se pudo insertar' });
          res.json({ ok: true, filename: req.file.filename });
        });
    });

    // ---------- LISTAR Y DESCARGAR DOCUMENTOS ----------
    app.get('/api/docs', (_req, res) => {
      db.all('SELECT * FROM docs ORDER BY mes DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'DB error' });
        res.json(rows);
      });
    });

    // ---------- ELIMINAR DOCUMENTO ----------
    app.delete('/api/docs/:id', auth, (req, res) => {
      const { id } = req.params;

      // Buscar documento en BD
      db.get('SELECT * FROM docs WHERE id = ?', [id], (err, doc) => {
        if (err) return res.status(500).json({ error: 'DB error' });
        if (!doc) return res.status(404).json({ error: 'Documento no encontrado' });

        // Eliminar archivo PDF
        const docPath = path.join(__dirname, 'upload', 'docs', doc.filename);
        if (fs.existsSync(docPath)) {
          fs.unlinkSync(docPath);
        }

        // Eliminar de BD
        db.run('DELETE FROM docs WHERE id = ?', [id], function (err) {
          if (err) return res.status(500).json({ error: 'Error al eliminar de BD' });
          res.json({ ok: true, message: 'Documento eliminado' });
        });
      });
    });

    app.use('/api/docs/file', express.static(path.join(__dirname, 'upload', 'docs')));

    // ---------- SERVIR FOTOS DE ÁLBUMES ----------
    app.use('/api/uploads', express.static(path.join(__dirname, 'upload', 'albums')));

    // ---------- MANEJO DE ERRORES ----------
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

    // ---------- ARRANCAR ----------
    const PORT = process.env.PORT || 4000;
    const server = app.listen(PORT, () => console.log(`Backend con DB lista en http://localhost:${PORT}`));

    // Cierre graceful de la base de datos
    process.on('SIGINT', () => {
      console.log('\nCerrando servidor...');
      db.close((err) => {
        if (err) console.error('Error al cerrar BD:', err);
        else console.log('Base de datos cerrada');
        server.close(() => {
          console.log('Servidor cerrado');
          process.exit(0);
        });
      });
    });

  } catch (error) {
    console.error('[ERROR] No se pudo inicializar la aplicación:', error);
    process.exit(1);
  }
})();
