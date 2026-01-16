const express = require('express');
const { z } = require('zod');
const AuthController = require('../controllers/AuthController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { loginLimiter, recoveryLimiter } = require('../middleware/rateLimit');

const router = express.Router();

// Esquemas de validación con Zod
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

// Rutas
router.post(
    '/login',
    loginLimiter,
    validate(loginSchema),
    AuthController.login.bind(AuthController)
);

router.post(
    '/change-password',
    auth,
    validate(changePasswordSchema),
    AuthController.changePassword.bind(AuthController)
);

router.post(
    '/recover',
    recoveryLimiter,
    validate(recoverSchema),
    AuthController.recover.bind(AuthController)
);

router.post(
    '/recover/change',
    validate(resetPasswordSchema),
    AuthController.resetPassword.bind(AuthController)
);

module.exports = router;
