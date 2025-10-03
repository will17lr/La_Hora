// server/models/Reservation.js
const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
  // champs vus dans ta base Atlas (screenshots)
  firstname: String,
  lastname: String,
  phone: String,
  email: String,
  date: String,     // ex: "2025-07-27"
  time: String,     // ex: "18:48"
  people: String,   // parfois string "4"
  message: String,

  // on tolère aussi l'ancien format FR si jamais ça arrive par un autre endpoint
  prenom: String,
  nom: String,
  telephone: String,
  heure: String,
  personnes: Number,
}, { timestamps: true });

module.exports = mongoose.models.Reservation || mongoose.model('Reservation', ReservationSchema);
