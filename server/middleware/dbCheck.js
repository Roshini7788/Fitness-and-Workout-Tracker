const mongoose = require('mongoose');

const connectDB = require('../config/db');

// Middleware to check if MongoDB is connected before handling DB-dependent requests
const requireDB = async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    await connectDB();
  }

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message:
        'MongoDB is not connected. Please ensure MongoDB Atlas connection string is configured in Vercel Environment Variables (MONGODB_URI) and Network Access whitelist is set to 0.0.0.0/0.',
    });
  }
  next();
};

module.exports = requireDB;
