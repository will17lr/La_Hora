// server/routes/pages/carteSelection.js
const express = require('express');
const router = express.Router();

/**
 * Règles :
 * - Par défaut, on choisit le moment selon l'heure Europe/Paris :
 *   matin = [06:00, 11:00) ; sinon soir
 * - Override possible :
 *   /carte-selection?moment=matin  ou  ?moment=soir
 */
router.get('/', (req, res) => {
  // 1) Override manuel
  const q = (req.query.moment || '').toLowerCase();
  if (q === 'matin' || q === 'soir') {
    return res.render('pages/carte-selection', {
      title: 'Carte — Choix du moment',
      moment: q
    });
  }

  // 2) Calcul automatique en Europe/Paris (fiable même si le serveur n'est pas en France)
  const hourParis = parseInt(
    new Intl.DateTimeFormat('fr-FR', {
      timeZone: 'Europe/Paris',
      hour: '2-digit',
      hourCycle: 'h23'
    }).format(new Date()),
    10
  );

  const moment = (hourParis >= 6 && hourParis < 11) ? 'matin' : 'soir';

  res.render('pages/carte-selection', {
    title: 'Carte — Choix du moment',
    moment
  });
});

module.exports = router;
