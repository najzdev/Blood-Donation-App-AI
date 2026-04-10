const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, lowercase: true, trim: true },
  phone: { type: String, required: true },
  bloodGroup: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  hospital: { type: String, required: true },
  ward: { type: String },
  doctor: { type: String },
  diagnosis: { type: String, required: true },
  urgencyLevel: {
    type: String,
    enum: ['critical', 'urgent', 'moderate', 'low'],
    required: true,
  },
  unitsRequired: { type: Number, required: true, min: 1 },
  unitsProvided: { type: Number, default: 0 },
  medicalCondition: {
    hemoglobinLevel: Number, // g/dL
    bloodPressure: String,
    heartRate: Number,
    oxygenSaturation: Number, // %
    hasAnemia: { type: Boolean, default: false },
    hasCancer: { type: Boolean, default: false },
    hasSurgery: { type: Boolean, default: false },
    hasThalassemia: { type: Boolean, default: false },
    otherConditions: String,
    notes: String,
  },
  status: {
    type: String,
    enum: ['waiting', 'partially_fulfilled', 'fulfilled', 'cancelled'],
    default: 'waiting',
  },
  admittedAt: { type: Date, default: Date.now },
  requiredBy: { type: Date },
  aiAnalysis: {
    priorityScore: { type: Number, default: 0 },
    recommendation: String,
    analyzedAt: Date,
    compatibleDonors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Donor' }],
  },
  registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);
