const express = require('express');
const DocumentController = require('../controllers/DocumentController');
const auth = require('../middleware/auth');
const { uploadDocument } = require('../config/multer');

const router = express.Router();

// Ruta para thumbnails (debe ir antes de '/' para evitar conflictos)
router.get('/thumbnail/:filename', DocumentController.getThumbnail.bind(DocumentController));

// Rutas de documentos
router.post(
    '/',
    auth,
    uploadDocument.single('doc'),
    DocumentController.createDocument.bind(DocumentController)
);

router.get('/', DocumentController.listDocuments.bind(DocumentController));

router.delete('/:id', auth, DocumentController.deleteDocument.bind(DocumentController));

module.exports = router;
