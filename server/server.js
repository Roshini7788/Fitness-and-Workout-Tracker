const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables from .env
dotenv.config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const workoutRoutes = require('./routes/workoutRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const errorHandler = require('./middleware/errorHandler');

// Initialize database connection
connectDB();

const app = express();

// Core Middleware
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static frontend assets
app.use(express.static(path.join(__dirname, '../client')));

// Health check endpoint
app.get('/api/health', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    try {
      await connectDB();
    } catch (e) {}
  }
  const dbState = mongoose.connection.readyState;
  const dbStatusMap = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting',
  };

  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    database: {
      state: dbState,
      status: dbStatusMap[dbState] || 'Unknown',
      host: mongoose.connection.host || 'none',
      name: mongoose.connection.name || 'none',
    },
    timestamp: new Date().toISOString(),
  });
});

const requireDB = require('./middleware/dbCheck');

// API Routes
app.use('/api/auth', requireDB, authRoutes);
app.use('/api/users', requireDB, authRoutes); // supports /api/users/goal and profile aliases
app.use('/api/workouts', requireDB, workoutRoutes);
app.use('/api/dashboard', requireDB, dashboardRoutes);

// Fallback: serve client/index.html for any frontend SPA navigation
app.use((req, res, next) => {
  // If it's an API route that didn't match, send 404 JSON
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: 'API route not found' });
  }
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Custom Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Only listen on port when running standalone locally (not in serverless environment)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n=============================================`);
    console.log(`🚀 FitTrack Server running on port ${PORT}`);
    console.log(`🌐 Local URL: http://localhost:${PORT}`);
    console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`=============================================\n`);
  });
}

// Handle unhandled promise rejections gracefully
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
});

module.exports = app;
