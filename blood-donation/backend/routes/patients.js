const express = require('express');
const Patient = require('../models/Patient');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all patients
router.get('/', auth, async (req, res) => {
  try {
    const { bloodGroup, urgencyLevel, status, search, page = 1, limit = 10 } = req.query;
    const query = {};
    if (bloodGroup) query.bloodGroup = bloodGroup;
    if (urgencyLevel) query.urgencyLevel = urgencyLevel;
    if (status) query.status = status;
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { hospital: { $regex: search, $options: 'i' } },
      { diagnosis: { $regex: search, $options: 'i' } },
    ];

    const total = await Patient.countDocuments(query);
    const patients = await Patient.find(query)
      .sort({ 'aiAnalysis.priorityScore': -1, admittedAt: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('aiAnalysis.compatibleDonors', 'name bloodGroup phone');

    res.json({ success: true, patients, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get patient by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('aiAnalysis.compatibleDonors', 'name bloodGroup phone email');
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
    res.json({ success: true, patient });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create patient
router.post('/', auth, async (req, res) => {
  try {
    const patient = new Patient({ ...req.body, registeredBy: req.user._id });
    await patient.save();
    res.status(201).json({ success: true, patient });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update patient
router.put('/:id', auth, async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
    res.json({ success: true, patient });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete patient
router.delete('/:id', auth, async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
    res.json({ success: true, message: 'Patient deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get critical patients
router.get('/filter/critical', auth, async (req, res) => {
  try {
    const patients = await Patient.find({
      urgencyLevel: { $in: ['critical', 'urgent'] },
      status: { $in: ['waiting', 'partially_fulfilled'] },
    }).sort({ 'aiAnalysis.priorityScore': -1 });
    res.json({ success: true, patients });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
