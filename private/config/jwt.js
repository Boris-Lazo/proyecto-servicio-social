const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const jwt = require('jsonwebtoken');

/**
 * Configuración centralizada de JWT
 */
const JWT_CONFIG = {
    secret: process.env.JWT_SECRET,
    issuer: 'escuela-api',
    audience: 'escuela-frontend',
    expiresIn: '7d',
};

/**
 * Genera un token JWT para un usuario
 * @param {Object} payload - Datos a incluir en el token
 * @param {string} payload.userId - ID del usuario
 * @param {string} payload.email - Email del usuario
 * @returns {string} Token JWT firmado
 */
function generateToken(payload) {
    return jwt.sign(
        {
            userId: payload.userId,
            email: payload.email,
        },
        JWT_CONFIG.secret,
        {
            expiresIn: JWT_CONFIG.expiresIn,
            issuer: JWT_CONFIG.issuer,
            audience: JWT_CONFIG.audience,
        }
    );
}

/**
 * Verifica y decodifica un token JWT
 * @param {string} token - Token a verificar
 * @returns {Object} Payload decodificado
 * @throws {Error} Si el token es inválido
 */
function verifyToken(token) {
    return jwt.verify(token, JWT_CONFIG.secret, {
        issuer: JWT_CONFIG.issuer,
        audience: JWT_CONFIG.audience,
    });
}

module.exports = {
    JWT_CONFIG,
    generateToken,
    verifyToken,
};
