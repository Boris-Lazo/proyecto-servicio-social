const sqlite3 = require('sqlite3').verbose();
const appConfig = require('./appConfig');

/**
 * Gestor de la conexión a la base de datos
 */
class Database {
    constructor() {
        this.instance = null;
    }

    /**
     * Obtiene la instancia de la base de datos
     * @returns {sqlite3.Database}
     */
    connect() {
        if (!this.instance) {
            this.instance = new sqlite3.Database(appConfig.paths.database, (err) => {
                if (err) {
                    console.error('[DB] Error al conectar:', err.message);
                } else {
                    // Habilitar claves foráneas
                    this.instance.run('PRAGMA foreign_keys = ON');
                }
            });
        }
        return this.instance;
    }

    /**
     * Cierra la conexión
     */
    async close() {
        if (this.instance) {
            return new Promise((resolve, reject) => {
                this.instance.close((err) => {
                    if (err) reject(err);
                    else {
                        this.instance = null;
                        resolve();
                    }
                });
            });
        }
    }
}

module.exports = new Database();
