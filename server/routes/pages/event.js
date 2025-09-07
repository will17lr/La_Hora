const express = require('express');
const router = express.Router();

router.get('/event', (req, res) => {
  res.render('pages/event', { title: 'Événements' });
});

module.exports = router;
