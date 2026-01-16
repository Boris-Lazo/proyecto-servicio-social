const { verifyToken } = require('../config/jwt');
const { UnauthorizedError } = require('../errors');

/**
 * Middleware de autenticación
 * Verifica que el token JWT sea válido
 */
module.exports = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header) {
    return next(new UnauthorizedError('Se requiere token'));
  }

  try {
    const token = header.split(' ')[1];
    const decoded = verifyToken(token);

    // Agregar email del usuario a la petición
    req.user = decoded.email;
    req.userId = decoded.userId;

    next();
  } catch (error) {
    next(new UnauthorizedError('Token inválido'));
  }
};

