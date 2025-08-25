// 📁 routes/carte.js
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../../../data/carte.json');

// Fonction utilitaire pour déterminer le moment
function getMomentFromHour(hour) {
  if (hour >= 6 && hour < 11) return 'matin';
  if ((hour >= 11 && hour <= 23) || (hour >= 0 && hour < 2)) return 'soir';
  return 'soir'; // fallback par défaut
}

// 🔁 Route intermédiaire de sélection visuelle (carte-selection)
router.get('/carte-selection', (req, res) => {
  const hour = new Date().getHours();
  const moment = getMomentFromHour(hour);
  res.render('pages/carte-selection', { title: 'Carte - Choix du moment', moment });
});

// 🚀 Redirection automatique si le moment n'est pas précisé
router.get('/carte', (req, res) => {
  const moment = req.query.moment;

  if (!moment) {
    const hour = new Date().getHours();
    const momentAuto = getMomentFromHour(hour);
    return res.redirect(`/carte?moment=${momentAuto}`);
  }

  const carteData = JSON.parse(fs.readFileSync(filePath));
  const carte = carteData[moment] || [];

  res.render('pages/carte', { moment, carte });
});

module.exports = router;
