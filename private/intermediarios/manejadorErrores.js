const fs = require('fs');
const path = require('path');
const { ErrorApp } = require('../errores/indice');

const flujoLog = fs.createWriteStream(path.join(__dirname, '..', 'error.log'), { flags: 'a' });

/**
 * Middleware global de manejo de errores
 * Distingue entre errores operacionales y de programación
 */
function manejadorErrores(error, peticion, respuesta, siguiente) {
  // Valores por defecto
  let codigoEstado = error.statusCode || error.status || 500;
  let mensaje = error.message || 'Error interno del servidor';
  let esOperacional = error.esOperacional || false;

  // Si es un error operacional (esperado), loguear solo el mensaje
  if (esOperacional) {
    const mensajeLog = `[${new Date().toISOString()}] ${peticion.method} ${peticion.url} - ${codigoEstado} - ${mensaje}\n`;
    flujoLog.write(mensajeLog);
    console.error(mensajeLog);
  } else {
    // Si es un error de programación (inesperado), loguear stack completo
    const mensajeLog = `[${new Date().toISOString()}] ${peticion.method} ${peticion.url} - ${codigoEstado} - ${mensaje}\nStack: ${error.stack}\n`;
    flujoLog.write(mensajeLog);
    console.error('❌ Error de programación:', error);

    // En producción, no revelar detalles de errores de programación
    if (process.env.NODE_ENV === 'production') {
      mensaje = 'Error interno del servidor';
    }
  }

  // Formato de respuesta
  const datosRespuesta = {
    error: mensaje,
  };

  // Agregar detalles de validación si existen
  if (error.detalles) {
    datosRespuesta.detalles = error.detalles;
  }

  respuesta.status(codigoEstado).json(datosRespuesta);
}

module.exports = manejadorErrores;
