// 📁 server/routes/pages/carte.js
const express = require('express');
const router = express.Router();
const MenuItem = require('../../models/MenuItem'); // <-- modèle Mongoose

// Détermine "matin" / "soir"
function getMomentFromHour(hour) {
  if (hour >= 6 && hour < 11) return 'matin';
  if ((hour >= 11 && hour <= 23) || (hour >= 0 && hour < 2)) return 'soir';
  return 'soir';
}

// GET /carte?moment=matin|soir&category=softs&q=menthe
router.get('/', async (req, res, next) => {
  try {
    let { moment, category, q } = req.query;

    // Redirection auto si le moment n'est pas précisé (comme avant)
    if (!moment) {
      const hour = new Date().getHours();
      moment = getMomentFromHour(hour);
      return res.redirect(`/carte?moment=${moment}`);
    }

    // Filtre Mongo
    const filter = { period: moment, available: true };
    if (category) filter.category = category;
    if (q) filter.name = { $regex: q, $options: 'i' };

    // On lit la BDD, tri lisible
    const items = await MenuItem
      .find(filter)
      .sort({ category: 1, name: 1 })
      .lean();

    // ⚙️ On recompose un objet identique à l'ancien JSON :
    // carte = { softs:[...], cocktails:[...], ... }
    const carte = items.reduce((acc, it) => {
      (acc[it.category] ||= []).push(it);
      return acc;
    }, {});

    res.render('pages/carte', {
      title: `carte (${moment})`,
      moment,
      carte, // <-- même nom/shape que quand tu lisais le JSON
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
