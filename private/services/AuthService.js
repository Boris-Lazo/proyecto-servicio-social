const bcrypt = require('bcryptjs');
const { generateToken } = require('../config/jwt');
const { UnauthorizedError, NotFoundError, ValidationError } = require('../errors');

/**
 * Servicio de autenticación
 */
class AuthService {
    /**
     * @param {UserRepository} userRepository
     * @param {PasswordResetRepository} passwordResetRepository
     * @param {MailService} mailService
     */
    constructor(userRepository, passwordResetRepository, mailService) {
        this.userRepository = userRepository;
        this.passwordResetRepository = passwordResetRepository;
        this.mailService = mailService;
    }

    /**
     * Autentica un usuario y genera un token JWT
     */
    async login(email, password) {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new UnauthorizedError('Credenciales inválidas');
        }

        const isValid = await bcrypt.compare(password, user.hash);
        if (!isValid) {
            throw new UnauthorizedError('Credenciales inválidas');
        }

        return generateToken({
            userId: user.id,
            email: user.user,
        });
    }

    /**
     * Cambia la contraseña de un usuario
     */
    async changePassword(email, oldPassword, newPassword) {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new NotFoundError('Usuario no encontrado');
        }

        const isValid = await bcrypt.compare(oldPassword, user.hash);
        if (!isValid) {
            throw new UnauthorizedError('Contraseña actual incorrecta');
        }

        const newHash = await bcrypt.hash(newPassword, 10);
        await this.userRepository.updatePassword(email, newHash);
    }

    /**
     * Solicita un reset de contraseña
     */
    async requestPasswordReset(email) {
        const user = await this.userRepository.findByEmail(email);
        if (!user) return;

        const token = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 15 * 60 * 1000;

        await this.passwordResetRepository.create(email, token, expiresAt);
        await this.mailService.sendRecoveryCode(email, token);
    }

    /**
     * Resetea la contraseña usando un token
     */
    async resetPassword(token, newPassword) {
        const resetRecord = await this.passwordResetRepository.findByToken(token);
        if (!resetRecord) {
            throw new ValidationError('Token inválido o expirado');
        }

        if (Date.now() > resetRecord.expires_at) {
            await this.passwordResetRepository.deleteByToken(token);
            throw new ValidationError('Token expirado');
        }

        const newHash = await bcrypt.hash(newPassword, 10);
        await this.userRepository.updatePassword(resetRecord.user_email, newHash);
        await this.passwordResetRepository.deleteByToken(token);
    }
}

module.exports = AuthService;
