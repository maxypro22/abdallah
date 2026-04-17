const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
app.use(morgan('dev'));

// CORS Configuration
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json());

// Global Middleware - Standard Headers
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Health Check Route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    database: 'Supabase (PostgreSQL)',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/cases', require('./routes/caseRoutes'));
app.use('/api/finance', require('./routes/financeRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Export for Vercel
module.exports = app;
