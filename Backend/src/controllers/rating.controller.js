const { Rating, Ride, Driver } = require('../models');

const createRating = async (req, res) => {
  const { ride_id, stars, comment } = req.body;
  if (!ride_id || !stars) return res.status(400).json({ message: 'Thiếu thông tin' });
  try {
    const ride = await Ride.findOne({ where: { id: ride_id, user_id: req.user.id, status: 'COMPLETED' } });
    if (!ride) return res.status(400).json({ message: 'Chuyến không hợp lệ để đánh giá' });
    if (!ride.driver_id) return res.status(400).json({ message: 'Chuyến không có tài xế' });

    await Rating.create({ ride_id, user_id: req.user.id, driver_id: ride.driver_id, stars, comment });

    // Cập nhật avg_rating
    const avg = await Rating.findOne({
      where:      { driver_id: ride.driver_id },
      attributes: [[require('sequelize').fn('AVG', require('sequelize').col('stars')), 'avg']],
      raw: true,
    });
    await Driver.update({ avg_rating: parseFloat(avg.avg).toFixed(2) }, { where: { id: ride.driver_id } });

    res.status(201).json({ message: 'Đánh giá thành công' });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError')
      return res.status(409).json({ message: 'Chuyến này đã được đánh giá' });
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const getDriverRatings = async (req, res) => {
  try {
    const { User } = require('../models');
    const ratings = await Rating.findAll({
      where:   { driver_id: req.params.driverId },
      include: [{ model: User, as: 'user', attributes: ['full_name'] }],
      order:   [['created_at', 'DESC']],
    });
    res.json(ratings);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

module.exports = { createRating, getDriverRatings };
