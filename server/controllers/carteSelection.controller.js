// server/controllers/carteSelection.controller.js
function momentFromHour(hour) {
  if (hour >= 6 && hour < 11) return 'matin';
  if ((hour >= 11 && hour <= 23) || (hour >= 0 && hour < 2)) return 'soir';
  return 'soir';
}

function renderCarteSelection(req, res) {
  const { moment } = req.query;
  const allowed = ['matin', 'soir', 'all'];
  if (allowed.includes(moment)) {
    return res.redirect(`/carte?moment=${moment}`);
  }
  // Si tu as une page visuelle :
  // return res.render('pages/carte-selection', { title: 'Choisir un moment' });

  // Sinon redirection auto selon l’heure :
  const m = momentFromHour(new Date().getHours());
  return res.redirect(`/carte?moment=${m}`);
}

module.exports = { renderCarteSelection };
