// 📁 server/routes/pages/reservation.js
const express = require('express');
const router = express.Router();
const Reservation = require('../../models/Reservation'); // <-- modèle Mongoose

// Affichage du formulaire
router.get('/', (req, res) => {
  res.render('pages/reservation', { title: 'Réservation – La Hora' });
});

// Traitement du formulaire (MongoDB)
router.post('/', async (req, res, next) => {
  try {
    const { firstname, lastname, email, phone, date, time, people, message } = req.body;

    // ✅ validations minimales (côté serveur)
    if (!firstname || !lastname || !email || !date || !time || !people) {
      return res.status(400).send('Champs requis manquants.');
    }

    const payload = {
      firstname: String(firstname).trim(),
      lastname:  String(lastname).trim(),
      email:     String(email).trim(),
      phone:     String(phone || '').trim(),
      date:      String(date).trim(),  // ex: "2025-09-10"
      time:      String(time).trim(),  // ex: "19:30"
      people:    Number(people),
      message:   String(message || '').trim(),
      status:    'pending', // par défaut
    };

    const saved = await Reservation.create(payload);

    console.log('✅ Réservation enregistrée (Mongo):', {
      _id: saved._id.toString(),
      date: saved.date,
      time: saved.time,
      people: saved.people,
    });

    // Option A: page de confirmation dédiée
    return res.redirect(`/reservation/confirmation?id=${saved._id}`);

    // Option B (si souhaité): retour à l’accueil avec un flag
    // return res.redirect('/?reserved=1');
  } catch (err) {
    console.error('❌ Erreur enregistrement réservation:', err.message);
    return next(err);
  }
});

// Page de confirmation
router.get('/confirmation', async (req, res, next) => {
  try {
    const { id } = req.query;
    let reservation = null;

    if (id) {
      reservation = await Reservation.findById(id).lean();
    }

    // ⚠️ ajuste le chemin de ta vue selon ton arborescence
    res.render('pages/confirmation', {
      title: 'Confirmation – La Hora',
      reservation, // dispo dans la vue si tu veux afficher un récap
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
