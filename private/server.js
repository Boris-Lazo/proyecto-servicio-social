require('dotenv').config();
const express = require('express');
const sqlite = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');

const cors = require('cors');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const auth = require('./middleware/autenticacion');
const manejadorDeErrores = require('./middleware/manejadorDeErrores');

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
    app.post('/api/login', (req, res, next) => {
      const { user, password } = req.body;
      console.log('[LOGIN] Intento de login para:', user);

      if (!user || !password) {
        console.log('[LOGIN] Faltan credenciales');
        return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
      }

      db.get('SELECT * FROM users WHERE user = ?', [user], (err, row) => {
        if (err) {
          console.error('[LOGIN] Error de BD:', err);
          return next({ status: 500, message: 'Error de base de datos' });
        }

        if (!row) {
          console.log('[LOGIN] Usuario no encontrado:', user);
          return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        console.log('[LOGIN] Usuario encontrado, verificando contraseña...');
        bcrypt.compare(password, row.hash, (err, ok) => {
          if (err) {
            console.error('[LOGIN] Error al comparar contraseñas:', err);
            return next({ status: 500, message: 'Error al verificar contraseña' });
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

    // ---------- RECUPERACIÓN DE CONTRASEÑA ----------
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });


    app.post('/api/recover', (req, res, next) => {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: 'Falta correo' });

      db.get('SELECT * FROM users WHERE user = ?', [email], async (err, row) => {
        if (err) return next({ status: 500, message: 'Error de BD' });
        if (!row) {
          // Por seguridad, no decimos si el usuario existe o no, pero simulamos éxito
          return res.json({ ok: true, msg: 'Si el correo existe, se enviará un enlace.' });
        }

        const token = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutos

        db.run('INSERT INTO password_resets (user_email, token, expires_at) VALUES (?, ?, ?)',
          [email, token, expiresAt],
          async function (err) {
            if (err) return next({ status: 500, message: 'No se pudo generar token' });

            const html = `
              <div style="font-family: sans-serif; text-align: center; color: #333;">
                <h1>Código de Recuperación</h1>
                <p>Has solicitado restablecer tu contraseña.</p>
                <p>Tu código de verificación es:</p>
                <div style="background: #f0f8ff; padding: 20px; margin: 20px auto; border-radius: 8px; display: inline-block;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #0056b3;">${token}</span>
                </div>
                <p>Este código expira en 15 minutos.</p>
                <small>Si no solicitaste este cambio, ignora este correo.</small>
              </div>
            `;

            try {
              let info = await transporter.sendMail({
                from: `"Centro Escolar" <${process.env.SMTP_FROM}>`,
                to: email,
                subject: `Código de recuperación: ${token}`,
                html: html,
              });
              console.log("Message sent: %s", info.messageId);
              // Preview only available when sending through an Ethereal account
              if (nodemailer.getTestMessageUrl(info)) {
                console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
              }
              res.json({ ok: true });
            } catch (error) {
              console.error("Error sending email: ", error);
              return next({ status: 500, message: 'Error enviando correo' });
            }
          });
      });
    });

    app.post('/api/recover/change', (req, res, next) => {
      const { tempToken, newPass } = req.body;
      if (!tempToken || !newPass) return res.status(400).json({ error: 'Faltan datos' });

      db.get('SELECT * FROM password_resets WHERE token = ?', [tempToken], (err, row) => {
        if (err) return next({ status: 500, message: 'Error de BD' });
        if (!row) return res.status(400).json({ error: 'Token inválido o expirado' });

        if (Date.now() > row.expires_at) {
          db.run('DELETE FROM password_resets WHERE token = ?', [tempToken]); // Clanup
          return res.status(400).json({ error: 'Token expirado' });
        }

        const email = row.user_email;

        // Update password
        bcrypt.hash(newPass, 10, (err, newHash) => {
          if (err) return next({ status: 500, message: 'Error en hash' });

          db.run('UPDATE users SET hash = ? WHERE user = ?', [newHash, email], function (err) {
            if (err) return next({ status: 500, message: 'Error actualizando pass' });

            // Delete used token
            db.run('DELETE FROM password_resets WHERE token = ?', [tempToken]);
            res.json({ ok: true, msg: 'Contraseña actualizada' });
          });
        });
      });
    });

    // ---------- CAMBIAR CONTRASEÑA (Dashbaord) ----------
    app.post('/api/change-password', auth, (req, res, next) => {
      const { oldPass, newPass } = req.body;
      if (!oldPass || !newPass) return res.status(400).json({ error: 'Faltan campos' });
      db.get('SELECT hash FROM users WHERE user = ?', [req.user], (err, row) => {
        if (err) return next({ status: 500, message: 'Error en la base de datos' });
        if (!row) return res.status(404).json({ error: 'Usuario no encontrado' });
        bcrypt.compare(oldPass, row.hash, (err, ok) => {
          if (err || !ok) return res.status(401).json({ error: 'Contraseña actual incorrecta' });
          // Usar versión asíncrona de hash
          bcrypt.hash(newPass, 10, (err, newHash) => {
            if (err) return next({ status: 500, message: 'Error al procesar la contraseña' });
            db.run('UPDATE users SET hash = ? WHERE user = ?', [newHash, req.user], function (err) {
              if (err) return next({ status: 500, message: 'No se pudo actualizar la contraseña' });
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
      req.folderName = `${fecha} - ${slug}`;
      next();
    }, upload.array('fotos', 30), (req, res, next) => {
      const fotos = req.files.map(f => f.filename);
      const album = { id: req.folderName, titulo: req.body.titulo, fecha: req.body.fecha, descripcion: req.body.descripcion || '', fotos };
      db.run('INSERT INTO albums (id, titulo, fecha, descripcion, fotos) VALUES (?, ?, ?, ?, ?)',
        [album.id, album.titulo, album.fecha, album.descripcion, JSON.stringify(album.fotos)],
        function (err) {
          if (err) return next({ status: 500, message: 'No se pudo insertar el álbum' });
          res.status(201).json({ ok: true, album });
        });
    });

    // ---------- LISTAR ÁLBUMES ----------
    app.get('/api/albums', (_req, res, next) => {
      db.all('SELECT * FROM albums ORDER BY fecha DESC', [], (err, rows) => {
        if (err) return next({ status: 500, message: 'Error en la base de datos' });
        rows.forEach(r => r.fotos = JSON.parse(r.fotos));
        res.json(rows);
      });
    });

    // ---------- ELIMINAR ÁLBUM ----------
    app.delete('/api/albums/:id', auth, (req, res, next) => {
      const { id } = req.params;

      // Buscar álbum en BD
      db.get('SELECT * FROM albums WHERE id = ?', [id], (err, album) => {
        if (err) return next({ status: 500, message: 'Error en la base de datos' });
        if (!album) return res.status(404).json({ error: 'Álbum no encontrado' });

        // Eliminar carpeta de fotos
        const albumPath = path.join(__dirname, 'upload', 'albums', id);
        if (fs.existsSync(albumPath)) {
          fs.rmSync(albumPath, { recursive: true, force: true });
        }

        // Eliminar de BD
        db.run('DELETE FROM albums WHERE id = ?', [id], function (err) {
          if (err) return next({ status: 500, message: 'Error al eliminar el álbum de la base de datos' });
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
        cb(null, `${Date.now()} - ${safe}`);
      }
    });
    const uploadDoc = multer({
      storage: docStorage,
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
      fileFilter: pdfFilter
    });

    app.post('/api/docs', auth, uploadDoc.single('doc'), (req, res, next) => {
      if (!req.file) return res.status(400).json({ error: 'No se envió archivo' });
      const { titulo, mes } = req.body;
      if (!titulo || !mes) return res.status(400).json({ error: 'Faltan título o mes' });
      db.run('INSERT INTO docs (titulo, mes, filename) VALUES (?, ?, ?)',
        [titulo, mes, req.file.filename],
        function (err) {
          if (err) return next({ status: 500, message: 'No se pudo insertar el documento' });
          res.json({ ok: true, filename: req.file.filename });
        });
    });

    // ---------- LISTAR Y DESCARGAR DOCUMENTOS ----------
    app.get('/api/docs', (_req, res, next) => {
      db.all('SELECT * FROM docs ORDER BY mes DESC', [], (err, rows) => {
        if (err) return next({ status: 500, message: 'Error en la base de datos' });
        res.json(rows);
      });
    });

    // ---------- ELIMINAR DOCUMENTO ----------
    app.delete('/api/docs/:id', auth, (req, res, next) => {
      const { id } = req.params;

      // Buscar documento en BD
      db.get('SELECT * FROM docs WHERE id = ?', [id], (err, doc) => {
        if (err) return next({ status: 500, message: 'Error en la base de datos' });
        if (!doc) return res.status(404).json({ error: 'Documento no encontrado' });

        // Eliminar archivo PDF
        const docPath = path.join(__dirname, 'upload', 'docs', doc.filename);
        if (fs.existsSync(docPath)) {
          fs.unlinkSync(docPath);
        }

        // Eliminar de BD
        db.run('DELETE FROM docs WHERE id = ?', [id], function (err) {
          if (err) return next({ status: 500, message: 'Error al eliminar el documento de la base de datos' });
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

    app.use(manejadorDeErrores);

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