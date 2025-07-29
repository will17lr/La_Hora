const express = require('express');
const router = express.Router();
const carteController = require('../../controllers/carteController');

router.get('/', carteController.getCarte);

module.exports = router;
