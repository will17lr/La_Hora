// server/routes/pages/carte.js
const express = require('express');
const router = express.Router();

// 🔁 attention au chemin: controllers/pages/...
const ctrl = require('../../controllers/carte.controller');

console.log('[CARTE ROUTE] typeof renderCarte =', typeof ctrl?.renderCarte); // doit afficher "function"
router.get('/', ctrl.renderCarte);

module.exports = router;

