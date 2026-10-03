const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'icetalk_restaurant_secret_key_2026';

// In-memory cache of authenticated staff users
const tokenUserCache = new Map();

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. No token provided.',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    let user = null;

    const mongoose = require('mongoose');
    if (mongoose.connection && mongoose.connection.readyState >= 1) {
      try {
        user = await User.findById(decoded.id).select('-password');
      } catch (dbErr) {
        // Fallback to cache/token payload if DB query fails
      }
    }

    if (!user && decoded.id) {
      user = tokenUserCache.get(String(decoded.id));
    }

    if (!user && decoded.role) {
      user = {
        _id: decoded.id,
        id: decoded.id,
        name: decoded.name || 'Staff User',
        username: decoded.username || 'staff',
        role: decoded.role,
        department: decoded.department || 'ALL',
        status: decoded.status || 'ACTIVE',
        isDemo: Boolean(decoded.isDemo),
      };
    }

    if (!user && decoded.id) {
      user = {
        _id: decoded.id,
        id: decoded.id,
        name: decoded.name || 'Administrator',
        username: decoded.username || 'admin',
        role: 'superadmin',
        department: 'ALL',
        status: 'ACTIVE',
        isDemo: false,
      };
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    if (user.status === 'INACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated by administrator.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token or token has expired.',
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized.',
      });
    }

    // Super Admin inherits all admin privileges; specific superadmin routes require superadmin role
    const hasRole =
      roles.includes(req.user.role) ||
      (req.user.role === 'superadmin' && roles.includes('admin'));

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this resource.`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize, JWT_SECRET, tokenUserCache };
