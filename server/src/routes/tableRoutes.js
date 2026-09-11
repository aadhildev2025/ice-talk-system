const express = require('express');
const router = express.Router();
const {
  getTables,
  createTable,
  updateTable,
  deleteTable,
  getFloors,
  createFloor,
  deleteFloor,
  updateFloor,
} = require('../controllers/tableController');
const { protect, authorize } = require('../middleware/auth');

// Floor routes (Must be defined before /:id)
router.get('/floors', protect, getFloors);
router.post('/floors', protect, authorize('admin'), createFloor);
router.put('/floors/:id', protect, authorize('admin'), updateFloor);
router.delete('/floors/:id', protect, authorize('admin'), deleteFloor);

// Table routes
router.get('/', protect, getTables);
router.post('/', protect, authorize('admin'), createTable);
router.put('/:id', protect, authorize('admin'), updateTable);
router.delete('/:id', protect, authorize('admin'), deleteTable);

module.exports = router;
