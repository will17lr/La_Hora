// server/models/Contact.js
const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  subject: String,
  message: String,

  // 🔥 Pour afficher "Lu / Non lu" dans l'admin
  read: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now }
});

// ✅ Export du modèle (OBLIGATOIRE)
module.exports = mongoose.model('Contact', ContactSchema);
