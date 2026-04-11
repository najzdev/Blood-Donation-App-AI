const Donation = require('../models/Donation');
const BloodRequest = require('../models/BloodRequest');
const User = require('../models/User');
const Notification = require('../models/Notification');

exports.getAll = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'donor') filter.donor = req.user._id;
    const donations = await Donation.find(filter)
      .populate('donor', 'name bloodType city')
      .populate('request', 'bloodType urgency hospital')
      .populate('verifiedBy', 'name')
      .sort('-createdAt');
    res.json(donations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donor', 'name bloodType city phone email')
      .populate('request')
      .populate('verifiedBy', 'name');
    if (!donation) return res.status(404).json({ message: 'Donation not found' });
    res.json(donation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const donation = await Donation.create({ ...req.body, donor: req.user._id });
    // Update donor's last donation info
    await User.findByIdAndUpdate(req.user._id, { lastDonationDate: new Date(), isAvailable: false });
    // If linked to a request, update matched donors
    if (req.body.request) {
      await BloodRequest.findByIdAndUpdate(req.body.request, {
        $addToSet: { matchedDonors: req.user._id },
        status: 'matched'
      });
      const request = await BloodRequest.findById(req.body.request).populate('patient', '_id name');
      if (request) {
        await Notification.create({
          recipient: request.patient._id,
          type: 'match',
          title: 'Donor Matched!',
          message: `A donor has been matched for your blood request. Donation scheduled.`,
          relatedRequest: request._id,
          relatedDonation: donation._id,
        });
      }
    }
    res.status(201).json(donation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const donation = await Donation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!donation) return res.status(404).json({ message: 'Donation not found' });
    if (req.body.status === 'completed' && donation.request) {
      await BloodRequest.findByIdAndUpdate(donation.request, { status: 'fulfilled', fulfilledAt: new Date() });
    }
    res.json(donation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await Donation.findByIdAndDelete(req.params.id);
    res.json({ message: 'Donation deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const [total, completed, scheduled] = await Promise.all([
      Donation.countDocuments(),
      Donation.countDocuments({ status: 'completed' }),
      Donation.countDocuments({ status: 'scheduled' }),
    ]);
    res.json({ total, completed, scheduled });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
