const bb = require('../services/bbDataService');

// @desc    Get all payments
// @route   GET /api/payments
const getPayments = async (req, res, next) => {
  try {
    const { method, status, startDate, endDate, page = 1, limit = 20 } = req.query;
    const result = await bb.getPayments({ method, status, startDate, endDate, page, limit });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// @desc    Get earnings summary
// @route   GET /api/payments/earnings
const getEarnings = async (req, res, next) => {
  try {
    const earnings = await bb.getEarnings();
    res.json(earnings);
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment summary (COD vs Online)
// @route   GET /api/payments/summary
const getPaymentSummary = async (req, res, next) => {
  try {
    const summary = await bb.getPaymentSummary();
    res.json(summary);
  } catch (error) {
    next(error);
  }
};

module.exports = { getPayments, getEarnings, getPaymentSummary };
