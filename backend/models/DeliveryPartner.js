const mongoose = require('mongoose');

const deliveryPartnerSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true },
  phone: { type: String, required: [true, 'Phone is required'] },
  vehicleNumber: { type: String, default: '' },
  vehicleType: { type: String, enum: ['Bike', 'Scooter', 'Bicycle', 'Car'], default: 'Bike' },
  isAvailable: { type: Boolean, default: true },
  currentOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
  totalDeliveries: { type: Number, default: 0 },
  rating: { type: Number, default: 4.5, min: 0, max: 5 },
}, { timestamps: true });

module.exports = mongoose.model('DeliveryPartner', deliveryPartnerSchema);
