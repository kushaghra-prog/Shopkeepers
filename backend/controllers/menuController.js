const MenuItem = require('../models/MenuItem');

// @desc    Get all menu items
// @route   GET /api/menu
const getMenuItems = async (req, res, next) => {
  try {
    const { category, search, isAvailable } = req.query;
    const query = { restaurant: req.user._id };
    if (category) query.category = category;
    if (isAvailable !== undefined) query.isAvailable = isAvailable === 'true';
    if (search) query.name = { $regex: search, $options: 'i' };

    const items = await MenuItem.find(query).sort({ category: 1, name: 1 });
    res.json(items);
  } catch (error) {
    next(error);
  }
};

// @desc    Create menu item
// @route   POST /api/menu
const createMenuItem = async (req, res, next) => {
  try {
    const data = { ...req.body, restaurant: req.user._id };
    if (req.file) data.image = `/uploads/${req.file.filename}`;
    const item = await MenuItem.create(data);
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

// @desc    Update menu item
// @route   PUT /api/menu/:id
const updateMenuItem = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (req.file) data.image = `/uploads/${req.file.filename}`;
    const item = await MenuItem.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
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
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle availability
// @route   PATCH /api/menu/:id/toggle
const toggleAvailability = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    item.isAvailable = !item.isAvailable;
    await item.save();
    res.json(item);
  } catch (error) {
    next(error);
  }
};

module.exports = { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem, toggleAvailability };
