const fs = require('fs');
const path = require('path');
const { ErrorApp } = require('../errores/indice');

const flujoLog = fs.createWriteStream(path.join(__dirname, '..', 'error.log'), { flags: 'a' });

/**
 * Middleware global de manejo de errores
 * Distingue entre errores operacionales y de programación
 */
function manejadorErrores(err, req, res, next) {
  // Valores por defecto
  let codigoEstado = err.statusCode || err.status || 500;
  let mensaje = err.message || 'Error interno del servidor';
  let esOperacional = err.esOperacional || false;

  // Si es un error operacional (esperado), loguear solo el mensaje
  if (esOperacional) {
    const mensajeLog = `[${new Date().toISOString()}] ${req.method} ${req.url} - ${codigoEstado} - ${mensaje}\n`;
    flujoLog.write(mensajeLog);
    console.error(mensajeLog);
  } else {
    // Si es un error de programación (inesperado), loguear stack completo
    const mensajeLog = `[${new Date().toISOString()}] ${req.method} ${req.url} - ${codigoEstado} - ${mensaje}\nStack: ${err.stack}\n`;
    flujoLog.write(mensajeLog);
    console.error('❌ Error de programación:', err);

    // En producción, no revelar detalles de errores de programación
    if (process.env.NODE_ENV === 'production') {
      mensaje = 'Error interno del servidor';
    }
  }

  // Formato de respuesta
  const respuesta = {
    error: mensaje,
  };

  // Agregar detalles de validación si existen
  if (err.detalles) {
    respuesta.detalles = err.detalles;
  }

  res.status(codigoEstado).json(respuesta);
}

module.exports = manejadorErrores;
