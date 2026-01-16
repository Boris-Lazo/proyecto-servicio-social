/**
 * Exportación centralizada de todas las clases de error
 */
module.exports = {
    AppError: require('./AppError'),
    NotFoundError: require('./NotFoundError'),
    UnauthorizedError: require('./UnauthorizedError'),
    ValidationError: require('./ValidationError'),
};
