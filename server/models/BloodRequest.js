const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  bloodType: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], required: true },
  units: { type: Number, required: true, min: 1 },
  urgency: { type: String, enum: ['critical', 'high', 'medium', 'low'], default: 'medium' },
  status: { type: String, enum: ['pending', 'matched', 'fulfilled', 'cancelled'], default: 'pending' },
  hospital: { type: String },
  city: { type: String },
  diagnosis: { type: String },
  notes: { type: String },
  matchedDonors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  aiAnalysis: { type: String }, // Gemini AI analysis result
  requiredBy: { type: Date },
  fulfilledAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);
