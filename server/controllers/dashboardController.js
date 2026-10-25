const mongoose = require('mongoose');
const Workout = require('../models/Workout');

// @desc    Get dashboard statistics calculated from user's database records
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Overall stats: total workouts, total duration, total calories
    const totalsAgg = await Workout.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalWorkouts: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
          totalCalories: { $sum: '$calories' },
        },
      },
    ]);

    const totalWorkouts = totalsAgg.length > 0 ? totalsAgg[0].totalWorkouts : 0;
    const totalDuration = totalsAgg.length > 0 ? totalsAgg[0].totalDuration : 0;
    const totalCalories = totalsAgg.length > 0 ? totalsAgg[0].totalCalories : 0;

    // 2. Calculate current week range (Monday 00:00 to Sunday 23:59:59)
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday...
    // Distance back to Monday (if Sunday (0), distance is 6; otherwise dayOfWeek - 1)
    const distanceToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - distanceToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Workouts completed this week
    const workoutsThisWeek = await Workout.countDocuments({
      user: userId,
      date: { $gte: startOfWeek, $lte: endOfWeek },
    });

    // Duration and calories this week
    const thisWeekAgg = await Workout.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: startOfWeek, $lte: endOfWeek },
        },
      },
      {
        $group: {
          _id: null,
          weeklyDuration: { $sum: '$duration' },
          weeklyCalories: { $sum: '$calories' },
        },
      },
    ]);

    const weeklyDuration = thisWeekAgg.length > 0 ? thisWeekAgg[0].weeklyDuration : 0;
    const weeklyCalories = thisWeekAgg.length > 0 ? thisWeekAgg[0].weeklyCalories : 0;

    // Goal calculation
    const weeklyGoal = req.user.weeklyGoal || 5;
    const goalProgressPercent = Math.min(
      100,
      Math.round((workoutsThisWeek / weeklyGoal) * 100)
    );

    // 3. Daily chart data for the current week (Monday through Sunday)
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const chartLabels = [];
    const chartDates = [];
    const chartDurations = [0, 0, 0, 0, 0, 0, 0];
    const chartCalories = [0, 0, 0, 0, 0, 0, 0];
    const chartWorkoutCounts = [0, 0, 0, 0, 0, 0, 0];

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      chartLabels.push(`${weekDays[i]} (${d.getMonth() + 1}/${d.getDate()})`);
      chartDates.push(dateStr);
    }

    // Fetch all workouts this week to map into daily buckets
    const weekWorkouts = await Workout.find({
      user: userId,
      date: { $gte: startOfWeek, $lte: endOfWeek },
    });

    weekWorkouts.forEach((w) => {
      const wDate = new Date(w.date);
      // Determine day offset from startOfWeek
      const diffTime = wDate.getTime() - startOfWeek.getTime();
      const dayIndex = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (dayIndex >= 0 && dayIndex < 7) {
        chartDurations[dayIndex] += w.duration;
        chartCalories[dayIndex] += w.calories;
        chartWorkoutCounts[dayIndex] += 1;
      }
    });

    // 4. Workout type breakdown
    const typeBreakdownAgg = await Workout.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
          totalCalories: { $sum: '$calories' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const typeBreakdown = typeBreakdownAgg.map((item) => ({
      type: item._id,
      count: item.count,
      totalDuration: item.totalDuration,
      totalCalories: item.totalCalories,
    }));

    // 5. Recent 5 workouts
    const recentWorkouts = await Workout.find({ user: userId })
      .sort({ date: -1, createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalWorkouts,
          totalDuration, // in minutes
          totalCalories,
          workoutsThisWeek,
          weeklyDuration,
          weeklyCalories,
          weeklyGoal,
          goalProgressPercent,
        },
        chart: {
          labels: chartLabels,
          dates: chartDates,
          durations: chartDurations,
          calories: chartCalories,
          workoutCounts: chartWorkoutCounts,
        },
        typeBreakdown,
        recentWorkouts,
      },
    });
  } catch (error) {
    next(error);
  }
};
