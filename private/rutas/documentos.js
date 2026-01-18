const express = require('express');
const { controladorDocumento } = require('../contenedor');
const autenticacion = require('../intermediarios/autenticacion');
const { subidaDocumento } = require('../configuracion/multer');

const router = express.Router();

router.get('/thumbnail/:nombreArchivo', (req, res, next) => controladorDocumento.obtenerMiniatura(req, res, next));

router.post(
    '/',
    autenticacion,
    subidaDocumento.single('doc'),
    (req, res, next) => controladorDocumento.crearDocumento(req, res, next)
);

router.get('/', (req, res, next) => controladorDocumento.listarDocumentos(req, res, next));

router.delete('/:id', autenticacion, (req, res, next) => controladorDocumento.eliminarDocumento(req, res, next));

module.exports = router;
