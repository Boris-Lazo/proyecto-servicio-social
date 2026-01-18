const ErrorApp = require('./ErrorApp');

/**
 * Error de autenticación/autorización (HTTP 401)
 */
class ErrorNoAutorizado extends ErrorApp {
    constructor(mensaje = 'No autorizado') {
        super(mensaje, 401, true);
    }
}

module.exports = ErrorNoAutorizado;
