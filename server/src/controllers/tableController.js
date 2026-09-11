const Table = require('../models/Table');
const Floor = require('../models/Floor');
const Order = require('../models/Order');
const { emitTableUpdated } = require('../socket');

// @desc    Get all tables with active orders status
// @route   GET /api/tables
// @access  Private (Staff)
const getTables = async (req, res) => {
  try {
    const tables = await Table.find({ isActive: true }).sort({ floor: 1, sortOrder: 1, createdAt: 1 });

    // Fetch active unsettled orders
    const activeOrders = await Order.find({
      status: { $in: ['PENDING', 'APPROVED', 'PREPARING', 'READY'] },
      isSettled: false,
    });

    // Map active orders to tables
    const tablesWithActiveOrders = tables.map((t) => {
      const ordersForTable = activeOrders.filter(
        (o) => o.tableId && o.tableId.toString() === t._id.toString()
      );
      const totalAmount = ordersForTable.reduce((sum, o) => sum + (o.total || 0), 0);
      const hasActiveOrder = ordersForTable.length > 0;

      let computedStatus = t.status;
      if (t.status !== 'DISABLED' && t.status !== 'RESERVED') {
        if (hasActiveOrder) {
          computedStatus = 'OCCUPIED';
        } else {
          computedStatus = 'AVAILABLE';
        }
      }

      return {
        ...t.toObject(),
        status: computedStatus,
        hasActiveOrder,
        activeOrdersCount: ordersForTable.length,
        activeOrdersTotal: totalAmount,
        activeOrders: ordersForTable.map((o) => ({
          _id: o._id,
          orderNumber: o.orderNumber,
          status: o.status,
          total: o.total,
          createdAt: o.createdAt,
          itemsCount: o.items.length,
        })),
      };
    });

    res.json({ success: true, count: tablesWithActiveOrders.length, tables: tablesWithActiveOrders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new table
// @route   POST /api/tables
// @access  Private (Admin)
const createTable = async (req, res) => {
  try {
    const { name, capacity, type, floor, sortOrder } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Table name is required' });
    }

    const table = await Table.create({
      name: name.trim(),
      capacity: capacity ? Number(capacity) : 4,
      type: type || 'Family',
      floor: floor ? floor.trim() : 'Ground Floor',
      sortOrder: sortOrder || 0,
      status: 'AVAILABLE',
      isActive: true,
    });

    emitTableUpdated(table);

    res.status(201).json({ success: true, table });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update / Rename table
// @route   PUT /api/tables/:id
// @access  Private (Admin)
const updateTable = async (req, res) => {
  try {
    const { name, capacity, type, floor, status, sortOrder, isActive } = req.body;
    const table = await Table.findById(req.params.id);

    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }

    if (name) table.name = name.trim();
    if (capacity !== undefined) table.capacity = Number(capacity);
    if (type) table.type = type;
    if (floor !== undefined) table.floor = floor.trim() || 'Ground Floor';
    if (status) table.status = status;
    if (sortOrder !== undefined) table.sortOrder = Number(sortOrder);
    if (isActive !== undefined) table.isActive = isActive;

    await table.save();

    emitTableUpdated(table);

    res.json({ success: true, table });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete table (soft delete or hard delete if no active orders)
// @route   DELETE /api/tables/:id
// @access  Private (Admin)
const deleteTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }

    // Check active orders
    const activeOrder = await Order.findOne({
      tableId: table._id,
      status: { $in: ['PENDING', 'APPROVED', 'PREPARING', 'READY'] },
      isSettled: false,
    });

    if (activeOrder) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete table with active unsettled orders. Please settle or cancel orders first.',
      });
    }

    table.isActive = false;
    table.status = 'DISABLED';
    await table.save();

    emitTableUpdated(table);

    res.json({ success: true, message: 'Table disabled/removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all active floors
// @route   GET /api/tables/floors
// @access  Private (Staff)
const getFloors = async (req, res) => {
  try {
    let dbFloors = await Floor.find({ isActive: true }).sort({ sortOrder: 1, createdAt: 1 });

    // Seed default floors if none exist yet
    if (dbFloors.length === 0) {
      const defaultFloorNames = ['Ground Floor', '1st Floor', '2nd Floor'];
      const seeded = [];
      for (let i = 0; i < defaultFloorNames.length; i++) {
        const fl = await Floor.create({ name: defaultFloorNames[i], sortOrder: i });
        seeded.push(fl);
      }
      dbFloors = seeded;
    }

    res.json({ success: true, count: dbFloors.length, floors: dbFloors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new floor
// @route   POST /api/tables/floors
// @access  Private (Admin)
const createFloor = async (req, res) => {
  try {
    const { name, sortOrder } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Floor name is required' });
    }

    const trimmed = name.trim();
    let floor = await Floor.findOne({ name: { $regex: new RegExp(`^${trimmed}$`, 'i') } });
    if (floor) {
      if (!floor.isActive) {
        floor.isActive = true;
        await floor.save();
        return res.status(200).json({ success: true, floor });
      }
      return res.status(400).json({ success: false, message: 'A floor with this name already exists' });
    }

    const count = await Floor.countDocuments();
    floor = await Floor.create({
      name: trimmed,
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : count + 1,
      isActive: true,
    });

    res.status(201).json({ success: true, floor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a floor
// @route   DELETE /api/tables/floors/:id
// @access  Private (Admin)
const deleteFloor = async (req, res) => {
  try {
    const { id } = req.params;
    let floor = await Floor.findById(id);
    if (!floor) {
      floor = await Floor.findOne({ name: id });
    }

    if (!floor) {
      return res.status(404).json({ success: false, message: 'Floor not found' });
    }

    // Check if tables are assigned to this floor and reassign to Ground Floor
    const assignedTables = await Table.countDocuments({ floor: floor.name, isActive: true });
    if (assignedTables > 0) {
      await Table.updateMany({ floor: floor.name }, { $set: { floor: 'Ground Floor' } });
    }

    await Floor.deleteOne({ _id: floor._id });

    res.json({
      success: true,
      message: `Floor "${floor.name}" removed successfully.${
        assignedTables > 0 ? ` Reassigned ${assignedTables} table(s) to Ground Floor.` : ''
      }`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update / Rename a floor
// @route   PUT /api/tables/floors/:id
// @access  Private (Admin)
const updateFloor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sortOrder } = req.body;

    const floor = await Floor.findById(id);
    if (!floor) {
      return res.status(404).json({ success: false, message: 'Floor not found' });
    }

    const oldName = floor.name;
    if (name && name.trim()) {
      const newName = name.trim();
      floor.name = newName;
      if (oldName !== newName) {
        await Table.updateMany({ floor: oldName }, { $set: { floor: newName } });
      }
    }
    if (sortOrder !== undefined) {
      floor.sortOrder = Number(sortOrder);
    }

    await floor.save();

    res.json({ success: true, floor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTables,
  createTable,
  updateTable,
  deleteTable,
  getFloors,
  createFloor,
  deleteFloor,
  updateFloor,
};
