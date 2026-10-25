const Workout = require('../models/Workout');

// Valid workout types
const VALID_TYPES = ['Cardio', 'Strength', 'Yoga', 'Running', 'Cycling', 'Other'];

// @desc    Create a new workout
// @route   POST /api/workouts
// @access  Private
exports.createWorkout = async (req, res, next) => {
  try {
    const { name, type, duration, calories, date, notes } = req.body;

    // Field presence checks
    if (!name || !type || duration === undefined || calories === undefined || !date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide workout name, type, duration, calories burned, and date.',
      });
    }

    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid workout type. Must be one of: ${VALID_TYPES.join(', ')}`,
      });
    }

    const durationNum = Number(duration);
    const caloriesNum = Number(calories);

    if (isNaN(durationNum) || durationNum <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Duration must be a positive number of minutes.',
      });
    }

    if (isNaN(caloriesNum) || caloriesNum < 0) {
      return res.status(400).json({
        success: false,
        message: 'Calories burned must be zero or a positive number.',
      });
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid workout date.',
      });
    }

    const workout = await Workout.create({
      user: req.user._id,
      name: name.trim(),
      type,
      duration: durationNum,
      calories: caloriesNum,
      date: parsedDate,
      notes: notes ? notes.trim() : '',
    });

    res.status(201).json({
      success: true,
      message: 'Workout logged successfully!',
      workout,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all workouts for logged in user (with filtering)
// @route   GET /api/workouts
// @access  Private
exports.getWorkouts = async (req, res, next) => {
  try {
    const { type, startDate, endDate, search } = req.query;

    // Base query scoped strictly to the authenticated user
    const query = { user: req.user._id };

    // Filter by workout type
    if (type && type !== 'All') {
      if (VALID_TYPES.includes(type)) {
        query.type = type;
      }
    }

    // Filter by date range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.date.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    // Keyword search in name or notes
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { notes: regex }];
    }

    const workouts = await Workout.find(query).sort({ date: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: workouts.length,
      workouts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single workout by ID
// @route   GET /api/workouts/:id
// @access  Private
exports.getWorkoutById = async (req, res, next) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found or you are not authorized to view it.',
      });
    }

    res.status(200).json({
      success: true,
      workout,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a workout
// @route   PUT /api/workouts/:id
// @access  Private
exports.updateWorkout = async (req, res, next) => {
  try {
    const { name, type, duration, calories, date, notes } = req.body;

    const workout = await Workout.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found or you do not have permission to edit it.',
      });
    }

    if (type && !VALID_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid workout type. Must be one of: ${VALID_TYPES.join(', ')}`,
      });
    }

    if (duration !== undefined) {
      const durationNum = Number(duration);
      if (isNaN(durationNum) || durationNum <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Duration must be a positive number of minutes.',
        });
      }
      workout.duration = durationNum;
    }

    if (calories !== undefined) {
      const caloriesNum = Number(calories);
      if (isNaN(caloriesNum) || caloriesNum < 0) {
        return res.status(400).json({
          success: false,
          message: 'Calories burned must be zero or a positive number.',
        });
      }
      workout.calories = caloriesNum;
    }

    if (name) workout.name = name.trim();
    if (type) workout.type = type;
    if (date) {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid date.',
        });
      }
      workout.date = parsedDate;
    }
    if (notes !== undefined) workout.notes = notes.trim();

    await workout.save();

    res.status(200).json({
      success: true,
      message: 'Workout updated successfully!',
      workout,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a workout
// @route   DELETE /api/workouts/:id
// @access  Private
exports.deleteWorkout = async (req, res, next) => {
  try {
    const workout = await Workout.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found or you do not have permission to delete it.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Workout deleted successfully.',
      deletedId: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};
