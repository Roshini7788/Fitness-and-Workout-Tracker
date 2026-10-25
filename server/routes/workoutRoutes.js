const express = require('express');
const router = express.Router();
const {
  createWorkout,
  getWorkouts,
  getWorkoutById,
  updateWorkout,
  deleteWorkout,
} = require('../controllers/workoutController');
const { protect } = require('../middleware/authMiddleware');

// All workout routes require authentication
router.use(protect);

router.route('/')
  .post(createWorkout)
  .get(getWorkouts);

router.route('/:id')
  .get(getWorkoutById)
  .put(updateWorkout)
  .delete(deleteWorkout);

module.exports = router;
