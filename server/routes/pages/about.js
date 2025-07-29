const express = require('express');
const router = express.Router();

router.get('/about', (req, res) => {
  res.render('pages/about', { title: 'À propos de nous' });
});

module.exports = router;
