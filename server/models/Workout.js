const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Workout must belong to a user'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide a workout name'],
      trim: true,
      maxlength: [100, 'Workout name cannot exceed 100 characters'],
    },
    type: {
      type: String,
      required: [true, 'Please select a workout type'],
      enum: {
        values: ['Cardio', 'Strength', 'Yoga', 'Running', 'Cycling', 'Other'],
        message: '{VALUE} is not a valid workout type',
      },
    },
    duration: {
      type: Number,
      required: [true, 'Please provide duration in minutes'],
      min: [1, 'Duration must be at least 1 minute'],
      max: [1440, 'Duration cannot exceed 1440 minutes (24 hours)'],
    },
    calories: {
      type: Number,
      required: [true, 'Please provide calories burned'],
      min: [0, 'Calories burned cannot be negative'],
      max: [20000, 'Calories burned value seems unusually high'],
    },
    date: {
      type: Date,
      required: [true, 'Please provide workout date'],
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Composite index for fast filtering by user and date
workoutSchema.index({ user: 1, date: -1 });
workoutSchema.index({ user: 1, type: 1 });

module.exports = mongoose.model('Workout', workoutSchema);
