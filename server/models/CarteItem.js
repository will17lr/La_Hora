// server/models/CarteItem.js
const mongoose = require('mongoose');

const CarteItemSchema = new mongoose.Schema(
  {
    category: { type: String, required: true, trim: true }, // ex: 'petitdejeuner'
    name: { type: String, required: true, trim: true },     // ex: 'Croissant'
    moment: { type: String, enum: ['matin', 'soir'], required: true },
    available: { type: Boolean, default: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },                   // ex: '/assets/img/petit-dejeuner.jpg'
    price: { type: Number, default: null },                 // null si non tarifé
    order: { type: Number, default: 0 },                    // pour trier à l’intérieur d’une catégorie
  },
  { timestamps: true }
);

// Index utiles pour les lectures
CarteItemSchema.index({ moment: 1, category: 1, order: 1, createdAt: 1 });

module.exports = mongoose.model('CarteItem', CarteItemSchema);
