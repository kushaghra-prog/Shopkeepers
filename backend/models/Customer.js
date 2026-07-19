const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Customer name is required'], trim: true },
  email: { type: String, default: '' },
  phone: { type: String, required: [true, 'Phone number is required'] },
  address: { type: String, default: '' },
  totalOrders: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  lastOrderDate: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
