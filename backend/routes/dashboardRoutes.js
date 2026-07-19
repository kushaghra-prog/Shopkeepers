const express = require('express');
const router = express.Router();
const { getStats, getWeeklySales, getRecentOrders } = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

router.get('/stats', auth, getStats);
router.get('/weekly-sales', auth, getWeeklySales);
router.get('/recent-orders', auth, getRecentOrders);

module.exports = router;
