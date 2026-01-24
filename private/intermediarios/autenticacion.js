const { verificarToken } = require('../configuracion/jwt');
const { ErrorNoAutorizado } = require('../errores/indice');

/**
 * Middleware de autenticación
 * Verifica que el token JWT sea válido
 */
module.exports = (peticion, respuesta, siguiente) => {
  const encabezado = peticion.headers.authorization;

  if (!encabezado) {
    return siguiente(new ErrorNoAutorizado('Se requiere token'));
  }

  try {
    const token = encabezado.split(' ')[1];
    const decodificado = verificarToken(token);

    // Agregar datos del usuario a la petición en español
    peticion.correo = decodificado.correo;
    peticion.idUsuario = decodificado.idUsuario;

    siguiente();
  } catch (error) {
    siguiente(new ErrorNoAutorizado('Token inválido'));
  }
};
