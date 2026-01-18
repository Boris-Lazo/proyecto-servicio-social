const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const jwt = require('jsonwebtoken');

/**
 * Configuración centralizada de JWT
 */
const CONFIG_JWT = {
    secreto: process.env.JWT_SECRET,
    emisor: 'escuela-api',
    audiencia: 'escuela-frontend',
    expiraEn: '7d',
};

/**
 * Genera un token JWT para un usuario
 */
function generarToken(payload) {
    return jwt.sign(
        {
            idUsuario: payload.idUsuario,
            correo: payload.correo,
        },
        CONFIG_JWT.secreto,
        {
            expiresIn: CONFIG_JWT.expiraEn,
            issuer: CONFIG_JWT.emisor,
            audience: CONFIG_JWT.audiencia,
        }
    );
}

/**
 * Verifica y decodifica un token JWT
 */
function verificarToken(token) {
    return jwt.verify(token, CONFIG_JWT.secreto, {
        issuer: CONFIG_JWT.emisor,
        audience: CONFIG_JWT.audiencia,
    });
}

module.exports = {
    CONFIG_JWT,
    generarToken,
    verificarToken,
};
