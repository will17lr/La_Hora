const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/carte.controller');

router.get('/', ctrl.renderCarte);

module.exports = router;
