const DeliveryPartner = require('../models/DeliveryPartner');

// @desc    Get all delivery partners
const getDeliveryPartners = async (req, res, next) => {
  try {
    const partners = await DeliveryPartner.find().populate('currentOrder', 'orderNumber status');
    res.json(partners);
  } catch (error) {
    next(error);
  }
};

// @desc    Create delivery partner
const createDeliveryPartner = async (req, res, next) => {
  try {
    const partner = await DeliveryPartner.create(req.body);
    res.status(201).json(partner);
  } catch (error) {
    next(error);
  }
};

// @desc    Update delivery partner
const updateDeliveryPartner = async (req, res, next) => {
  try {
    const partner = await DeliveryPartner.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!partner) return res.status(404).json({ message: 'Partner not found' });
    res.json(partner);
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle availability
const toggleAvailability = async (req, res, next) => {
  try {
    const partner = await DeliveryPartner.findById(req.params.id);
    if (!partner) return res.status(404).json({ message: 'Partner not found' });
    partner.isAvailable = !partner.isAvailable;
    if (!partner.isAvailable) partner.currentOrder = null;
    await partner.save();
    res.json(partner);
  } catch (error) {
    next(error);
  }
};

module.exports = { getDeliveryPartners, createDeliveryPartner, updateDeliveryPartner, toggleAvailability };
