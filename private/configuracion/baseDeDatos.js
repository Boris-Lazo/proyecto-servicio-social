const sqlite3 = require('sqlite3').verbose();
const configuracionApp = require('./configuracionApp');

/**
 * Gestor de la conexión a la base de datos
 */
class BaseDeDatos {
    constructor() {
        this.instancia = null;
    }

    /**
     * Obtiene la instancia de la base de datos
     */
    connect() {
        if (!this.instancia) {
            this.instancia = new sqlite3.Database(configuracionApp.rutas.baseDeDatos, (err) => {
                if (err) {
                    console.error('[DB] Error al conectar:', err.message);
                } else {
                    // Habilitar claves foráneas
                    this.instancia.run('PRAGMA foreign_keys = ON');
                }
            });
        }
        return this.instancia;
    }

    /**
     * Cierra la conexión
     */
    async close() {
        if (this.instancia) {
            return new Promise((resolve, reject) => {
                this.instancia.close((err) => {
                    if (err) reject(err);
                    else {
                        this.instancia = null;
                        resolve();
                    }
                });
            });
        }
    }
}

module.exports = new BaseDeDatos();
