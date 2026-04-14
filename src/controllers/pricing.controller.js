// src/controllers/pricing.controller.js
const pricingService = require("../services/pricing.service");

const getAllPricing = async (req, res, next) => {
  try {
    res.json(await pricingService.getAllPricing());
  } catch (e) {
    next(e);
  }
};
const getPricingByType = async (req, res, next) => {
  try {
    res.json(await pricingService.getPricingByType(req.params.vehicleType));
  } catch (e) {
    next(e);
  }
};
const getPeakHours = async (req, res, next) => {
  try {
    res.json(await pricingService.getPeakHours());
  } catch (e) {
    next(e);
  }
};

module.exports = { getAllPricing, getPricingByType, getPeakHours };
