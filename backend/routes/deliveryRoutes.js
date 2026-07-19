const express = require('express');
const router = express.Router();
const { getDeliveryPartners, createDeliveryPartner, updateDeliveryPartner, toggleAvailability } = require('../controllers/deliveryController');
const auth = require('../middleware/auth');

router.get('/', auth, getDeliveryPartners);
router.post('/', auth, createDeliveryPartner);
router.put('/:id', auth, updateDeliveryPartner);
router.patch('/:id/toggle', auth, toggleAvailability);

module.exports = router;
