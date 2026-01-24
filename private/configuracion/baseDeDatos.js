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
    conectar() {
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
    async cerrar() {
        if (this.instancia) {
            return new Promise((resolver, rechazar) => {
                this.instancia.close((err) => {
                    if (err) rechazar(err);
                    else {
                        this.instancia = null;
                        resolver();
                    }
                });
            });
        }
    }
}

module.exports = new BaseDeDatos();
