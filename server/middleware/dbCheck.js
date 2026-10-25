const mongoose = require('mongoose');

// Middleware to check if MongoDB is connected before handling DB-dependent requests
const requireDB = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message:
        'MongoDB is not connected. Please ensure local MongoDB is running (port 27017) or set a valid MONGODB_URI in .env (e.g. MongoDB Atlas).',
    });
  }
  next();
};

module.exports = requireDB;
