const { verificarToken } = require('../configuracion/jwt');
const { ErrorNoAutorizado } = require('../errores/indice');

/**
 * Middleware de autenticación
 * Verifica que el token JWT sea válido
 */
module.exports = (req, res, next) => {
  const encabezado = req.headers.authorization;

  if (!encabezado) {
    return next(new ErrorNoAutorizado('Se requiere token'));
  }

  try {
    const token = encabezado.split(' ')[1];
    const decodificado = verificarToken(token);

    // Agregar email del usuario a la petición
    req.user = decodificado.correo;
    req.userId = decodificado.idUsuario;

    next();
  } catch (error) {
    next(new ErrorNoAutorizado('Token inválido'));
  }
};
