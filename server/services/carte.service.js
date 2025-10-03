const CarteItem = require('../models/CarteItem');

const ORDER = {
  matin: ['chaudes', 'petitdejeuner', 'sirops', 'softs', 'bieres'],
  soir:  ['softs', 'cocktails', 'alcool', 'tapas', 'bieres'],
};

function normalizeCategory(cat = '') {
  const c = String(cat || '').toLowerCase().trim();
  if (['petitsdejeuners', 'petitsdejeuner'].includes(c)) return 'petitdejeuner';
  return c || 'autres';
}

function sortCategoriesFor(moment, grouped) {
  const pref = ORDER[moment] || [];
  const keys = Object.keys(grouped);
  const known = pref.filter(k => keys.includes(k));
  const unknown = keys.filter(k => !pref.includes(k)).sort((a, b) => a.localeCompare(b));
  return [...known, ...unknown];
}

async function getCarteByMoment(moment) {
  // ⚠️ certains docs ont "categorie", d’autres "category"
  const docs = await CarteItem
    .find({ moment })
    .sort({ order: 1, createdAt: 1 }) // le tri final se fera par cat ensuite
    .lean();

  const grouped = {};
  for (const d of docs) {
    const rawCat = d.categorie ?? d.category ?? '';
    const cat = normalizeCategory(rawCat);
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(d);
  }

  const out = {};
  for (const cat of sortCategoriesFor(moment, grouped)) {
    out[cat] = grouped[cat];
  }
  return out;
}

async function getCarteAll() {
  const [matin, soir] = await Promise.all([
    getCarteByMoment('matin'),
    getCarteByMoment('soir')
  ]);
  return { matin, soir };
}

// (optionnel) alias pour compat
async function getCarte() {
  return getCarteAll();
}

module.exports = { getCarteByMoment, getCarteAll, getCarte, normalizeCategory, ORDER };
