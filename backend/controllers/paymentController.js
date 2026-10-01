const Payment = require('../models/Payment');
const mongoose = require('mongoose');

// @desc    Get all payments
// @route   GET /api/payments
const getPayments = async (req, res, next) => {
  try {
    const { method, status, startDate, endDate, page = 1, limit = 20 } = req.query;
    const query = { restaurant: req.user._id };
    if (method) query.paymentMethod = method;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) { const e = new Date(endDate); e.setHours(23,59,59,999); query.createdAt.$lte = e; }
    }

    const total = await Payment.countDocuments(query);
    const payments = await Payment.find(query)
      .populate('order', 'orderNumber status')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({ payments, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    next(error);
  }
};

// @desc    Get earnings summary
// @route   GET /api/payments/earnings
const getEarnings = async (req, res, next) => {
  try {
    const restaurantId = new mongoose.Types.ObjectId(req.user._id);
    const today = new Date(); today.setHours(0,0,0,0);
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [totalEarnings, monthlyEarnings, todayEarnings, pendingPayments, monthlyChart] = await Promise.all([
      Payment.aggregate([
        { $match: { restaurant: restaurantId, status: 'Completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Payment.aggregate([
        { $match: { restaurant: restaurantId, status: 'Completed', createdAt: { $gte: thisMonthStart } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Payment.aggregate([
        { $match: { restaurant: restaurantId, status: 'Completed', createdAt: { $gte: today } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Payment.aggregate([
        { $match: { restaurant: restaurantId, status: 'Pending' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Payment.aggregate([
        { $match: { restaurant: restaurantId, status: 'Completed' } },
        { $group: { _id: { $month: '$createdAt' }, earnings: { $sum: '$amount' } } },
        { $sort: { _id: 1 } }
      ])
    ]);

    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const chartData = months.map((month, i) => {
      const found = monthlyChart.find(m => m._id === i + 1);
      return { month, earnings: found?.earnings || 0 };
    });

    res.json({
      total: totalEarnings[0]?.total || 0,
      thisMonth: monthlyEarnings[0]?.total || 0,
      today: todayEarnings[0]?.total || 0,
      pending: pendingPayments[0]?.total || 0,
      monthlyChart: chartData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment summary (COD vs Online)
// @route   GET /api/payments/summary
const getPaymentSummary = async (req, res, next) => {
  try {
    const summary = await Payment.aggregate([
      { $match: { restaurant: new mongoose.Types.ObjectId(req.user._id) } },
      { $group: { _id: '$paymentMethod', total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);
    const result = { COD: { total: 0, count: 0 }, Online: { total: 0, count: 0 } };
    summary.forEach(s => { result[s._id] = { total: s.total, count: s.count }; });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = { getPayments, getEarnings, getPaymentSummary };
