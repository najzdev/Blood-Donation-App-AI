const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blood_donation')
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/donors', require('./routes/donors'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/inventory', require('./routes/inventory'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Blood Donation API is running', timestamp: new Date() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🩸 Blood Donation Server running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
});

module.exports = app;
