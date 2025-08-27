// 📁 server/models/Reservation.js
const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
  date:      { type: String, required: true },   // "YYYY-MM-DD" (simple et lisible)
  time:      { type: String, required: true },   // "HH:mm"
  people:    { type: Number, required: true, min: 1 },
  firstname: { type: String, required: true, trim: true },
  lastname:  { type: String, required: true, trim: true },
  phone:     { type: String, required: true, trim: true },
  email:     { type: String, required: true, trim: true },
  message:   { type: String, default: '' },
  status:    { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Reservation', ReservationSchema);
