const express = require('express');
const router = express.Router();
const { getAll, getById, create, update, remove, getStats } = require('../controllers/donationController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getAll);
router.get('/stats', protect, getStats);
router.get('/:id', protect, getById);
router.post('/', protect, authorize('donor', 'admin'), create);
router.put('/:id', protect, authorize('admin', 'doctor'), update);
router.delete('/:id', protect, authorize('admin'), remove);

module.exports = router;
