// server/services/carte.service.js
const CarteItem = require("../models/CarteItem");

/**
 * Normalisation catégorie (ancien système)
 */
function normalizeCategory(cat = '') {
  const c = String(cat || '').toLowerCase().trim();
  if (['petitsdejeuners', 'petitsdejeuner'].includes(c)) return 'petitdejeuner';
  return c || 'autres';
}

/**
 * Tri personnalisé selon moment
 */
const ORDER = {
  matin: ["chaudes", "petitdejeuner", "sirops", "softs", "bieres"],
  soir: ["softs", "cocktails", "alcool", "tapas", "bieres"],
};

/**
 * Carte PUBLIC : par MOMENT → { cocktails: [...], softs: [...] }
 */
async function getCarteByMoment(moment) {
  const docs = await CarteItem.find({ moment }).sort({ order: 1 }).lean();

  const grouped = {};

  for (const d of docs) {
    const rawCat = d.category;
    const cat = normalizeCategory(rawCat);

    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(d);
  }

  // tri final par ordre personnalisé
  const out = {};
  const pref = ORDER[moment] || [];
  const keys = Object.keys(grouped);

  const known = pref.filter((k) => keys.includes(k));
  const unknown = keys.filter((k) => !pref.includes(k)).sort();

  for (const cat of [...known, ...unknown]) {
    out[cat] = grouped[cat];
  }

  return out;
}

/**
 * Retourne matin + soir pour compatibilité
 */
async function getCarteAll() {
  return {
    matin: await getCarteByMoment("matin"),
    soir: await getCarteByMoment("soir"),
  };
}

/**
 * Alias utilisé dans des anciennes routes
 */
async function getCarte() {
  return getCarteAll();
}

/**
 * ADMIN : toutes les catégories, tous les produits regroupés par category
 */
async function getCarteAdmin() {
  const items = await CarteItem.find().sort({ category: 1, order: 1 }).lean();

  const result = {};

  for (const item of items) {
    const cat = normalizeCategory(item.category);

    if (!result[cat]) result[cat] = [];
    result[cat].push(item);
  }

  return result;
}

async function saveProduct(data) {
  const { id, name, description, price, image, category, moment, order } = data;

  if (id) {
    return await CarteItem.findByIdAndUpdate(id, {
      name,
      description,
      price,
      image,
      category,
      moment,
      order
    });
  }

  return await CarteItem.create({
    name,
    description,
    price,
    image,
    category,
    moment,
    order
  });
}

async function deleteProduct(id) {
  return await CarteItem.findByIdAndDelete(id);
}

module.exports = {
  getCarteByMoment,
  getCarteAll,
  getCarte,
  getCarteAdmin,
  saveProduct,
  deleteProduct,

  // utils anciens
  normalizeCategory,
  ORDER,
};
