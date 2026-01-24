const express = require('express');
const { controladorDocumento } = require('../contenedor');
const autenticacion = require('../intermediarios/autenticacion');
const { subidaDocumento } = require('../configuracion/multer');

const { esquemaDocumento } = require('../validaciones/esquemas');
const validador = require('../intermediarios/validador');

const router = express.Router();

router.get('/miniatura/:nombreArchivo', (peticion, respuesta, siguiente) => controladorDocumento.obtenerMiniatura(peticion, respuesta, siguiente));

router.post(
    '/',
    autenticacion,
    subidaDocumento.single('doc'),
    validador(esquemaDocumento),
    (peticion, respuesta, siguiente) => controladorDocumento.crearDocumento(peticion, respuesta, siguiente)
);

router.get('/', (peticion, respuesta, siguiente) => controladorDocumento.listarDocumentos(peticion, respuesta, siguiente));

router.delete('/:id', autenticacion, (peticion, respuesta, siguiente) => controladorDocumento.eliminarDocumento(peticion, respuesta, siguiente));

module.exports = router;
