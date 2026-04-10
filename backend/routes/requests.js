const express = require('express');
const BloodRequest = require('../models/BloodRequest');
const Patient = require('../models/Patient');
const Inventory = require('../models/Inventory');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all requests
router.get('/', auth, async (req, res) => {
  try {
    const { status, urgency, bloodGroup, page = 1, limit = 10 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (urgency) query.urgency = urgency;
    if (bloodGroup) query.bloodGroup = bloodGroup;

    const total = await BloodRequest.countDocuments(query);
    const requests = await BloodRequest.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('patient', 'name bloodGroup hospital urgencyLevel')
      .populate('donor', 'name bloodGroup phone');

    res.json({ success: true, requests, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create request
router.post('/', auth, async (req, res) => {
  try {
    const request = new BloodRequest({ ...req.body, processedBy: req.user._id });
    await request.save();
    res.status(201).json({ success: true, request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update request status
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status, donorId } = req.body;
    const request = await BloodRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    request.status = status;
    if (donorId) request.donor = donorId;
    if (status === 'completed') {
      request.completedDate = new Date();
      // Update inventory
      const inv = await Inventory.findOne({ bloodGroup: request.bloodGroup });
      if (inv && inv.unitsAvailable >= request.unitsRequested) {
        inv.unitsAvailable -= request.unitsRequested;
        await inv.save();
      }
      // Update patient
      const patient = await Patient.findById(request.patient);
      if (patient) {
        patient.unitsProvided += request.unitsRequested;
        if (patient.unitsProvided >= patient.unitsRequired) patient.status = 'fulfilled';
        else patient.status = 'partially_fulfilled';
        await patient.save();
      }
    }
    await request.save();
    res.json({ success: true, request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete request
router.delete('/:id', auth, async (req, res) => {
  try {
    await BloodRequest.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Request deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
