// server/controllers/pages/carte.controller.js
const { getCarteAll, getCarteByMoment } = require('../../services/carte.service');

function hourInParis(date = new Date()) {
  const f = new Intl.DateTimeFormat('fr-FR', {
    hour: 'numeric',
    hour12: false,
    timeZone: 'Europe/Paris'
  });
  return Number(f.format(date));
}

function pickMoment(q) {
  const m = String(q || '').toLowerCase();
  if (m === 'matin' || m === 'soir' || m === 'all') return m;
  const h = hourInParis();
  return (h >= 6 && h < 11) ? 'matin' : 'soir';
}

async function renderCarte(req, res, next) {
  try {
    const moment = pickMoment(req.query.moment);
    let carte;
    if (moment === 'all') {
      carte = await getCarteAll();               // { matin:{...}, soir:{...} }
    } else {
      const part = await getCarteByMoment(moment); // { cat: [...] }
      carte = { [moment]: part };
    }

    // 🔎 log de debug
    console.log('[CARTE DEBUG]',
      'moment =', moment,
      '| matin cats =', Object.keys(carte.matin || {}),
      '| soir cats =', Object.keys(carte.soir || {})
    );

    res.render('pages/carte', { title: 'Carte', moment, carte });
  } catch (err) {
    next(err);
  }
}

module.exports = { renderCarte };
