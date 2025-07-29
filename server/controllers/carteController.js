exports.getCarte = (req, res) => {
  const moment = req.query.moment || 'auto';

  // Lecture du JSON
  const data = require('../../data/carte.json');

  // Détection du moment si "auto"
  const hour = new Date().getHours();
  const finalMoment = moment === 'auto' ? (hour < 12 ? 'matin' : 'soir') : moment;

  // Filtrage des catégories selon le moment
  const filteredCarte = {};
  const matinCategories = ['petitsdejeuners', 'chaudes', 'softs', 'bieres', 'sirops'];
  const soirCategories = ['softs', 'cocktails', 'alcool', 'tapas'];

  const selectedCategories = finalMoment === 'matin' ? matinCategories : soirCategories;

  selectedCategories.forEach(cat => {
    if (data[cat]) filteredCarte[cat] = data[cat];
  });

  res.render('pages/carte', { carte: filteredCarte, moment: finalMoment });
};
