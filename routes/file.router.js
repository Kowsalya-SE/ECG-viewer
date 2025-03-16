const express = require('express');
const multer = require('multer');
const router = express.Router();
const fileController = require('../controllers/file.controller.js');

const upload = multer({
    storage : multer.memoryStorage(),
    limits: {fileSize : 500 * 1024 * 1024},
});

router.post('/upload-edf', upload.any('file'), fileController.uploadFile)
router.post('/files-lists',fileController.getFiles);

module.exports = router;