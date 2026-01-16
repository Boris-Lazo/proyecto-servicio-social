const AppError = require('./AppError');

/**
 * Error cuando un recurso no se encuentra (HTTP 404)
 */
class NotFoundError extends AppError {
    constructor(message = 'Recurso no encontrado') {
        super(message, 404, true);
    }
}

module.exports = NotFoundError;
