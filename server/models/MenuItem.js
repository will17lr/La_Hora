// server/models/MenuItem.js
const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: String,
  price: { type: Number, required: true, min: 0 },
  image: String,
  period: { type: String, enum: ['matin', 'soir'], required: true },
  category: { type: String, required: true },
  tags: [String],
  available: { type: Boolean, default: true },
  // 🔑 clé normalisée (period:category:name en lower-case)
  key: { type: String, index: true, unique: true, sparse: true },
}, { timestamps: true });

// ➜ génère la clé normalisée avant validation
MenuItemSchema.pre('validate', function (next) {
  const name = (this.name || '').trim().toLowerCase();
  const category = (this.category || '').trim().toLowerCase();
  const period = (this.period || '').trim().toLowerCase();
  this.key = `${period}:${category}:${name}`;
  next();
});

// 🔎 index texte pour la recherche
MenuItemSchema.index({ name: 'text', description: 'text' });

// (facultatif) index utile pour tri/filtre
MenuItemSchema.index({ period: 1, category: 1, price: 1 });

// ❌ IMPORTANT : retire l'ancien index unique composé { period, category, name }
// (ne laisse AUCUNE ligne qui crée cet index)

module.exports = mongoose.model('MenuItem', MenuItemSchema);
