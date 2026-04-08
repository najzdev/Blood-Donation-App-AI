const express = require('express');
const Inventory = require('../models/Inventory');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all inventory
router.get('/', auth, async (req, res) => {
  try {
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    // Ensure all blood groups exist
    for (const bg of bloodGroups) {
      const exists = await Inventory.findOne({ bloodGroup: bg });
      if (!exists) await Inventory.create({ bloodGroup: bg, unitsAvailable: 0 });
    }
    const inventory = await Inventory.find().sort({ bloodGroup: 1 });
    res.json({ success: true, inventory });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update inventory
router.put('/:bloodGroup', auth, async (req, res) => {
  try {
    const { unitsAvailable, unitsReserved, criticalThreshold } = req.body;
    const inv = await Inventory.findOneAndUpdate(
      { bloodGroup: req.params.bloodGroup },
      { unitsAvailable, unitsReserved, criticalThreshold, lastUpdated: new Date() },
      { new: true, upsert: true }
    );
    res.json({ success: true, inventory: inv });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get summary stats
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const inventory = await Inventory.find();
    const summary = {
      totalUnits: inventory.reduce((a, b) => a + b.unitsAvailable, 0),
      criticalBloodGroups: inventory.filter(i => i.isCritical).map(i => i.bloodGroup),
      byBloodGroup: inventory.reduce((acc, i) => {
        acc[i.bloodGroup] = { available: i.unitsAvailable, reserved: i.unitsReserved };
        return acc;
      }, {}),
    };
    res.json({ success: true, summary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
