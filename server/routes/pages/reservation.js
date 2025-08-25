const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const filePath = path.join(__dirname, '../../data/reservations.json');

// Affichage du formulaire
router.get('/', (req, res) => {
  res.render('pages/reservation', { title: 'Réservation – La Hora' });
});

// Traitement du formulaire
router.post('/', (req, res) => {
  const { firstname, lastname, email, phone, date, time, people, message } = req.body;

  if (!firstname || !lastname || !email || !date || !time || !people) {
    return res.status(400).send("Champs requis manquants.");
  }

  const newReservation = {
    id: Date.now(),
    firstname,
    lastname,
    email,
    phone,
    date,
    time,
    people,
    message: message || '',
  };

  fs.readFile(filePath, 'utf-8', (err, data) => {
    const reservations = err ? [] : JSON.parse(data);
    reservations.push(newReservation);

    fs.writeFile(filePath, JSON.stringify(reservations, null, 2), (err) => {
      if (err) {
        console.error('❌ Erreur lors de l’enregistrement :', err);
        return res.status(500).send('Erreur serveur.');
      }

      console.log("✅ Réservation enregistrée :", newReservation);
      res.redirect('/reservation/confirmation');
    });
  });
});

// Page de confirmation
router.get('/confirmation', (req, res) => {
  res.render('confirmation', { title: 'Confirmation – La Hora' });
});

module.exports = router;
