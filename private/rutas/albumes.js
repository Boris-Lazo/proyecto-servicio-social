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
    (req, res, next) => controladorAlbum.crearAlbum(req, res, next)
);

router.get('/', (req, res, next) => controladorAlbum.listarAlbumes(req, res, next));

router.delete('/:id', autenticacion, (req, res, next) => controladorAlbum.eliminarAlbum(req, res, next));

module.exports = router;
