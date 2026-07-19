const express = require('express');
const router = express.Router();
const { getOrders, getOrderById, createOrder, updateOrderStatus, assignDeliveryPartner } = require('../controllers/orderController');
const auth = require('../middleware/auth');

router.get('/', auth, getOrders);
router.get('/:id', auth, getOrderById);
router.post('/', auth, createOrder);
router.put('/:id/status', auth, updateOrderStatus);
router.put('/:id/assign-delivery', auth, assignDeliveryPartner);

module.exports = router;
