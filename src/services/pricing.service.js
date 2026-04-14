// src/services/pricing.service.js
const createError = require("http-errors");
const { VehiclePricing, PeakHour } = require("../models");

const getAllPricing = async () => VehiclePricing.findAll();

const getPricingByType = async (vehicleType) => {
  const pricing = await VehiclePricing.findOne({
    where: { vehicle_type: vehicleType },
  });
  if (!pricing) throw createError(404, "Không tìm thấy loại xe");
  return pricing;
};

const getPeakHours = async () => {
  return PeakHour.findAll({
    where: { is_active: true },
    order: [["start_time", "ASC"]],
  });
};

module.exports = { getAllPricing, getPricingByType, getPeakHours };
