const { z } = require('zod');
const { ErrorValidacion } = require('../errores/indice');

/**
 * Middleware genérico de validación usando Zod
 * @param {z.ZodSchema} esquema - Esquema de validación Zod
 * @returns {Function} Middleware de Express
 */
const validador = (esquema) => {
    return (peticion, respuesta, siguiente) => {
        try {
            // Validar el body de la petición
            const validado = esquema.parse(peticion.body);

            // Reemplazar peticion.body con los datos validados y transformados
            peticion.body = validado;

            siguiente();
        } catch (error) {
            if (error instanceof z.ZodError) {
                // Formatear errores de Zod de manera legible
                const detalles = error.errors.map((err) => ({
                    campo: err.path.join('.'),
                    mensaje: err.message,
                }));

                siguiente(new ErrorValidacion('Datos de entrada inválidos', detalles));
            } else {
                siguiente(error);
            }
        }
    };
};

module.exports = validador;
