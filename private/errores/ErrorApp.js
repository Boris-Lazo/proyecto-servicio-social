/**
 * Clase base para todos los errores de la aplicación
 * Permite distinguir entre errores operacionales (esperados) y errores de programación
 */
class ErrorApp extends Error {
    /**
     * @param {string} mensaje - Mensaje de error
     * @param {number} codigoEstado - Código de estado HTTP
     * @param {boolean} esOperacional - Si es un error operacional esperado
     */
    constructor(mensaje, codigoEstado = 500, esOperacional = true) {
        super(mensaje);
        this.codigoEstado = codigoEstado;
        this.esOperacional = esOperacional;
        this.name = this.constructor.name;

        // Captura el stack trace
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = ErrorApp;
