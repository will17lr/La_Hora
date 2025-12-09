// 📁 server/models/reservation.model.js
const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
  date:      { type: String, required: true },   // "YYYY-MM-DD"
  time:      { type: String, required: true },   // "HH:mm"
  people:    { type: Number, required: true, min: 1 },

  firstname: { type: String, required: true, trim: true },
  lastname:  { type: String, required: true, trim: true },
  phone:     { type: String, required: true, trim: true },
  email:     { type: String, required: true, trim: true },

  message:   { type: String, default: '' },

  // Statut de suivi
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'cancelled'], 
    default: 'pending' 
  },

  // Faculatif : raison d’annulation par l’admin
  cancelReason: { type: String, default: '' },

}, { timestamps: true });

// Index optimisés
ReservationSchema.index({ date: 1, time: 1 });
ReservationSchema.index({ status: 1 });

module.exports = mongoose.model('Reservation', ReservationSchema);
