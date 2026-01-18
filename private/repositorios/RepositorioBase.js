/**
 * Clase base para repositorios
 * Proporciona métodos auxiliares para consultas SQL usando una instancia de DB inyectada
 */
class RepositorioBase {
    /**
     * @param {Object} db - Instancia de la base de datos (sqlite3)
     */
    constructor(db) {
        this.db = db;
    }

    /**
     * Ejecuta una consulta que retorna una sola fila
     * @param {string} sql - Consulta SQL
     * @param {Array} params - Parámetros de la consulta
     * @returns {Promise<Object|null>} Fila encontrada o null
     */
    obtenerUno(sql, params = []) {
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
    obtenerTodos(sql, params = []) {
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
    ejecutar(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function (err) {
                if (err) reject(err);
                else
                    resolve({
                        ultimoID: this.lastID,
                        cambios: this.changes,
                    });
            });
        });
    }
}

module.exports = RepositorioBase;
