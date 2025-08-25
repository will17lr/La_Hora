const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('pages/about', { title: 'À propos – La Hora' });
});

module.exports = router;
