// server/routes/pages/about.js
const express = require('express');
const router = express.Router();

// const { renderAbout } = require('../../controllers/contact.controller');

router.get('/', (req, res) => {
  res.render('pages/about', { title: 'À propos – La Hora' });
});

module.exports = router;
