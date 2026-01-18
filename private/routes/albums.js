const express = require('express');
const { albumController } = require('../container');
const auth = require('../middleware/auth');
const { uploadAlbum } = require('../config/multer');

const router = express.Router();

router.post(
    '/',
    auth,
    uploadAlbum.array('fotos', 30),
    (req, res, next) => albumController.createAlbum(req, res, next)
);

router.get('/', (req, res, next) => albumController.listAlbums(req, res, next));

router.delete('/:id', auth, (req, res, next) => albumController.deleteAlbum(req, res, next));

module.exports = router;
