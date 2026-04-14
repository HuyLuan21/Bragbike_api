const { Op } = require('sequelize');
const { sequelize } = require('../models');

const isPeakHour = async () => {
  const now         = new Date();
  const currentTime = now.toTimeString().slice(0, 8); // HH:MM:SS
  const currentDay  = now.getDay() === 0 ? 7 : now.getDay(); // 1=T2...7=CN

  const [results] = await sequelize.query(
    `SELECT id FROM peak_hours
     WHERE is_active = TRUE
       AND start_time <= :time AND end_time >= :time
       AND FIND_IN_SET(:day, days_of_week) > 0
     LIMIT 1`,
    { replacements: { time: currentTime, day: currentDay } }
  );
  return results.length > 0;
};

module.exports = { isPeakHour };
