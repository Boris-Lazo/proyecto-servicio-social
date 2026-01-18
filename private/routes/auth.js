const express = require('express');
const { z } = require('zod');
const { authController } = require('../container');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { loginLimiter, recoveryLimiter } = require('../middleware/rateLimit');

const router = express.Router();

// Esquemas de validación
const loginSchema = z.object({
    user: z.string().email('Email inválido').min(1, 'Email requerido'),
    password: z.string().min(1, 'Contraseña requerida'),
});

const changePasswordSchema = z.object({
    oldPass: z.string().min(1, 'Contraseña actual requerida'),
    newPass: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
});

const recoverSchema = z.object({
    email: z.string().email('Email inválido').min(1, 'Email requerido'),
});

const resetPasswordSchema = z.object({
    tempToken: z.string().min(1, 'Token requerido'),
    newPass: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

// Rutas vinculadas a la instancia del controlador
router.post(
    '/login',
    loginLimiter,
    validate(loginSchema),
    (req, res, next) => authController.login(req, res, next)
);

router.post(
    '/change-password',
    auth,
    validate(changePasswordSchema),
    (req, res, next) => authController.changePassword(req, res, next)
);

router.post(
    '/recover',
    recoveryLimiter,
    validate(recoverSchema),
    (req, res, next) => authController.recover(req, res, next)
);

router.post(
    '/recover/change',
    validate(resetPasswordSchema),
    (req, res, next) => authController.resetPassword(req, res, next)
);

module.exports = router;
