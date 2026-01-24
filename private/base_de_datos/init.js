const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const sqlite = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const archivoDb = path.join(__dirname, 'escuela.sqlite');

module.exports = new Promise((resolverGlobal, rechazarGlobal) => {
  const db = new sqlite.Database(archivoDb, (errorConexion) => {
    if (errorConexion) {
      console.error('[DB] Error al abrir base de datos:', errorConexion);
      return rechazarGlobal(errorConexion);
    }

    db.serialize(() => {
      // Crear tablas en español
      db.run(`CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario TEXT UNIQUE NOT NULL,
        clave_hash TEXT NOT NULL,
        creado_el DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS albumes (
        id TEXT PRIMARY KEY,
        titulo TEXT NOT NULL,
        fecha DATE NOT NULL,
        descripcion TEXT,
        fotos TEXT,
        subido_el DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS documentos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        mes TEXT NOT NULL,
        nombre_archivo TEXT NOT NULL,
        subido_el DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS restablecimientos_clave (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        correo_usuario TEXT NOT NULL,
        token TEXT NOT NULL,
        expira_el INTEGER NOT NULL
      )`);

      // Usuarios por defecto
      const predeterminados = [
        { correo: 'directora@amatal.edu.sv', clave: process.env.USER_DIRECTORA_PASS },
        { correo: 'ericka.flores@clases.edu.sv', clave: process.env.USER_SUBDIRECTORA_PASS },
        { correo: 'borisstanleylazocastillo@gmail.com', clave: process.env.USER_DEV_PASS }
      ].filter(u => u.clave);

      if (predeterminados.length > 0) {
        const sentencia = db.prepare('INSERT OR IGNORE INTO usuarios (usuario, clave_hash) VALUES (?, ?)');
        const promesas = predeterminados.map(u => {
          return new Promise((resolver, rechazar) => {
            bcrypt.hash(u.clave, 10, (err, hash) => {
              if (err) return rechazar(err);
              sentencia.run(u.correo, hash, (err) => {
                if (err) return rechazar(err);
                resolver();
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
                return rechazarGlobal(err);
              }
              cerrarYResolver();
            });
          })
          .catch(err => {
            console.error('[DB] Error al insertar usuarios por defecto:', err);
            db.close();
            rechazarGlobal(err);
          });
      } else {
        cerrarYResolver();
      }
    });

    function cerrarYResolver() {
      db.close((err) => {
        if (err) {
          console.error('[DB] Error al cerrar:', err);
          rechazarGlobal(err);
        } else {
          console.log('[DB] Base de datos inicializada');
          resolverGlobal();
        }
      });
    }
  });
});
