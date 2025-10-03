// server/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:   { type: String, required: true, select: false },
  fullname:   { type: String, trim: true },
  roles:      { type: [String], enum: ['customer','employee','admin'], default: ['customer'] },
  isActive:   { type: Boolean, default: true },
  // reset / verify
  emailVerified: { type: Boolean, default: false },
  verifyToken:   { type: String },
  resetToken:    { type: String, select: false, index: true, sparse: true },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
