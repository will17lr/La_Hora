// server/controllers/admin/carte.controller.js
const { getCarteAll } = require('../../services/carte.service');

exports.page = async (req, res, next) => {
  try {
    const carte = await getCarteAll(); // { matin:{...}, soir:{...} }
    res.render('admin/carte', { title: 'Gestion de la carte', carte });
  } catch (err) { next(err); }
};
