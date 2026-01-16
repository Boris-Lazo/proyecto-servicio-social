const express = require('express');
const authRoutes = require('./auth');
const albumRoutes = require('./albums');
const documentRoutes = require('./documents');

const router = express.Router();

// Montar todas las rutas
router.use('/api', authRoutes);
router.use('/api/albums', albumRoutes);
router.use('/api/docs', documentRoutes);

module.exports = router;
