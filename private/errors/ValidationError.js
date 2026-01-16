const AppError = require('./AppError');

/**
 * Error de validación de datos (HTTP 400)
 */
class ValidationError extends AppError {
    constructor(message = 'Datos inválidos', details = null) {
        super(message, 400, true);
        this.details = details;
    }
}

module.exports = ValidationError;
