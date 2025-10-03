// server/services/recap.service.js
const Reservation = require('../models/Reservation');
const Contact = require('../models/Contact');

async function getRecap() {
  const [reservations, contacts] = await Promise.all([
    Reservation.find().sort({ createdAt: -1 }).lean(),
    Contact.find().sort({ createdAt: -1 }).lean(),
  ]);
  return { reservations, contacts };
}

module.exports = { getRecap };
