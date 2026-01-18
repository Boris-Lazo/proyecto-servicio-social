const express = require('express');
const rutasAutenticacion = require('./autenticacion');
const rutasAlbumes = require('./albumes');
const rutasDocumentos = require('./documentos');

const router = express.Router();

// Montar todas las rutas
router.use('/api', rutasAutenticacion);
router.use('/api/albums', rutasAlbumes);
router.use('/api/docs', rutasDocumentos);

module.exports = router;
