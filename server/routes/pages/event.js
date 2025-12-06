// server/routes/pages/event.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('pages/event', { title: 'Événements - La Hora' });
});

module.exports = router;
