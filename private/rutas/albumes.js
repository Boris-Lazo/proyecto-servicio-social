const express = require('express');
const { controladorAlbum } = require('../contenedor');
const autenticacion = require('../intermediarios/autenticacion');
const { subidaAlbum } = require('../configuracion/multer');

const { esquemaAlbum } = require('../validaciones/esquemas');
const validador = require('../intermediarios/validador');

const router = express.Router();

router.post(
    '/',
    autenticacion,
    subidaAlbum.array('fotos', 30),
    validador(esquemaAlbum),
    (peticion, respuesta, siguiente) => controladorAlbum.crearAlbum(peticion, respuesta, siguiente)
);

router.get('/', (peticion, respuesta, siguiente) => controladorAlbum.listarAlbumes(peticion, respuesta, siguiente));

router.delete('/:id', autenticacion, (peticion, respuesta, siguiente) => controladorAlbum.eliminarAlbum(peticion, respuesta, siguiente));

module.exports = router;
