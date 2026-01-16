const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const sqlite = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const dbFile = path.join(__dirname, 'escuela.sqlite');

module.exports = new Promise((resolve, reject) => {
  const db = new sqlite.Database(dbFile, (err) => {
    if (err) {
      console.error('[DB] Error al abrir base de datos:', err);
      return reject(err);
    }

    db.serialize(() => {
      // Create tables
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

      // Default users
      const defaults = [
        { user: 'directora@amatal.edu.sv', pass: process.env.USER_DIRECTORA_PASS },
        { user: 'ericka.flores@clases.edu.sv', pass: process.env.USER_SUBDIRECTORA_PASS },
        { user: 'borisstanleylazocastillo@gmail.com', pass: process.env.USER_DEV_PASS }
      ].filter(u => u.pass);

      if (defaults.length > 0) {
        const stmt = db.prepare('INSERT OR IGNORE INTO users (user, hash) VALUES (?, ?)');
        const promises = defaults.map(u => {
          return new Promise((resolve, reject) => {
            bcrypt.hash(u.pass, 10, (err, hash) => {
              if (err) return reject(err);
              stmt.run(u.user, hash, (err) => {
                if (err) return reject(err);
                resolve();
              });
            });
          });
        });

        Promise.all(promises)
          .then(() => {
            stmt.finalize(err => {
              if (err) {
                console.error('[DB] Error al finalizar statement:', err);
                db.close();
                return reject(err);
              }
              closeAndResolve();
            });
          })
          .catch(err => {
            console.error('[DB] Error al insertar usuarios por defecto:', err);
            db.close();
            reject(err);
          });
      } else {
        closeAndResolve();
      }
    });



    function closeAndResolve() {
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
