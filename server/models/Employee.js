// server/models/Employee.js
const mongoose = require('mongoose');
const EmployeeSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, index: true },
  position:  { type: String, enum: ['bartender','server','manager','chef','admin'] },
  hireDate:  Date,
  isManager: { type: Boolean, default: false },
}, { timestamps: true });
module.exports = mongoose.model('Employee', EmployeeSchema);
