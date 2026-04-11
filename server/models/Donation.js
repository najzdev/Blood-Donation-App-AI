const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  request: { type: mongoose.Schema.Types.ObjectId, ref: 'BloodRequest' },
  bloodType: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], required: true },
  units: { type: Number, required: true, min: 1 },
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
  donationDate: { type: Date },
  hospital: { type: String },
  city: { type: String },
  notes: { type: String },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // doctor
}, { timestamps: true });

module.exports = mongoose.model('Donation', donationSchema);
