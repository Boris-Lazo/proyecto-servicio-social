const express = require('express');
const rutasAutenticacion = require('./autenticacion');
const rutasAlbumes = require('./albumes');
const rutasDocumentos = require('./documentos');

const router = express.Router();

// Montar todas las rutas en español
router.use('/api', rutasAutenticacion);
router.use('/api/albumes', rutasAlbumes);
router.use('/api/documentos', rutasDocumentos);

module.exports = router;
