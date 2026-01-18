const { z } = require('zod');
const { ErrorValidacion } = require('../errores/indice');

/**
 * Middleware genérico de validación usando Zod
 * @param {z.ZodSchema} esquema - Esquema de validación Zod
 * @returns {Function} Middleware de Express
 */
const validador = (esquema) => {
    return (req, res, next) => {
        try {
            // Validar el body de la petición
            const validado = esquema.parse(req.body);

            // Reemplazar req.body con los datos validados y transformados
            req.body = validado;

            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                // Formatear errores de Zod de manera legible
                const detalles = error.errors.map((err) => ({
                    campo: err.path.join('.'),
                    mensaje: err.message,
                }));

                next(new ErrorValidacion('Datos de entrada inválidos', detalles));
            } else {
                next(error);
            }
        }
    };
};

module.exports = validador;
