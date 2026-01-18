const ErrorApp = require('./ErrorApp');

/**
 * Error cuando un recurso no se encuentra (HTTP 404)
 */
class ErrorNoEncontrado extends ErrorApp {
    constructor(mensaje = 'Recurso no encontrado') {
        super(mensaje, 404, true);
    }
}

module.exports = ErrorNoEncontrado;
