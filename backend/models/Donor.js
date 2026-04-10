const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true },
  bloodGroup: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  },
  age: { type: Number, required: true, min: 18, max: 65 },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  weight: { type: Number, required: true, min: 50 }, // kg
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'Morocco' },
  },
  medicalHistory: {
    hasDiabetes: { type: Boolean, default: false },
    hasHypertension: { type: Boolean, default: false },
    hasHepatitis: { type: Boolean, default: false },
    hasHIV: { type: Boolean, default: false },
    recentSurgery: { type: Boolean, default: false },
    recentTattoo: { type: Boolean, default: false },
    medications: [String],
    otherConditions: String,
  },
  lastDonationDate: { type: Date, default: null },
  totalDonations: { type: Number, default: 0 },
  isEligible: { type: Boolean, default: true },
  eligibilityNotes: { type: String, default: '' },
  status: { type: String, enum: ['active', 'inactive', 'deferred'], default: 'active' },
  registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Virtual: days since last donation
donorSchema.virtual('daysSinceLastDonation').get(function () {
  if (!this.lastDonationDate) return null;
  return Math.floor((new Date() - this.lastDonationDate) / (1000 * 60 * 60 * 24));
});

// Check eligibility (must wait 56 days between donations)
donorSchema.methods.checkEligibility = function () {
  if (this.medicalHistory.hasHIV || this.medicalHistory.hasHepatitis) return false;
  if (this.daysSinceLastDonation !== null && this.daysSinceLastDonation < 56) return false;
  return true;
};

donorSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Donor', donorSchema);
