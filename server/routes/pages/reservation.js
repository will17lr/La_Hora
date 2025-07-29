const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// GET formulaire
router.get('/', (req, res) => {
  res.render('pages/reservation', { title: 'Réservation – La Hora' });
});

// POST : enregistrement + redirection
router.post('/', (req, res) => {
  const newReservation = {
    id: Date.now(),
    ...req.body,
  };

  const filePath = path.join(__dirname, '../../data/reservations.json');

  fs.readFile(filePath, 'utf-8', (err, data) => {
    const reservations = err ? [] : JSON.parse(data);
    reservations.push(newReservation);

    fs.writeFile(filePath, JSON.stringify(reservations, null, 2), (err) => {
      if (err) {
        console.error('Erreur d’enregistrement :', err);
        return res.status(500).send('Erreur serveur');
      }
      res.redirect('/reservation/confirmation');
    });
  });
});

// Page de confirmation
router.get('/confirmation', (req, res) => {
  res.render('confirmation', { title: 'Confirmation – La Hora' });
});

module.exports = router;
