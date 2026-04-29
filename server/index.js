const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const donationRoutes = require('./routes/donations');
const requestRoutes = require('./routes/requests');
const notificationRoutes = require('./routes/notifications');
const aiRoutes = require('./routes/ai');

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/health', (req, res) => {
  const health = {
    status: 'OK',
    message: 'Dem AI Server Running',
    environment: {
      mongodbConnected: mongoose.connection.readyState === 1,
      geminiApiKeyExists: !!process.env.GEMINI_API_KEY,
      geminiApiKeyLength: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0,
      nodeEnv: process.env.NODE_ENV || 'development'
    }
  };
  res.json(health);
});

// Test Gemini API
app.get('/api/ai/test', async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not configured', status: 'MISSING_KEY' });
    }

    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent('Say "Hello from Demitasse AI"');
    const response = await result.response.text();

    res.json({ 
      status: 'OK', 
      message: 'Gemini API is working',
      response: response 
    });
  } catch (err) {
    console.error('Gemini Test Error:', err);
    res.status(500).json({ 
      error: err.message,
      status: 'GEMINI_ERROR',
      type: err.constructor.name 
    });
  }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = app;
