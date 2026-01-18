const express = require('express');
const { z } = require('zod');
const { controladorAutenticacion } = require('../contenedor');
const autenticacion = require('../intermediarios/autenticacion');
const validador = require('../intermediarios/validador');
const { limitadorSesion, limitadorRecuperacion } = require('../intermediarios/limitePeticiones');

const router = express.Router();

// Esquemas de validación
const esquemaSesion = z.object({
    usuario: z.string().email('Email inválido').min(1, 'Email requerido'),
    contrasena: z.string().min(1, 'Contraseña requerida'),
});

const esquemaCambioClave = z.object({
    viejaClave: z.string().min(1, 'Contraseña actual requerida'),
    nuevaClave: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
});

const esquemaRecuperacion = z.object({
    correo: z.string().email('Email inválido').min(1, 'Email requerido'),
});

const esquemaRestablecimiento = z.object({
    tokenTemporal: z.string().min(1, 'Token requerido'),
    nuevaClave: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

// Rutas vinculadas a la instancia del controlador
router.post(
    '/login',
    limitadorSesion,
    validador(esquemaSesion),
    (req, res, next) => controladorAutenticacion.iniciarSesion(req, res, next)
);

router.post(
    '/change-password',
    autenticacion,
    validador(esquemaCambioClave),
    (req, res, next) => controladorAutenticacion.cambiarContrasena(req, res, next)
);

router.post(
    '/recover',
    limitadorRecuperacion,
    validador(esquemaRecuperacion),
    (req, res, next) => controladorAutenticacion.recuperar(req, res, next)
);

router.post(
    '/recover/change',
    validador(esquemaRestablecimiento),
    (req, res, next) => controladorAutenticacion.restablecerContrasena(req, res, next)
);

module.exports = router;
