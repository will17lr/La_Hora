const express = require('express');
const router = express.Router();

// GET /carte-selection
router.get('/', (req, res) => {
  const hour = new Date().getHours();
  const moment = (hour >= 6 && hour < 11) ? 'matin' : 'soir';
  res.render('pages/carte-selection', { title: 'Carte - Choix du moment', moment });
});

module.exports = router;
