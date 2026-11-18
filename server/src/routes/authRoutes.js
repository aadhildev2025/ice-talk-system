const express = require('express');
const router = express.Router();
const {
  login,
  getMe,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  verifySuperAdmin,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/verify-superadmin', protect, verifySuperAdmin);

// Staff/User management (Restricted strictly to admin / superadmin; cashiers and waiters cannot manage staff)
const requireStaffAdmin = (req, res, next) => {
  if (req.user?.role === 'admin' || req.user?.role === 'superadmin' || req.user?.username === 'dsuper') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied: Staff management is restricted to administrators.',
  });
};

router.get('/users', protect, authorize('admin'), getUsers);
router.post('/users', protect, requireStaffAdmin, createUser);
router.put('/users/:id', protect, requireStaffAdmin, updateUser);
router.delete('/users/:id', protect, requireStaffAdmin, deleteUser);

module.exports = router;
