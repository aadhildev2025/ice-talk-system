const GroceryItem = require('../models/GroceryItem');
const localDataService = require('../services/localDataService');
const { emitGroceryUpdated } = require('../socket');

// @desc    Get all grocery items
// @route   GET /api/grocery
// @access  Public / Staff
const getGroceryItems = async (req, res) => {
  try {
    const { category, search, stockStatus } = req.query;
    let items = [];

    try {
      const filter = {};
      if (category && category !== 'All') {
        filter.category = category;
      }
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { barcode: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } },
        ];
      }
      if (stockStatus === 'IN_STOCK') {
        filter.stockQuantity = { $gt: 0 };
      } else if (stockStatus === 'OUT_OF_STOCK') {
        filter.stockQuantity = { $lte: 0 };
      }

      items = await GroceryItem.find(filter).sort({ name: 1 });
    } catch (dbErr) {
      // MongoDB offline
    }

    // Fallback to local computer storage if mongo failed or empty
    if (!items || items.length === 0) {
      items = localDataService.getGroceryItems({ category, search, stockStatus });
    }

    res.json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single grocery item by barcode
// @route   GET /api/grocery/barcode/:barcode
// @access  Public / Staff
const getGroceryItemByBarcode = async (req, res) => {
  try {
    const { barcode } = req.params;
    if (!barcode) {
      return res.status(400).json({ success: false, message: 'Barcode is required' });
    }

    const cleanBarcode = barcode.trim();
    let item = null;

    try {
      item = await GroceryItem.findOne({
        barcode: { $regex: new RegExp(`^${cleanBarcode}$`, 'i') },
      });
    } catch (e) {}

    if (!item) {
      item = localDataService.getGroceryItemByBarcode(cleanBarcode);
    }

    if (!item) {
      return res.status(404).json({
        success: false,
        message: `No grocery product found for barcode: ${cleanBarcode}`,
      });
    }

    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single grocery item by ID
// @route   GET /api/grocery/:id
// @access  Public / Staff
const getGroceryItemById = async (req, res) => {
  try {
    let item = null;
    try {
      item = await GroceryItem.findById(req.params.id);
    } catch (e) {}

    if (!item) {
      item = localDataService.getGroceryItemById(req.params.id);
    }

    if (!item) {
      return res.status(404).json({ success: false, message: 'Grocery item not found' });
    }

    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new grocery item
// @route   POST /api/grocery
// @access  Private (Admin / Superadmin)
const createGroceryItem = async (req, res) => {
  try {
    const {
      name,
      barcode,
      price,
      costPrice,
      stockQuantity,
      category,
      unit,
      lowStockThreshold,
      isAvailable,
      description,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Product name is required' });
    }
    if (!barcode || !String(barcode).trim()) {
      return res.status(400).json({ success: false, message: 'Product barcode is required' });
    }
    if (price === undefined || isNaN(Number(price))) {
      return res.status(400).json({ success: false, message: 'Valid selling price is required' });
    }

    const cleanBarcode = String(barcode).trim();
    const cleanName = name.trim();
    const parsedPrice = Number(price);
    const parsedCost = costPrice !== undefined ? Number(costPrice) : 0;
    const parsedStock = stockQuantity !== undefined ? Math.max(0, Number(stockQuantity)) : 0;
    const parsedThreshold = lowStockThreshold !== undefined ? Number(lowStockThreshold) : 5;

    let item = null;

    // Check existing in MongoDB
    try {
      const existing = await GroceryItem.findOne({
        barcode: { $regex: new RegExp(`^${cleanBarcode}$`, 'i') },
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Product with barcode "${cleanBarcode}" already exists: ${existing.name}`,
        });
      }

      item = await GroceryItem.create({
        name: cleanName,
        barcode: cleanBarcode,
        price: parsedPrice,
        costPrice: parsedCost,
        stockQuantity: parsedStock,
        category: category ? String(category).trim() : '',
        unit: (unit || 'pcs').trim(),
        lowStockThreshold: parsedThreshold,
        isAvailable: isAvailable !== false,
        description: (description || '').trim(),
      });
    } catch (dbErr) {
      if (dbErr.code === 11000) {
        return res.status(400).json({
          success: false,
          message: `Product with barcode "${cleanBarcode}" already exists.`,
        });
      }
    }

    // Always persist to local computer storage
    let localSaved = null;
    try {
      localSaved = localDataService.saveGroceryItem({
        _id: item ? String(item._id) : undefined,
        name: cleanName,
        barcode: cleanBarcode,
        price: parsedPrice,
        costPrice: parsedCost,
        stockQuantity: parsedStock,
        category: category ? String(category).trim() : '',
        unit: (unit || 'pcs').trim(),
        lowStockThreshold: parsedThreshold,
        isAvailable: isAvailable !== false,
        description: (description || '').trim(),
      });
    } catch (localErr) {
      if (!item) {
        return res.status(400).json({ success: false, message: localErr.message });
      }
    }

    const result = item || localSaved;
    emitGroceryUpdated(result);

    res.status(201).json({
      success: true,
      message: 'Grocery product added successfully',
      item: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update grocery item
// @route   PUT /api/grocery/:id
// @access  Private (Admin / Superadmin)
const updateGroceryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      barcode,
      price,
      costPrice,
      stockQuantity,
      category,
      unit,
      lowStockThreshold,
      isAvailable,
      description,
    } = req.body;

    let item = null;
    try {
      item = await GroceryItem.findById(id);
    } catch (e) {}

    const cleanBarcode = barcode ? String(barcode).trim() : undefined;

    if (item) {
      if (cleanBarcode && cleanBarcode !== item.barcode) {
        const duplicate = await GroceryItem.findOne({
          _id: { $ne: id },
          barcode: { $regex: new RegExp(`^${cleanBarcode}$`, 'i') },
        });
        if (duplicate) {
          return res.status(400).json({
            success: false,
            message: `Another product with barcode "${cleanBarcode}" already exists (${duplicate.name})`,
          });
        }
        item.barcode = cleanBarcode;
      }

      if (name) item.name = name.trim();
      if (price !== undefined) item.price = Number(price);
      if (costPrice !== undefined) item.costPrice = Number(costPrice);
      if (stockQuantity !== undefined) item.stockQuantity = Math.max(0, Number(stockQuantity));
      if (category !== undefined) item.category = category.trim();
      if (unit !== undefined) item.unit = unit.trim();
      if (lowStockThreshold !== undefined) item.lowStockThreshold = Number(lowStockThreshold);
      if (isAvailable !== undefined) item.isAvailable = isAvailable;
      if (description !== undefined) item.description = description.trim();

      await item.save();
    }

    // Always update local computer storage
    const updatedLocal = localDataService.updateGroceryItem(id, {
      name,
      barcode: cleanBarcode,
      price,
      costPrice,
      stockQuantity,
      category,
      unit,
      lowStockThreshold,
      isAvailable,
      description,
    });

    const result = item || updatedLocal;
    if (!result) {
      return res.status(404).json({ success: false, message: 'Grocery item not found' });
    }

    emitGroceryUpdated(result);

    res.json({
      success: true,
      message: 'Grocery product updated successfully',
      item: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Adjust grocery stock quantity directly (+ or - delta or set exact)
// @route   PATCH /api/grocery/:id/adjust-stock
// @access  Private (Admin / Staff)
const adjustStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { delta, newQuantity, reason } = req.body;

    let item = null;
    try {
      item = await GroceryItem.findById(id);
    } catch (e) {}

    let updatedStock = 0;

    if (item) {
      if (newQuantity !== undefined) {
        updatedStock = Math.max(0, Number(newQuantity));
      } else if (delta !== undefined) {
        updatedStock = Math.max(0, (item.stockQuantity || 0) + Number(delta));
      }
      item.stockQuantity = updatedStock;
      await item.save();
    }

    // Also update local data
    let localResult = null;
    if (newQuantity !== undefined) {
      localResult = localDataService.updateGroceryItem(id, { stockQuantity: Number(newQuantity) });
    } else if (delta !== undefined) {
      localResult = localDataService.adjustGroceryStock(id, Number(delta));
    }

    const result = item || localResult;
    if (!result) {
      return res.status(404).json({ success: false, message: 'Grocery product not found' });
    }

    emitGroceryUpdated(result);

    res.json({
      success: true,
      message: `Stock adjusted to ${result.stockQuantity} units`,
      item: result,
      reason,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete grocery item
// @route   DELETE /api/grocery/:id
// @access  Private (Admin / Superadmin)
const deleteGroceryItem = async (req, res) => {
  try {
    const { id } = req.params;
    try {
      await GroceryItem.findByIdAndDelete(id);
    } catch (e) {}

    localDataService.deleteGroceryItem(id);

    emitGroceryUpdated({ _id: id, deleted: true });

    res.json({
      success: true,
      message: 'Grocery product deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getGroceryItems,
  getGroceryItemByBarcode,
  getGroceryItemById,
  createGroceryItem,
  updateGroceryItem,
  adjustStock,
  deleteGroceryItem,
};
