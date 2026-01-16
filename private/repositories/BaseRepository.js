const sqlite = require('sqlite3').verbose();
const path = require('path');

/**
 * Clase base para repositorios
 * Proporciona conexión compartida a la base de datos y métodos auxiliares
 */
class BaseRepository {
    constructor() {
        const dbPath = path.join(__dirname, '..', 'db', 'escuela.sqlite');
        this.db = new sqlite.Database(dbPath);
    }

    /**
     * Ejecuta una consulta que retorna una sola fila
     * @param {string} sql - Consulta SQL
     * @param {Array} params - Parámetros de la consulta
     * @returns {Promise<Object|null>} Fila encontrada o null
     */
    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row || null);
            });
        });
    }

    /**
     * Ejecuta una consulta que retorna múltiples filas
     * @param {string} sql - Consulta SQL
     * @param {Array} params - Parámetros de la consulta
     * @returns {Promise<Array>} Array de filas
     */
    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
    }

    /**
     * Ejecuta una consulta de modificación (INSERT, UPDATE, DELETE)
     * @param {string} sql - Consulta SQL
     * @param {Array} params - Parámetros de la consulta
     * @returns {Promise<Object>} Objeto con lastID y changes
     */
    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function (err) {
                if (err) reject(err);
                else
                    resolve({
                        lastID: this.lastID,
                        changes: this.changes,
                    });
            });
        });
    }

    /**
     * Cierra la conexión a la base de datos
     * @returns {Promise<void>}
     */
    close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }
}

module.exports = BaseRepository;
