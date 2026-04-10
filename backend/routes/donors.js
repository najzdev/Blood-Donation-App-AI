const express = require('express');
const Donor = require('../models/Donor');
const Inventory = require('../models/Inventory');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all donors
router.get('/', auth, async (req, res) => {
  try {
    const { bloodGroup, status, search, page = 1, limit = 10 } = req.query;
    const query = {};
    if (bloodGroup) query.bloodGroup = bloodGroup;
    if (status) query.status = status;
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];

    const total = await Donor.countDocuments(query);
    const donors = await Donor.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, donors, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get donor by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id);
    if (!donor) return res.status(404).json({ success: false, message: 'Donor not found' });
    res.json({ success: true, donor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create donor
router.post('/', auth, async (req, res) => {
  try {
    const donor = new Donor({ ...req.body, registeredBy: req.user._id });
    donor.isEligible = donor.checkEligibility();
    await donor.save();
    res.status(201).json({ success: true, donor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update donor
router.put('/:id', auth, async (req, res) => {
  try {
    const donor = await Donor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!donor) return res.status(404).json({ success: false, message: 'Donor not found' });
    res.json({ success: true, donor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete donor
router.delete('/:id', auth, async (req, res) => {
  try {
    const donor = await Donor.findByIdAndDelete(req.params.id);
    if (!donor) return res.status(404).json({ success: false, message: 'Donor not found' });
    res.json({ success: true, message: 'Donor deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Record donation
router.post('/:id/donate', auth, async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id);
    if (!donor) return res.status(404).json({ success: false, message: 'Donor not found' });

    donor.lastDonationDate = new Date();
    donor.totalDonations += 1;
    donor.isEligible = donor.checkEligibility();
    await donor.save();

    // Update inventory
    let inv = await Inventory.findOne({ bloodGroup: donor.bloodGroup });
    if (!inv) inv = new Inventory({ bloodGroup: donor.bloodGroup });
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 42);
    inv.donations.push({ donor: donor._id, units: 1, donationDate: new Date(), expiryDate, bagId: `BAG-${Date.now()}` });
    inv.unitsAvailable += 1;
    inv.lastUpdated = new Date();
    await inv.save();

    res.json({ success: true, donor, message: 'Donation recorded successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get eligible donors by blood group
router.get('/eligible/:bloodGroup', auth, async (req, res) => {
  try {
    const donors = await Donor.find({
      bloodGroup: req.params.bloodGroup,
      isEligible: true,
      status: 'active',
    }).sort({ lastDonationDate: 1 });
    res.json({ success: true, donors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
