const { body, validationResult } = require('express-validator');

const validateSignup = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const validateMenuItem = [
  body('name').trim().notEmpty().withMessage('Item name is required'),
  body('price').isNumeric().withMessage('Price must be a number').isFloat({ min: 0 }).withMessage('Price must be positive'),
  body('category').isIn(['Starters', 'Main Course', 'Desserts', 'Beverages', 'Snacks', 'Thali', 'Biryani', 'Chinese', 'South Indian', 'Pizza', 'Burger']).withMessage('Invalid category'),
];

const validateOrder = [
  body('customer').notEmpty().withMessage('Customer is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('totalAmount').isNumeric().withMessage('Total amount must be a number'),
];

const runValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
};

module.exports = { validateSignup, validateLogin, validateMenuItem, validateOrder, runValidation };
