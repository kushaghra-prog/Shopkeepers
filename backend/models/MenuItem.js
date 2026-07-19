const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: [true, 'Item name is required'], trim: true },
  description: { type: String, default: '' },
  price: { type: Number, required: [true, 'Price is required'], min: 0 },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Starters', 'Main Course', 'Desserts', 'Beverages', 'Snacks', 'Thali', 'Biryani', 'Chinese', 'South Indian', 'Pizza', 'Burger']
  },
  image: { type: String, default: '' },
  isVeg: { type: Boolean, default: true },
  isAvailable: { type: Boolean, default: true },
  preparationTime: { type: Number, default: 30 },
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);
