const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const sqlite = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const archivoDb = path.join(__dirname, 'escuela.sqlite');

module.exports = new Promise((resolve, reject) => {
  const db = new sqlite.Database(archivoDb, (err) => {
    if (err) {
      console.error('[DB] Error al abrir base de datos:', err);
      return reject(err);
    }

    db.serialize(() => {
      // Crear tablas
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user TEXT UNIQUE NOT NULL,
        hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
      db.run(`CREATE TABLE IF NOT EXISTS albums (
        id TEXT PRIMARY KEY,
        titulo TEXT NOT NULL,
        fecha DATE NOT NULL,
        descripcion TEXT,
        fotos TEXT,
        uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
      db.run(`CREATE TABLE IF NOT EXISTS docs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        mes TEXT NOT NULL,
        filename TEXT NOT NULL,
        uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
      db.run(`CREATE TABLE IF NOT EXISTS password_resets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_email TEXT NOT NULL,
        token TEXT NOT NULL,
        expires_at INTEGER NOT NULL
      )`);

      // Usuarios por defecto
      const predeterminados = [
        { usuario: 'directora@amatal.edu.sv', clave: process.env.USER_DIRECTORA_PASS },
        { usuario: 'ericka.flores@clases.edu.sv', clave: process.env.USER_SUBDIRECTORA_PASS },
        { usuario: 'borisstanleylazocastillo@gmail.com', clave: process.env.USER_DEV_PASS }
      ].filter(u => u.clave);

      if (predeterminados.length > 0) {
        const sentencia = db.prepare('INSERT OR IGNORE INTO users (user, hash) VALUES (?, ?)');
        const promesas = predeterminados.map(u => {
          return new Promise((resolve, reject) => {
            bcrypt.hash(u.clave, 10, (err, hash) => {
              if (err) return reject(err);
              sentencia.run(u.usuario, hash, (err) => {
                if (err) return reject(err);
                resolve();
              });
            });
          });
        });

        Promise.all(promesas)
          .then(() => {
            sentencia.finalize(err => {
              if (err) {
                console.error('[DB] Error al finalizar sentencia:', err);
                db.close();
                return reject(err);
              }
              cerrarYResolver();
            });
          })
          .catch(err => {
            console.error('[DB] Error al insertar usuarios por defecto:', err);
            db.close();
            reject(err);
          });
      } else {
        cerrarYResolver();
      }
    });

    function cerrarYResolver() {
      db.close((err) => {
        if (err) {
          console.error('[DB] Error al cerrar:', err);
          reject(err);
        } else {
          console.log('[DB] Base de datos inicializada');
          resolve();
        }
      });
    }
  });
});
