const ErrorApp = require('./ErrorApp');

/**
 * Error de validación de datos (HTTP 400)
 */
class ErrorValidacion extends ErrorApp {
    constructor(mensaje = 'Datos inválidos', detalles = null) {
        super(mensaje, 400, true);
        this.detalles = detalles;
    }
}

module.exports = ErrorValidacion;
