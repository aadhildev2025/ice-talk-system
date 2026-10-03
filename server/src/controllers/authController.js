const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET, tokenUserCache } = require('../middleware/auth');
const { initDemoUser, generateDemoSalesIfNeeded } = require('../utils/demoSalesService');

// Built-in emergency fallback accounts if MongoDB connection times out
const FALLBACK_CREDENTIALS = {
  superadmin: { name: 'Super Admin (Owner)', role: 'superadmin', department: 'ALL', pass: 'superadmin123' },
  admin: { name: 'Manager Admin', role: 'admin', department: 'ALL', pass: 'admin123' },
  waiter: { name: 'Waiter', role: 'waiter', department: 'ALL', pass: 'waiter123' },
  kitchen: { name: 'Kitchen Chef', role: 'kitchen', department: 'KITCHEN', pass: 'kitchen123' },
  juice: { name: 'Juice Barista', role: 'juice', department: 'JUICE', pass: 'juice123' },
  bun: { name: 'Bun & Bakery Staff', role: 'bun', department: 'BUN', pass: 'bun123' },
  dsuper: { name: 'SuperADMIN', role: 'superadmin', department: 'ALL', pass: 'dsuper123', isDemo: true },
};

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id ? String(user._id) : (user.id || 'usr_admin'),
      name: user.name,
      username: user.username,
      role: user.role,
      department: user.department,
      status: user.status || 'ACTIVE',
      isDemo: Boolean(user.isDemo),
    },
    JWT_SECRET,
    {
      expiresIn: '7d',
    }
  );
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both username and password.',
      });
    }

    const cleanUsername = username.toLowerCase().trim();

    let user = null;
    const mongoose = require('mongoose');

    if (mongoose.connection && mongoose.connection.readyState >= 1) {
      try {
        if (cleanUsername === 'dsuper') {
          await initDemoUser();
        }
        user = await User.findOne({ username: cleanUsername });
      } catch (dbErr) {
        console.warn('[Login DB Query Warning]:', dbErr.message);
      }
    }

    // If MongoDB is offline or user not found in DB, check built-in credentials
    if (!user && FALLBACK_CREDENTIALS[cleanUsername]) {
      const fb = FALLBACK_CREDENTIALS[cleanUsername];
      if (password === fb.pass) {
        user = {
          _id: `usr_${cleanUsername}`,
          id: `usr_${cleanUsername}`,
          name: fb.name,
          username: cleanUsername,
          role: fb.role,
          department: fb.department,
          status: 'ACTIVE',
          isDemo: Boolean(fb.isDemo),
        };
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.',
      });
    }

    if (user.status === 'INACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Contact system administrator.',
      });
    }

    // Check password if mongoose user model
    if (typeof user.matchPassword === 'function') {
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password.',
        });
      }

      if (user.username === 'superadmin' && user.role !== 'superadmin') {
        user.role = 'superadmin';
        await user.save();
      }
    }

    const token = generateToken(user);

    // Cache user in memory for immediate auth validation
    const uid = user._id ? String(user._id) : (user.id || `usr_${cleanUsername}`);
    tokenUserCache.set(uid, {
      _id: uid,
      id: uid,
      name: user.name,
      username: user.username,
      role: user.role,
      department: user.department,
      status: user.status || 'ACTIVE',
      isDemo: Boolean(user.isDemo),
    });

    res.json({
      success: true,
      token,
      user: {
        id: uid,
        name: user.name,
        username: user.username,
        role: user.role,
        department: user.department,
        status: user.status || 'ACTIVE',
        isDemo: Boolean(user.isDemo),
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all staff/users
// @route   GET /api/auth/users
// @access  Private (Admin)
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new staff user
// @route   POST /api/auth/users
// @access  Private (Admin)
const createUser = async (req, res) => {
  try {
    const { name, username, password, role, department, phone } = req.body;

    const existingUser = await User.findOne({ username: username.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    const user = await User.create({
      name,
      username: username.toLowerCase().trim(),
      password,
      role: role || 'waiter',
      department: department || 'ALL',
      phone: phone || '',
    });

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
        department: user.department,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user
// @route   PUT /api/auth/users/:id
// @access  Private (Admin)
const updateUser = async (req, res) => {
  try {
    const { name, role, department, status, phone, password } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (role) user.role = role;
    if (department) user.department = department;
    if (status) user.status = status;
    if (phone !== undefined) user.phone = phone;
    if (password) user.password = password; // Will be hashed by pre-save hook

    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
        department: user.department,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/auth/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (user.role === 'admin' && user.username === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot delete primary admin account' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  login,
  getMe,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
};
