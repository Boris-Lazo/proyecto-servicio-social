const express = require('express');
const { z } = require('zod');
const { controladorAutenticacion } = require('../contenedor');
const autenticacion = require('../intermediarios/autenticacion');
const validador = require('../intermediarios/validador');
const { limitadorSesion, limitadorRecuperacion } = require('../intermediarios/limitePeticiones');

const {
    esquemaSesion,
    esquemaCambioClave,
    esquemaRecuperacion,
    esquemaRestablecimiento
} = require('../validaciones/esquemas');

const router = express.Router();

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
