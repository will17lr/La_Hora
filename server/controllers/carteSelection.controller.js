// server/controllers/carteSelection.controller.js

function hourInParis(date = new Date()) {
  const f = new Intl.DateTimeFormat('fr-FR', {
    hour: 'numeric',
    hour12: false,
    timeZone: 'Europe/Paris'
  });

  return Number(f.format(date));
}

function momentFromHour(hour) {
  if (hour >= 6 && hour < 11) return 'matin';
  return 'soir';
}

function renderCarteSelection(req, res) {
  const { moment } = req.query;

  const allowed = ['matin', 'soir', 'all'];

  if (allowed.includes(moment)) {
    return res.redirect(`/carte?moment=${moment}`);
  }

  // Heure française
  const parisHour = hourInParis();

  console.log('[CARTE SELECTION]', 'Paris hour =', parisHour);

  const m = momentFromHour(parisHour);

  return res.redirect(`/carte?moment=${m}`);
}

module.exports = { renderCarteSelection };