const express = require('express');
const router = express.Router();
const { getPayments, getEarnings, getPaymentSummary } = require('../controllers/paymentController');
const auth = require('../middleware/auth');

router.get('/', auth, getPayments);
router.get('/earnings', auth, getEarnings);
router.get('/summary', auth, getPaymentSummary);

module.exports = router;
