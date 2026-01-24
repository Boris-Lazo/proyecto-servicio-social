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
        return new Promise((resolver, rechazar) => {
            this.db.get(sql, params, (error, fila) => {
                if (error) rechazar(error);
                else resolver(fila || null);
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
        return new Promise((resolver, rechazar) => {
            this.db.all(sql, params, (error, filas) => {
                if (error) rechazar(error);
                else resolver(filas || []);
            });
        });
    }

    /**
     * Ejecuta una consulta de modificación (INSERT, UPDATE, DELETE)
     * @param {string} sql - Consulta SQL
     * @param {Array} params - Parámetros de la consulta
     * @returns {Promise<Object>} Objeto con ultimoID y cambios
     */
    ejecutar(sql, params = []) {
        return new Promise((resolver, rechazar) => {
            this.db.run(sql, params, function (error) {
                if (error) rechazar(error);
                else
                    resolver({
                        ultimoID: this.lastID,
                        cambios: this.changes,
                    });
            });
        });
    }
}

module.exports = RepositorioBase;
