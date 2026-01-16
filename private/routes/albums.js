const express = require('express');
const AlbumController = require('../controllers/AlbumController');
const auth = require('../middleware/auth');
const { uploadAlbum } = require('../config/multer');

const router = express.Router();

// Rutas de álbumes
router.post(
    '/',
    auth,
    uploadAlbum.array('fotos', 30),
    AlbumController.createAlbum.bind(AlbumController)
);

router.get('/', AlbumController.listAlbums.bind(AlbumController));

router.delete('/:id', auth, AlbumController.deleteAlbum.bind(AlbumController));

module.exports = router;
