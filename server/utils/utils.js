// server/utils/utils.js

// Exemple de fonction pour normaliser les catégories
function normalizeCategory(cat = '') {
  const c = String(cat || '').toLowerCase().trim();
  if (['petitsdejeuners', 'petitsdejeuner'].includes(c)) return 'petitdejeuner';
  return c || 'autres';
}

// Exemple de configuration ORDER
const ORDER = {
  matin: ['chaudes', 'petitdejeuner', 'sirops', 'softs', 'bieres'],
  soir: ['softs', 'cocktails', 'alcool', 'tapas', 'bieres'],
};

// Exports
module.exports = { normalizeCategory, ORDER };
