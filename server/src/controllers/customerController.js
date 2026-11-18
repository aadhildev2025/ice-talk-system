const localDataService = require('../services/localDataService');
let Customer = null;
try {
  Customer = require('../models/Customer');
} catch {}

// @desc    Get all customers with optional search & pagination
// @route   GET /api/customers
// @access  Private (Staff)
const getCustomers = async (req, res) => {
  try {
    const { search, limit = 100, page = 1 } = req.query;
    let customers = localDataService.getCustomers({ search });

    // Also sync from MongoDB if available
    if (Customer && req.query.fresh === 'true') {
      try {
        const query = search
          ? {
              $or: [
                { name: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
              ],
            }
          : {};
        const dbCustomers = await Customer.find(query).sort({ updatedAt: -1 }).limit(parseInt(limit) || 100);
        if (dbCustomers.length > 0) {
          // Merge
          dbCustomers.forEach((dbc) => {
            localDataService.findOrCreateCustomer(dbc.name, dbc.phone, 0);
          });
          customers = localDataService.getCustomers({ search });
        }
      } catch {}
    }

    const totalCount = customers.length;
    const lim = parseInt(limit) || 100;
    const pg = parseInt(page) || 1;
    const skip = (pg - 1) * lim;
    const paginated = customers.slice(skip, skip + lim);

    res.json({
      success: true,
      customers: paginated,
      data: paginated,
      total: totalCount,
      count: totalCount,
      pagination: {
        page: pg,
        limit: lim,
        totalCount,
        totalPages: Math.ceil(totalCount / lim) || 1,
      },
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single customer by ID
// @route   GET /api/customers/:id
// @access  Private (Staff)
const getCustomerById = async (req, res) => {
  try {
    const customer = localDataService.getCustomerById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new customer
// @route   POST /api/customers
// @access  Private (Staff)
const createCustomer = async (req, res) => {
  try {
    const { name, phone, email, address, notes } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Customer name is required' });
    }

    const newCustomer = localDataService.saveCustomer({
      name: name.trim(),
      phone: phone ? phone.trim() : '',
      email: email ? email.trim() : '',
      address: address ? address.trim() : '',
      notes: notes ? notes.trim() : '',
      totalOrders: 0,
      totalSpent: 0,
    });

    if (Customer) {
      try {
        await Customer.create({
          name: newCustomer.name,
          phone: newCustomer.phone,
          email: newCustomer.email,
          address: newCustomer.address,
          notes: newCustomer.notes,
        });
      } catch {}
    }

    res.status(201).json({
      success: true,
      message: `Customer "${newCustomer.name}" created successfully`,
      customer: newCustomer,
    });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update customer profile
// @route   PUT /api/customers/:id
// @access  Private (Staff)
const updateCustomer = async (req, res) => {
  try {
    const { name, phone, email, address, notes, totalOrders, totalSpent } = req.body;
    const updated = localDataService.updateCustomer(req.params.id, {
      ...(name ? { name: name.trim() } : {}),
      ...(phone !== undefined ? { phone: phone.trim() } : {}),
      ...(email !== undefined ? { email: email.trim() } : {}),
      ...(address !== undefined ? { address: address.trim() } : {}),
      ...(notes !== undefined ? { notes: notes.trim() } : {}),
      ...(totalOrders !== undefined ? { totalOrders: Number(totalOrders) } : {}),
      ...(totalSpent !== undefined ? { totalSpent: Number(totalSpent) } : {}),
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    if (Customer) {
      try {
        await Customer.findByIdAndUpdate(req.params.id, {
          ...(name ? { name: name.trim() } : {}),
          ...(phone !== undefined ? { phone: phone.trim() } : {}),
          ...(email !== undefined ? { email: email.trim() } : {}),
          ...(address !== undefined ? { address: address.trim() } : {}),
          ...(notes !== undefined ? { notes: notes.trim() } : {}),
        });
      } catch {}
    }

    res.json({
      success: true,
      message: 'Customer updated successfully',
      customer: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private (Admin)
const deleteCustomer = async (req, res) => {
  try {
    localDataService.deleteCustomer(req.params.id);
    if (Customer) {
      try {
        await Customer.findByIdAndDelete(req.params.id);
      } catch {}
    }
    res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
