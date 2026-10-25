const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'fittrack_jwt_secret_key_change_in_production_12345',
    {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    }
  );
};

// Helper to send token response with cookie and JSON
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = generateToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  };

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      message,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        weeklyGoal: user.weeklyGoal,
        createdAt: user.createdAt,
      },
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Create user in database
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
    });

    sendTokenResponse(user, 201, res, 'Registration successful!');
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user by email and explicitly include password for verification
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Verify password match
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    sendTokenResponse(user, 200, res, 'Login successful!');
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
exports.logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'User logged out successfully.',
  });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        weeklyGoal: req.user.weeklyGoal,
        createdAt: req.user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user weekly workout goal
// @route   PUT /api/users/goal
// @access  Private
exports.updateWeeklyGoal = async (req, res, next) => {
  try {
    const { weeklyGoal } = req.body;
    const goalNum = parseInt(weeklyGoal, 10);

    if (isNaN(goalNum) || goalNum < 1 || goalNum > 21) {
      return res.status(400).json({
        success: false,
        message: 'Weekly goal must be a valid number between 1 and 21.',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { weeklyGoal: goalNum },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Weekly workout goal updated successfully!',
      weeklyGoal: user.weeklyGoal,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        weeklyGoal: user.weeklyGoal,
      },
    });
  } catch (error) {
    next(error);
  }
};
