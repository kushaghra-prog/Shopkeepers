const express = require('express');
const router = express.Router();
const { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem, toggleAvailability } = require('../controllers/menuController');
const auth = require('../middleware/auth');

// No multer needed — BB uses URL-based images, not file uploads
router.get('/', auth, getMenuItems);
router.post('/', auth, createMenuItem);
router.put('/:id', auth, updateMenuItem);
router.delete('/:id', auth, deleteMenuItem);
router.patch('/:id/toggle', auth, toggleAvailability);

module.exports = router;
