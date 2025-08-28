// server/models/menu.model.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Un document = 1 produit de la carte (matin OU soir)
 */
const MenuItemSchema = new Schema(
  {
    // 'matin' | 'soir'
    moment: {
      type: String,
      enum: ['matin', 'soir'],
      required: true,
      index: true,
    },

    // ex: 'petitdejeuner', 'chaudes', 'sirops', 'softs', 'bieres', 'cocktails', 'tapas', etc.
    category: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, trim: true, default: '' },

    available: { type: Boolean, default: true },

    // optionnel: pour URLs propres / recherches
    slug: { type: String, trim: true, index: true },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true, // (par défaut true) — garde-le explicite
  }
);

// Index composé utile
MenuItemSchema.index({ moment: 1, category: 1, name: 1 });

// Générer un slug simple si absent
MenuItemSchema.pre('save', function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toString()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  next();
});

module.exports = mongoose.model('MenuItem', MenuItemSchema);
