const express = require('express');
const { documentController } = require('../container');
const auth = require('../middleware/auth');
const { uploadDocument } = require('../config/multer');

const router = express.Router();

router.get('/thumbnail/:filename', (req, res, next) => documentController.getThumbnail(req, res, next));

router.post(
    '/',
    auth,
    uploadDocument.single('doc'),
    (req, res, next) => documentController.createDocument(req, res, next)
);

router.get('/', (req, res, next) => documentController.listDocuments(req, res, next));

router.delete('/:id', auth, (req, res, next) => documentController.deleteDocument(req, res, next));

module.exports = router;
