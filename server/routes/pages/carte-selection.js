// server/routes/pages/carteSelection.js
const express = require('express');
const router = express.Router();

// GET /carte-selection
router.get('/', (req, res) => {
  console.log('➡️ GET /carte-selection');
  res.render('pages/carte-selection', { title: 'Carte — Sélection' });
});

module.exports = router;
