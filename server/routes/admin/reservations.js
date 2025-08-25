const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const filePath = path.join(__dirname, '../../../data/reservations.json');

// GET : afficher toutes les réservations
router.get('/', (req, res) => {
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) return res.status(500).send('Erreur serveur');
    
    let reservations = [];
    try {
      reservations = JSON.parse(data || '[]');
    } catch (e) {
      console.error('Erreur JSON :', e.message);
      return res.status(500).send('Erreur de format de données.');
    }

    res.render('admin/reservations', { title: 'Admin – La Hora', reservations });
  });
});

// POST : suppression d'une réservation
router.post('/delete/:id', (req, res) => {
  const idToDelete = parseInt(req.params.id);

  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) return res.status(500).send('Erreur lecture');

    let reservations = [];
    try {
      reservations = JSON.parse(data || '[]');
    } catch (e) {
      return res.status(500).send('Erreur de format JSON');
    }

    reservations = reservations.filter(r => r.id !== idToDelete);

    fs.writeFile(filePath, JSON.stringify(reservations, null, 2), err => {
      if (err) return res.status(500).send('Erreur écriture');
      res.redirect('/admin/reservations');
    });
  });
});

module.exports = router;
