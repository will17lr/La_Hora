// server/models/Customer.js
const mongoose = require('mongoose');
const CustomerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, index: true },
  phone: String,
  preferences: {
    newsletter: { type: Boolean, default: false },
    allergens: [String],
  },
}, { timestamps: true });
module.exports = mongoose.model('Customer', CustomerSchema);
