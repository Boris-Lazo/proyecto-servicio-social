const bcrypt = require('bcryptjs');
const UserRepository = require('../repositories/UserRepository');
const PasswordResetRepository = require('../repositories/PasswordResetRepository');
const MailService = require('./external/MailService');
const { generateToken } = require('../config/jwt');
const { UnauthorizedError, NotFoundError, ValidationError } = require('../errors');

/**
 * Servicio de autenticación
 * Maneja toda la lógica de negocio relacionada con autenticación
 */
class AuthService {
    constructor() {
        this.userRepository = new UserRepository();
        this.passwordResetRepository = new PasswordResetRepository();
    }

    /**
     * Autentica un usuario y genera un token JWT
     * @param {string} email - Email del usuario
     * @param {string} password - Contraseña del usuario
     * @returns {Promise<string>} Token JWT
     * @throws {UnauthorizedError} Si las credenciales son inválidas
     */
    async login(email, password) {
        // Buscar usuario
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new UnauthorizedError('Credenciales inválidas');
        }

        // Verificar contraseña
        const isValid = await bcrypt.compare(password, user.hash);
        if (!isValid) {
            throw new UnauthorizedError('Credenciales inválidas');
        }

        // Generar token
        const token = generateToken({
            userId: user.id,
            email: user.user,
        });

        return token;
    }

    /**
     * Cambia la contraseña de un usuario
     * @param {string} email - Email del usuario
     * @param {string} oldPassword - Contraseña actual
     * @param {string} newPassword - Nueva contraseña
     * @returns {Promise<void>}
     * @throws {UnauthorizedError} Si la contraseña actual es incorrecta
     * @throws {NotFoundError} Si el usuario no existe
     */
    async changePassword(email, oldPassword, newPassword) {
        // Buscar usuario
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new NotFoundError('Usuario no encontrado');
        }

        // Verificar contraseña actual
        const isValid = await bcrypt.compare(oldPassword, user.hash);
        if (!isValid) {
            throw new UnauthorizedError('Contraseña actual incorrecta');
        }

        // Generar hash de nueva contraseña
        const newHash = await bcrypt.hash(newPassword, 10);

        // Actualizar en BD
        await this.userRepository.updatePassword(email, newHash);
    }

    /**
     * Solicita un reset de contraseña (genera token y envía correo)
     * @param {string} email - Email del usuario
     * @returns {Promise<void>}
     */
    async requestPasswordReset(email) {
        // Buscar usuario
        const user = await this.userRepository.findByEmail(email);

        // Por seguridad, no revelar si el usuario existe o no
        // Pero solo enviar correo si existe
        if (!user) {
            return; // Retornar silenciosamente
        }

        // Generar token de 6 dígitos
        const token = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutos

        // Guardar token en BD
        await this.passwordResetRepository.create(email, token, expiresAt);

        // Enviar correo
        await MailService.sendRecoveryCode(email, token);
    }

    /**
     * Resetea la contraseña usando un token de recuperación
     * @param {string} token - Token de recuperación
     * @param {string} newPassword - Nueva contraseña
     * @returns {Promise<void>}
     * @throws {ValidationError} Si el token es inválido o expiró
     */
    async resetPassword(token, newPassword) {
        // Buscar token
        const resetRecord = await this.passwordResetRepository.findByToken(token);
        if (!resetRecord) {
            throw new ValidationError('Token inválido o expirado');
        }

        // Verificar si expiró
        if (Date.now() > resetRecord.expires_at) {
            // Limpiar token expirado
            await this.passwordResetRepository.deleteByToken(token);
            throw new ValidationError('Token expirado');
        }

        // Generar hash de nueva contraseña
        const newHash = await bcrypt.hash(newPassword, 10);

        // Actualizar contraseña
        await this.userRepository.updatePassword(resetRecord.user_email, newHash);

        // Eliminar token usado
        await this.passwordResetRepository.deleteByToken(token);
    }
}

module.exports = new AuthService();
