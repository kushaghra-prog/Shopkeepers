const bb = require('../services/bbDataService');

// @desc    Get all orders with filters
// @route   GET /api/orders
const getOrders = async (req, res, next) => {
  try {
    const { status, search, startDate, endDate, page = 1, limit = 15 } = req.query;
    const result = await bb.getOrders({ status, search, startDate, endDate, page, limit });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
const getOrderById = async (req, res, next) => {
  try {
    const order = await bb.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    next(error);
  }
};

// @desc    Create order
// @route   POST /api/orders
const createOrder = async (req, res, next) => {
  try {
    const order = await bb.createOrderInBB(req.body);

    // Emit socket event for real-time notification
    try {
      const { getIO } = require('../socket/socketHandler');
      const io = getIO();
      io.emit('newOrder', order);
    } catch (e) { /* socket not available */ }

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await bb.updateOrderStatus(req.params.id, status);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Emit socket event
    try {
      const { getIO } = require('../socket/socketHandler');
      const io = getIO();
      io.emit('orderStatusUpdate', order);
    } catch (e) { /* socket not available */ }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

// @desc    Assign delivery partner (kept for compatibility)
// @route   PUT /api/orders/:id/assign-delivery
const assignDeliveryPartner = async (req, res, next) => {
  try {
    // For now, just return the order — delivery partner assignment
    // is not stored in BB's JSON format
    const order = await bb.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    next(error);
  }
};

module.exports = { getOrders, getOrderById, createOrder, updateOrderStatus, assignDeliveryPartner };
