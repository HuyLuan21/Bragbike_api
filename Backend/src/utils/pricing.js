const { sequelize } = require('../models');
const { isPeakHour } = require('./peakHour');

const calculateFare = async (vehicleType, distanceKm) => {
  const [rows] = await sequelize.query(
    'SELECT * FROM vehicle_pricing WHERE vehicle_type = :type LIMIT 1',
    { replacements: { type: vehicleType } }
  );
  if (!rows.length) throw new Error('Loại xe không hợp lệ');

  const p        = rows[0];
  const peakHour = await isPeakHour();

  const baseFare      = parseFloat(p.base_fare);
  const distanceFare  = parseFloat(p.price_per_km) * distanceKm;
  const subtotal      = baseFare + distanceFare;
  const peakSurcharge = peakHour ? subtotal * (parseFloat(p.peak_hour_multiplier) - 1) : 0;
  const totalPrice    = Math.max(subtotal + peakSurcharge, parseFloat(p.min_fare));

  return {
    base_fare:           Math.round(baseFare),
    distance_fare:       Math.round(distanceFare),
    peak_hour_surcharge: Math.round(peakSurcharge),
    total_price:         Math.round(totalPrice),
    is_peak_hour:        peakHour,
  };
};

module.exports = { calculateFare };
