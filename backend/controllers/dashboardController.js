const Order = require('../models/Order');
const mongoose = require('mongoose');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
const getStats = async (req, res, next) => {
  try {
    const restaurantId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalOrders, totalRevenue, pendingOrders, deliveredOrders, cancelledOrders, todayOrders] = await Promise.all([
      Order.countDocuments({ restaurant: restaurantId }),
      Order.aggregate([
        { $match: { restaurant: new mongoose.Types.ObjectId(restaurantId), status: 'Delivered' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Order.countDocuments({ restaurant: restaurantId, status: { $in: ['Pending', 'Accepted', 'Preparing'] } }),
      Order.countDocuments({ restaurant: restaurantId, status: 'Delivered' }),
      Order.countDocuments({ restaurant: restaurantId, status: { $in: ['Cancelled', 'Rejected'] } }),
      Order.aggregate([
        { $match: { restaurant: new mongoose.Types.ObjectId(restaurantId), createdAt: { $gte: today } } },
        { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } }
      ]),
    ]);

    res.json({
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      todaySales: todayOrders[0]?.count || 0,
      todayRevenue: todayOrders[0]?.revenue || 0,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get weekly sales data
// @route   GET /api/dashboard/weekly-sales
const getWeeklySales = async (req, res, next) => {
  try {
    const restaurantId = req.user._id;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const sales = await Order.aggregate([
      { $match: { restaurant: new mongoose.Types.ObjectId(restaurantId), createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dayOfWeek: '$createdAt' },
          orders: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyData = days.map((day, i) => {
      const found = sales.find(s => s._id === i + 1);
      return { day, orders: found?.orders || 0, revenue: found?.revenue || 0 };
    });

    res.json(weeklyData);
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent orders
// @route   GET /api/dashboard/recent-orders
const getRecentOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ restaurant: req.user._id })
      .populate('customer', 'name phone')
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats, getWeeklySales, getRecentOrders };
