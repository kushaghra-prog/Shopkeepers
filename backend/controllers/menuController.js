const bb = require('../services/bbDataService');

// @desc    Get menu items
// @route   GET /api/menu
const getMenuItems = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const items = await bb.getProducts({ category, search });
    res.json(items);
  } catch (error) {
    next(error);
  }
};

// @desc    Create menu item
// @route   POST /api/menu
const createMenuItem = async (req, res, next) => {
  try {
    const item = await bb.createProduct(req.body);
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

// @desc    Update menu item
// @route   PUT /api/menu/:id
const updateMenuItem = async (req, res, next) => {
  try {
    const item = await bb.updateProduct(req.params.id, req.body);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
const deleteMenuItem = async (req, res, next) => {
  try {
    const deleted = await bb.deleteProduct(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Item deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle availability
// @route   PATCH /api/menu/:id/toggle
const toggleAvailability = async (req, res, next) => {
  try {
    const item = await bb.toggleProductAvailability(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (error) {
    next(error);
  }
};

module.exports = { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem, toggleAvailability };
