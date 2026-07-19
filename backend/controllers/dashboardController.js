const bb = require('../services/bbDataService');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
const getStats = async (req, res, next) => {
  try {
    const stats = await bb.getDashboardStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

// @desc    Get weekly sales data
// @route   GET /api/dashboard/weekly-sales
const getWeeklySales = async (req, res, next) => {
  try {
    const weeklyData = await bb.getWeeklySales();
    res.json(weeklyData);
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent orders
// @route   GET /api/dashboard/recent-orders
const getRecentOrders = async (req, res, next) => {
  try {
    const orders = await bb.getRecentOrders(10);
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats, getWeeklySales, getRecentOrders };
