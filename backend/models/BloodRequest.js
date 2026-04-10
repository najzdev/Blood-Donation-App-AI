const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'Donor' },
  bloodGroup: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  },
  unitsRequested: { type: Number, required: true, min: 1 },
  status: {
    type: String,
    enum: ['pending', 'approved', 'matched', 'completed', 'rejected', 'cancelled'],
    default: 'pending',
  },
  urgency: {
    type: String,
    enum: ['critical', 'urgent', 'moderate', 'low'],
    required: true,
  },
  aiMatchScore: { type: Number, default: 0 },
  aiNotes: { type: String, default: '' },
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String },
  scheduledDate: { type: Date },
  completedDate: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);
