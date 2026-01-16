const AppError = require('./AppError');

/**
 * Error de autenticación/autorización (HTTP 401)
 */
class UnauthorizedError extends AppError {
    constructor(message = 'No autorizado') {
        super(message, 401, true);
    }
}

module.exports = UnauthorizedError;
