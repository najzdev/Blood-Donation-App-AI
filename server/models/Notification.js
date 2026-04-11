const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['match', 'urgent', 'donation', 'request', 'system'], default: 'system' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  relatedRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'BloodRequest' },
  relatedDonation: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation' },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
