const express = require('express');
const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const type = req.query.type === 'contact' ? 'contact' : 'reservation';
    const id = req.query.id;
    let reservation = null;
    let error = null;

    // On ne tente de lire une réservation que pour le flux "reservation" ET si id fourni
    if (type !== 'contact' && id) {
      try {
        const Reservation = require('../../models/reservation.model');
        if (Reservation && typeof Reservation.findById === 'function') {
          reservation = await Reservation.findById(id).lean();
          if (!reservation) error = 'Réservation introuvable.';
        }
      } catch (e) {
        // id invalide, modèle absent, etc. -> on n’explose pas la vue
        error = 'Identifiant invalide ou indisponible.';
      }
    }

    return res.status(200).render('pages/confirmation', {
      title: 'Confirmation — La Hora',
      type,
      reservation, // peut être null
      error        // peut être null
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
