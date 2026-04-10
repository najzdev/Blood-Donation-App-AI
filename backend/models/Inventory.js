const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  bloodGroup: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    unique: true,
  },
  unitsAvailable: { type: Number, default: 0, min: 0 },
  unitsReserved: { type: Number, default: 0, min: 0 },
  criticalThreshold: { type: Number, default: 5 },
  lastUpdated: { type: Date, default: Date.now },
  donations: [{
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'Donor' },
    units: Number,
    donationDate: Date,
    expiryDate: Date, // Blood expires after 42 days
    bagId: String,
  }],
}, { timestamps: true });

inventorySchema.virtual('isCritical').get(function () {
  return this.unitsAvailable <= this.criticalThreshold;
});

inventorySchema.virtual('unitsTotal').get(function () {
  return this.unitsAvailable + this.unitsReserved;
});

inventorySchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Inventory', inventorySchema);
