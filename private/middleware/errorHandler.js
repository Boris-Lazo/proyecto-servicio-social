const fs = require('fs');
const path = require('path');
const { AppError } = require('../errors');

const logStream = fs.createWriteStream(path.join(__dirname, '..', 'error.log'), { flags: 'a' });

/**
 * Middleware global de manejo de errores
 * Distingue entre errores operacionales y de programación
 * @param {Error} err - Error capturado
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @param {Function} next - Next middleware
 */
function errorHandler(err, req, res, next) {
  // Valores por defecto
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Error interno del servidor';
  let isOperational = err.isOperational || false;

  // Si es un error operacional (esperado), loguear solo el mensaje
  if (isOperational) {
    const logMessage = `[${new Date().toISOString()}] ${req.method} ${req.url} - ${statusCode} - ${message}\n`;
    logStream.write(logMessage);
    console.error(logMessage);
  } else {
    // Si es un error de programación (inesperado), loguear stack completo
    const logMessage = `[${new Date().toISOString()}] ${req.method} ${req.url} - ${statusCode} - ${message}\nStack: ${err.stack}\n`;
    logStream.write(logMessage);
    console.error('❌ Error de programación:', err);

    // En producción, no revelar detalles de errores de programación
    if (process.env.NODE_ENV === 'production') {
      message = 'Error interno del servidor';
    }
  }

  // Formato de respuesta
  const response = {
    error: message,
  };

  // Agregar detalles de validación si existen
  if (err.details) {
    response.details = err.details;
  }

  res.status(statusCode).json(response);
}

module.exports = errorHandler;
