// server/controllers/carte.controller.js
const MenuItem = require('../models/menu.model');

const ORDER = {
  matin: ['chaudes', 'petitdejeuner', 'sirops', 'softs', 'bieres'],
  soir:  ['softs', 'cocktails', 'alcool', 'tapas', 'bieres'],
};

// Normalise quelques noms de catégories hérités de l'ancien JSON
function normalizeCategory(cat = '') {
  const c = String(cat).toLowerCase();
  if (['petitsdejeuners', 'petitsdejeuner'].includes(c)) return 'petitdejeuner';
  return c;
}

// 06–10:59 matin ; sinon soir
function momentFromHour(hour) {
  if (hour >= 6 && hour < 11) return 'matin';
  if ((hour >= 11 && hour <= 23) || (hour >= 0 && hour < 2)) return 'soir';
  return 'soir';
}

exports.renderCarte = async (req, res, next) => {
  try {
    let { moment, category, q } = req.query;

    // Redirection automatique si moment manquant
    if (!moment) {
      const hour = new Date().getHours();
      return res.redirect(`/carte?moment=${momentFromHour(hour)}`);
    }

    // ===== MODE "ALL" : matin + soir sur une seule page =====
    if (moment === 'all') {
      const filter = { available: true };
      if (category) filter.category = normalizeCategory(category);
      if (q) filter.name = { $regex: q, $options: 'i' };

      const items = await MenuItem.find(filter)
        .sort({ moment: 1, category: 1, name: 1 })
        .lean();

      // { matin:{cat:[...]}, soir:{cat:[...]} }
      const byMoment = items.reduce((acc, it) => {
        const m = it.moment || 'soir';
        const cat = normalizeCategory(it.category);
        acc[m] ||= {};
        (acc[m][cat] ||= []).push(it);
        return acc;
      }, {});

      // Assurer l’ordre des catégories si connu
      ['matin', 'soir'].forEach(m => {
        const wanted = ORDER[m];
        const bloc = byMoment[m] || {};
        if (!wanted) return;
        const normalized = {};
        wanted.forEach(cat => (normalized[cat] = bloc[cat] || []));
        // garder aussi les catégories non prévues
        Object.keys(bloc).forEach(cat => {
          if (!(cat in normalized)) normalized[cat] = bloc[cat];
        });
        byMoment[m] = normalized;
      });

      return res.render('pages/carte', {
        title: 'Carte — Tout',
        moment: 'all',
        carteByMoment: byMoment,
      });
    }

    // ===== MODE unitaire : matin OU soir =====
    const filter = { moment, available: true };
    if (category) filter.category = normalizeCategory(category);
    if (q) filter.name = { $regex: q, $options: 'i' };

    const items = await MenuItem.find(filter).sort({ category: 1, name: 1 }).lean();

    // carte = { cat:[items...] }
    const carte = items.reduce((acc, it) => {
      const cat = normalizeCategory(it.category);
      (acc[cat] ||= []).push(it);
      return acc;
    }, {});

    return res.render('pages/carte', {
      title: `Carte (${moment}) — La Hora`,
      moment,
      carte,
    });
  } catch (err) {
    next(err);
  }
};
