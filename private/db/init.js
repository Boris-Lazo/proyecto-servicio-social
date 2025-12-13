const sqlite = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbFile = path.join(__dirname, 'escuela.sqlite');

module.exports = new Promise((resolve, reject) => {
  const db = new sqlite.Database(dbFile, (err) => {
    if (err) {
      console.error('[DB] Error al abrir base de datos:', err);
      reject(err);
      return;
    }

    db.serialize(() => {
      // Tabla usuarios
      db.run(`CREATE TABLE IF NOT EXISTS users (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              user TEXT UNIQUE NOT NULL,
              hash TEXT NOT NULL,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

      // Tabla álbumes
      db.run(`CREATE TABLE IF NOT EXISTS albums (
              id TEXT PRIMARY KEY,
              titulo TEXT NOT NULL,
              fecha DATE NOT NULL,
              descripcion TEXT,
              fotos TEXT,
              uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

      // Tabla documentos PDF
      db.run(`CREATE TABLE IF NOT EXISTS docs (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              titulo TEXT NOT NULL,
              mes TEXT NOT NULL,
              filename TEXT NOT NULL,
              uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

      // Usuarios por defecto
      const defaults = [
        { user: 'directora@amatal.edu.sv', pass: 'claveDirectora' },
        { user: 'ericka.flores@clases.edu.sv', pass: 'claveSubdirectora' },
        { user: 'borisstanleylazocastillo@gmail.com', pass: 'dev2024' }
      ];
      const stmt = db.prepare('INSERT OR IGNORE INTO users (user, hash) VALUES (?, ?)');
      defaults.forEach(u => stmt.run(u.user, bcrypt.hashSync(u.pass, 10)));
      stmt.finalize((err) => {
        if (err) {
          console.error('[DB] Error al finalizar:', err);
          db.close();
          reject(err);
          return;
        }
        // Cerrar la base de datos solo después de que todas las operaciones terminen
        db.close((err) => {
          if (err) {
            console.error('[DB] Error al cerrar:', err);
            reject(err);
          } else {
            console.log('[DB] Base de datos inicializada');
            resolve();
          }
        });
      });
    });
  });
});
