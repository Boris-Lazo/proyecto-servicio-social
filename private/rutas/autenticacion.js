const express = require('express');
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
    (peticion, respuesta, siguiente) => controladorAutenticacion.iniciarSesion(peticion, respuesta, siguiente)
);

router.post(
    '/cambiar-clave',
    autenticacion,
    validador(esquemaCambioClave),
    (peticion, respuesta, siguiente) => controladorAutenticacion.cambiarContrasena(peticion, respuesta, siguiente)
);

router.post(
    '/recuperar',
    limitadorRecuperacion,
    validador(esquemaRecuperacion),
    (peticion, respuesta, siguiente) => controladorAutenticacion.recuperar(peticion, respuesta, siguiente)
);

router.post(
    '/recuperar/cambiar',
    validador(esquemaRestablecimiento),
    (peticion, respuesta, siguiente) => controladorAutenticacion.restablecerContrasena(peticion, respuesta, siguiente)
);

module.exports = router;
