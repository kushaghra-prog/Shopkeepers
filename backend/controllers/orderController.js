const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Payment = require('../models/Payment');
const { getIO } = require('../socket/socketHandler');

// @desc    Get all orders with filters
// @route   GET /api/orders
const getOrders = async (req, res, next) => {
  try {
    const { status, search, startDate, endDate, page = 1, limit = 20 } = req.query;
    const query = { restaurant: req.user._id };

    if (status && status !== 'All') query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    if (search) {
      const customers = await Customer.find({
        name: { $regex: search, $options: 'i' }
      }).select('_id');
      const customerIds = customers.map(c => c._id);
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { customer: { $in: customerIds } }
      ];
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('customer', 'name phone address')
      .populate('deliveryPartner', 'name phone')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({
      orders,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer')
      .populate('deliveryPartner')
      .populate('items.menuItem', 'image isVeg');
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
    const { customer: customerId, items, totalAmount, paymentMethod, deliveryAddress, deliveryInstructions } = req.body;

    const order = await Order.create({
      restaurant: req.user._id,
      customer: customerId,
      items,
      totalAmount,
      paymentMethod: paymentMethod || 'COD',
      deliveryAddress,
      deliveryInstructions,
      timeline: [{ status: 'Pending', timestamp: new Date() }]
    });

    // Update customer stats
    await Customer.findByIdAndUpdate(customerId, {
      $inc: { totalOrders: 1, totalSpent: totalAmount },
      lastOrderDate: new Date()
    });

    // Create payment record
    await Payment.create({
      order: order._id,
      restaurant: req.user._id,
      amount: totalAmount,
      paymentMethod: paymentMethod || 'COD',
      status: paymentMethod === 'Online' ? 'Completed' : 'Pending',
      transactionId: paymentMethod === 'Online' ? `TXN${Date.now()}` : ''
    });

    const populatedOrder = await Order.findById(order._id).populate('customer', 'name phone address');

    try {
      const io = getIO();
      io.to(`restaurant_${req.user._id}`).emit('newOrder', populatedOrder);
    } catch (e) { /* socket not available */ }

    res.status(201).json(populatedOrder);
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    order.timeline.push({ status, timestamp: new Date() });

    if (status === 'Delivered') {
      order.paymentStatus = 'Paid';
      await Payment.findOneAndUpdate({ order: order._id }, { status: 'Completed' });
    }

    await order.save();
    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'name phone address')
      .populate('deliveryPartner', 'name phone');

    try {
      const io = getIO();
      io.to(`restaurant_${req.user._id}`).emit('orderStatusUpdate', populatedOrder);
    } catch (e) { /* socket not available */ }

    res.json(populatedOrder);
  } catch (error) {
    next(error);
  }
};

// @desc    Assign delivery partner
// @route   PUT /api/orders/:id/assign-delivery
const assignDeliveryPartner = async (req, res, next) => {
  try {
    const { deliveryPartnerId, estimatedDeliveryTime } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { deliveryPartner: deliveryPartnerId, estimatedDeliveryTime },
      { new: true }
    ).populate('customer', 'name phone address').populate('deliveryPartner', 'name phone');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    const DeliveryPartner = require('../models/DeliveryPartner');
    await DeliveryPartner.findByIdAndUpdate(deliveryPartnerId, {
      currentOrder: order._id,
      isAvailable: false
    });

    try {
      const io = getIO();
      io.to(`restaurant_${req.user._id}`).emit('orderStatusUpdate', order);
    } catch (e) { /* socket not available */ }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

module.exports = { getOrders, getOrderById, createOrder, updateOrderStatus, assignDeliveryPartner };
