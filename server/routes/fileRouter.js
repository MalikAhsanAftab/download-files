const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');

// Define routes
router.get('/status/:requestId', fileController.getStatus);

router.get('/objects', fileController.getObjectList);

router.post('/create-zip', fileController.generateZip);


module.exports = router;
