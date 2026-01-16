const { z } = require('zod');
const { ValidationError } = require('../errors');

/**
 * Middleware genérico de validación usando Zod
 * @param {z.ZodSchema} schema - Esquema de validación Zod
 * @returns {Function} Middleware de Express
 */
const validate = (schema) => {
    return (req, res, next) => {
        try {
            // Validar el body de la petición
            const validated = schema.parse(req.body);

            // Reemplazar req.body con los datos validados y transformados
            req.body = validated;

            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                // Formatear errores de Zod de manera legible
                const details = error.errors.map((err) => ({
                    campo: err.path.join('.'),
                    mensaje: err.message,
                }));

                next(new ValidationError('Datos de entrada inválidos', details));
            } else {
                next(error);
            }
        }
    };
};

module.exports = validate;
