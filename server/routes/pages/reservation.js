// server/routes/pages/reservation.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); // ✅ pour valider l'ObjectId
const { getReservationPage, postReservation } = require('../../controllers/reservation.controller');
const Reservation = require('../../models/reservation.model'); // charger une fois en haut

// Affichage du formulaire
router.get('/', getReservationPage);

// Traitement du formulaire (POST /reservation)
router.post('/', postReservation);

// Page de confirmation
router.get('/confirmation', async (req, res, next) => {
  try {
    const { id } = req.query || {};
    const title = 'Confirmation – La Hora';

    // Pas d'ID → on rend la page sans récap, avec un message doux
    if (!id) {
      return res.status(200).render('pages/confirmation', {
        title,
        reservation: null,
        error: "Aucune réservation à afficher (identifiant manquant)."
      });
    }

    // ✅ Id invalide → on évite le CastError et on rend un message propre
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(200).render('pages/confirmation', {
        title,
        reservation: null,
        error: "Identifiant de réservation invalide."
      });
    }

    const reservation = await Reservation.findById(id).lean().exec();

    // Introuvable → on rend quand même la page sans planter
    if (!reservation) {
      return res.status(200).render('pages/confirmation', {
        title,
        reservation: null,
        error: "Réservation introuvable."
      });
    }

    // OK → on affiche le récap
    return res.status(200).render('pages/confirmation', {
      title,
      reservation,
      error: null
    });
  } catch (err) {
    console.error('[confirmation] error:', err);
    return next(err);
  }
});

module.exports = router;
