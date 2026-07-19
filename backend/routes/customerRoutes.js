const express = require('express');
const router = express.Router();
const { getCustomers, getCustomerById, getCustomerOrders } = require('../controllers/customerController');
const auth = require('../middleware/auth');

router.get('/', auth, getCustomers);
router.get('/:id', auth, getCustomerById);
router.get('/:id/orders', auth, getCustomerOrders);

module.exports = router;
