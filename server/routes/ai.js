const express = require('express');
const router = express.Router();
const { matchDonors, getPrioritizedRequests, chat } = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/auth');

router.get('/match/:requestId', protect, authorize('admin', 'doctor'), matchDonors);
router.get('/prioritize', protect, authorize('admin', 'doctor'), getPrioritizedRequests);
router.post('/chat', protect, chat);

module.exports = router;
