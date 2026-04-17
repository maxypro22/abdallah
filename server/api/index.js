const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection with Serverless Optimization
let cachedPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!cachedPromise) {
    cachedPromise = mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    }).catch(err => {
      console.error('MongoDB Connection Error:', err);
      cachedPromise = null; // Reset on error
      throw err;
    });
  }

  return cachedPromise;
};

// Health Check Route
app.get('/', async (req, res) => {
  let dbStatus = 'Disconnected';
  let dbError = null;
  let connectionDetails = {};

  try {
    await connectDB();
    dbStatus = '✅ Connected Successfully';
    connectionDetails = {
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name
    };
  } catch (err) {
    dbStatus = '❌ Connection Failed';
    dbError = err.message;
  }

  res.status(200).json({
    status: 'Server is running',
    message: '🚀 Al Murqab Legal SaaS API',
    database: {
      status: dbStatus,
      error: dbError,
      details: connectionDetails
    },
    environment: {
      mongoUri: process.env.MONGODB_URI ? '✅ Set' : '❌ Missing',
      jwtSecret: process.env.JWT_SECRET ? '✅ Set' : '❌ Missing',
      nodeEnv: process.env.NODE_ENV || 'development'
    },
    timestamp: new Date().toISOString(),
    vercelRegion: process.env.VERCEL_REGION || 'local'
  });
});

// Routes
app.use('/auth', require('../routes/authRoutes'));
app.use('/cases', require('../routes/caseRoutes'));
app.use('/finance', require('../routes/financeRoutes'));
app.use('/users', require('../routes/userRoutes'));
app.use('/dashboard', require('../routes/dashboardRoutes'));

module.exports = app;
