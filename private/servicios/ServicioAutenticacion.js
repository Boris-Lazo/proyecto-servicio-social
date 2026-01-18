const bcrypt = require('bcryptjs');
const { generarToken } = require('../configuracion/jwt');
const { ErrorNoAutorizado, ErrorNoEncontrado, ErrorValidacion } = require('../errores/indice');

/**
 * Servicio de autenticación
 */
class ServicioAutenticacion {
    /**
     * @param {RepositorioUsuario} repositorioUsuario
     * @param {RepositorioRestablecimientoClave} repositorioRestablecimientoClave
     * @param {ServicioCorreo} servicioCorreo
     */
    constructor(repositorioUsuario, repositorioRestablecimientoClave, servicioCorreo) {
        this.repositorioUsuario = repositorioUsuario;
        this.repositorioRestablecimientoClave = repositorioRestablecimientoClave;
        this.servicioCorreo = servicioCorreo;
    }

    /**
     * Autentica un usuario y genera un token JWT
     */
    async iniciarSesion(correo, contrasena) {
        const usuario = await this.repositorioUsuario.obtenerPorCorreo(correo);
        if (!usuario) {
            throw new ErrorNoAutorizado('Credenciales inválidas');
        }

        const esValido = await bcrypt.compare(contrasena, usuario.hash);
        if (!esValido) {
            throw new ErrorNoAutorizado('Credenciales inválidas');
        }

        return generarToken({
            idUsuario: usuario.id,
            correo: usuario.user,
        });
    }

    /**
     * Cambia la contraseña de un usuario
     */
    async cambiarContrasena(correo, viejaClave, nuevaClave) {
        const usuario = await this.repositorioUsuario.obtenerPorCorreo(correo);
        if (!usuario) {
            throw new ErrorNoEncontrado('Usuario no encontrado');
        }

        const esValido = await bcrypt.compare(viejaClave, usuario.hash);
        if (!esValido) {
            throw new ErrorNoAutorizado('Contraseña actual incorrecta');
        }

        const nuevoHash = await bcrypt.hash(nuevaClave, 10);
        await this.repositorioUsuario.actualizarContrasena(correo, nuevoHash);
    }

    /**
     * Solicita un reset de contraseña
     */
    async solicitarRestablecimiento(correo) {
        const usuario = await this.repositorioUsuario.obtenerPorCorreo(correo);
        if (!usuario) return;

        const token = Math.floor(100000 + Math.random() * 900000).toString();
        const expiraEn = Date.now() + 15 * 60 * 1000;

        await this.repositorioRestablecimientoClave.crear(correo, token, expiraEn);
        await this.servicioCorreo.enviarCodigoRecuperacion(correo, token);
    }

    /**
     * Resetea la contraseña usando un token
     */
    async restablecerContrasena(token, nuevaClave) {
        const registro = await this.repositorioRestablecimientoClave.obtenerPorToken(token);
        if (!registro) {
            throw new ErrorValidacion('Token inválido o expirado');
        }

        if (Date.now() > registro.expires_at) {
            await this.repositorioRestablecimientoClave.eliminarPorToken(token);
            throw new ErrorValidacion('Token expirado');
        }

        const nuevoHash = await bcrypt.hash(nuevaClave, 10);
        await this.repositorioUsuario.actualizarContrasena(registro.user_email, nuevoHash);
        await this.repositorioRestablecimientoClave.eliminarPorToken(token);
    }
}

module.exports = ServicioAutenticacion;
