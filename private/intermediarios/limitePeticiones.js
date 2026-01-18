const rateLimit = require('express-rate-limit');

/**
 * Limitador para endpoints de inicio de sesión
 * 5 intentos por 15 minutos
 */
const limitadorSesion = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // 5 intentos
    message: {
        error: 'Demasiados intentos de inicio de sesión. Por favor, intenta de nuevo en 15 minutos.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Limitador para endpoints de recuperación de contraseña
 * 3 intentos por hora
 */
const limitadorRecuperacion = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 3, // 3 intentos
    message: {
        error: 'Demasiadas solicitudes de recuperación. Por favor, intenta de nuevo en 1 hora.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Limitador general para APIs
 * 100 peticiones por 15 minutos
 */
const limitadorApi = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // 100 peticiones
    message: {
        error: 'Demasiadas peticiones desde esta IP. Por favor, intenta de nuevo más tarde.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    limitadorSesion,
    limitadorRecuperacion,
    limitadorApi,
};
