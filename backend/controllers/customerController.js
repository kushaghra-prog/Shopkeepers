const bb = require('../services/bbDataService');

// @desc    Get all customers
// @route   GET /api/customers
const getCustomers = async (req, res, next) => {
  try {
    const { search } = req.query;
    const customers = await bb.getCustomers({ search });
    res.json(customers);
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer by ID
// @route   GET /api/customers/:id
const getCustomerById = async (req, res, next) => {
  try {
    const customers = await bb.getCustomers({});
    const customer = customers.find(c => c._id === req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer orders
// @route   GET /api/customers/:id/orders
const getCustomerOrders = async (req, res, next) => {
  try {
    const orders = await bb.getCustomerOrders(req.params.id);
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

module.exports = { getCustomers, getCustomerById, getCustomerOrders };
