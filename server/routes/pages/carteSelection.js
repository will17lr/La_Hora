// server/routes/pages/carteSelection.js
const express = require('express');
const router = express.Router();
const { renderCarteSelection } = require('../../controllers/carteSelection.controller');

router.get('/', renderCarteSelection);
module.exports = router;
