// server/models/Contact.js
const mongoose = require('mongoose');
const ContactSchema = new mongoose.Schema({
  nom: String,
  prenom: String,
  email: String,
  sujet: String,
  message: String,
  date: String,
}, { timestamps: true });
module.exports = mongoose.models.Contact || mongoose.model('Contact', ContactSchema);
