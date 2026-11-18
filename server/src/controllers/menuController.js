const MenuItem = require('../models/MenuItem');
const Category = require('../models/Category');
const localDataService = require('../services/localDataService');
const { emitMenuUpdated } = require('../socket');

// @desc    Get all menu items
// @route   GET /api/menu
// @access  Public / Staff
const getMenuItems = async (req, res) => {
  try {
    const { category, department, isAvailable, search } = req.query;
    const filter = {};

    if (category && category !== 'All') {
      filter.category = category;
    }
    if (department && department !== 'ALL') {
      filter.department = department;
    }
    if (isAvailable !== undefined) {
      filter.isAvailable = isAvailable === 'true';
    }
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const items = await MenuItem.find(filter).sort({ category: 1, name: 1 });
    res.json({ success: true, count: items.length, items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single menu item
// @route   GET /api/menu/:id
// @access  Public / Staff
const getMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }
    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create menu item
// @route   POST /api/menu
// @access  Private (Admin)
const createMenuItem = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      department,
      image,
      prepTimeMinutes,
      isPopular,
      hasPortions,
      portionPrices,
      availablePortions,
    } = req.body;

    if (!name || price === undefined || !category) {
      return res.status(400).json({ success: false, message: 'Name, price, and category are required' });
    }

    const item = await MenuItem.create({
      name: name.trim(),
      description: description || '',
      price: Number(price),
      category: category.trim(),
      department: department || 'KITCHEN',
      image: image || '',
      prepTimeMinutes: prepTimeMinutes ? Number(prepTimeMinutes) : 10,
      isPopular: !!isPopular,
      isAvailable: true,
      hasPortions: !!hasPortions,
      portionPrices: portionPrices || { portion: Number(price) },
      availablePortions: availablePortions || ['Portion'],
    });

    emitMenuUpdated();

    res.status(201).json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Private (Admin)
const updateMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    const {
      name,
      description,
      price,
      category,
      department,
      image,
      isAvailable,
      prepTimeMinutes,
      isPopular,
      hasPortions,
      portionPrices,
      availablePortions,
    } = req.body;

    if (name) item.name = name.trim();
    if (description !== undefined) item.description = description;
    if (price !== undefined) item.price = Number(price);
    if (category) item.category = category.trim();
    if (department) item.department = department;
    if (image !== undefined) item.image = image;
    if (isAvailable !== undefined) item.isAvailable = isAvailable;
    if (prepTimeMinutes !== undefined) item.prepTimeMinutes = Number(prepTimeMinutes);
    if (isPopular !== undefined) item.isPopular = isPopular;
    if (hasPortions !== undefined) item.hasPortions = !!hasPortions;
    if (portionPrices !== undefined) item.portionPrices = portionPrices;
    if (availablePortions !== undefined) item.availablePortions = availablePortions;

    await item.save();

    emitMenuUpdated();

    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle item availability
// @route   PATCH /api/menu/:id/toggle-availability
// @access  Private (Admin/Staff)
const toggleAvailability = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    item.isAvailable = !item.isAvailable;
    await item.save();

    emitMenuUpdated();

    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Private (Admin)
const deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    await MenuItem.findByIdAndDelete(req.params.id);

    emitMenuUpdated();

    res.json({ success: true, message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all categories
// @route   GET /api/categories or GET /api/menu/categories/all
// @access  Public / Staff
const getCategories = async (req, res) => {
  try {
    let categories = [];
    try {
      categories = await Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
    } catch (e) {
      // Mongo offline
    }

    if (!categories || categories.length === 0) {
      categories = localDataService.getCategories();
    }

    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create category
// @route   POST /api/categories or POST /api/menu/categories
// @access  Private (Admin)
const createCategory = async (req, res) => {
  try {
    const { name, department, icon, sortOrder } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const trimmedName = name.trim();
    let finalDept = (department || 'KITCHEN').toUpperCase();
    if (!['KITCHEN', 'JUICE', 'BUN', 'OTHER'].includes(finalDept)) {
      finalDept = 'KITCHEN';
    }

    let category = null;
    try {
      const existing = await Category.findOne({ name: { $regex: new RegExp(`^${trimmedName}$`, 'i') } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Category already exists' });
      }

      category = await Category.create({
        name: trimmedName,
        department: finalDept,
        icon: icon || 'Utensils',
        sortOrder: sortOrder || 0,
        isActive: true,
      });
    } catch (dbErr) {
      category = {
        _id: `cat_${Date.now()}`,
        name: trimmedName,
        department: finalDept,
        icon: icon || 'Utensils',
        sortOrder: sortOrder || 0,
        isActive: true,
      };
    }

    // Always persist to local computer storage
    localDataService.saveCategory(category);

    emitMenuUpdated();

    res.status(201).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update category (name, department)
// @route   PUT /api/categories/:id
// @access  Private (Admin)
const updateCategory = async (req, res) => {
  try {
    const { name, department, icon, sortOrder } = req.body;
    let category = null;
    try {
      category = await Category.findById(req.params.id);
    } catch {}

    const oldName = category ? category.name : req.params.id;
    const finalDept = department && ['KITCHEN', 'JUICE', 'BUN', 'OTHER'].includes(department.toUpperCase())
      ? department.toUpperCase()
      : undefined;

    if (category) {
      if (name && name.trim()) category.name = name.trim();
      if (finalDept) category.department = finalDept;
      if (icon) category.icon = icon;
      if (sortOrder !== undefined) category.sortOrder = sortOrder;
      await category.save();

      // If department or name was changed, sync all menu items under this category
      const updateFields = {};
      if (name && name.trim() && name.trim() !== oldName) {
        updateFields.category = name.trim();
      }
      if (finalDept) {
        updateFields.department = finalDept;
      }

      if (Object.keys(updateFields).length > 0) {
        try {
          await MenuItem.updateMany({ category: oldName }, updateFields);
        } catch {}
      }
    }

    localDataService.updateCategory(req.params.id, {
      name: name?.trim(),
      department: finalDept,
      icon,
      sortOrder,
    });

    emitMenuUpdated();

    res.json({ success: true, category: category || { _id: req.params.id, name, department: finalDept } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
const deleteCategory = async (req, res) => {
  try {
    try {
      await Category.findByIdAndDelete(req.params.id);
    } catch {}

    localDataService.deleteCategory(req.params.id);

    emitMenuUpdated();

    res.json({ success: true, message: 'Category removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Seed or restore default menu items to MongoDB
// @route   POST /api/menu/seed-default
// @access  Private (Admin)
const seedDefaultMenu = async (req, res) => {
  try {
    const { defaultMenuItems, defaultCategories } = require('../seed');
    
    // Ensure categories exist
    for (const cat of defaultCategories) {
      const exists = await Category.findOne({ name: cat.name });
      if (!exists) {
        await Category.create(cat);
      }
    }

    // Insert any missing default menu items
    let addedCount = 0;
    for (const item of defaultMenuItems) {
      const exists = await MenuItem.findOne({ name: item.name });
      if (!exists) {
        await MenuItem.create(item);
        addedCount++;
      }
    }

    emitMenuUpdated();

    res.json({
      success: true,
      message: `Default menu verified. Added ${addedCount} missing menu items.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  toggleAvailability,
  deleteMenuItem,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  seedDefaultMenu,
};
