/**
 * Clase base para todos los errores de la aplicación
 * Permite distinguir entre errores operacionales (esperados) y errores de programación
 */
class ErrorAplicacion extends Error {
  /**
   * @param {string} message - Mensaje de error
   * @param {number} statusCode - Código de estado HTTP
   * @param {boolean} isOperational - Si es un error operacional esperado
   */
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = this.constructor.name;

    // Captura el stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ErrorAplicacion;
