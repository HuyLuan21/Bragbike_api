const { Report, Ride, Driver } = require('../models');

const createReport = async (req, res) => {
  const { ride_id, reason, description, evidence_url } = req.body;
  try {
    const ride = await Ride.findOne({ where: { id: ride_id, user_id: req.user.id, status: 'COMPLETED' } });
    if (!ride) return res.status(400).json({ message: 'Chuyến không hợp lệ' });

    await Report.create({ ride_id, reporter_id: req.user.id, driver_id: ride.driver_id, reason, description, evidence_url });
    res.status(201).json({ message: 'Gửi tố cáo thành công, admin sẽ xem xét' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const getMyReports = async (req, res) => {
  try {
    const { User } = require('../models');
    const reports = await Report.findAll({
      where:   { reporter_id: req.user.id },
      include: [{ model: Driver, as: 'driver', include: [{ model: User, as: 'user', attributes: ['full_name'] }] }],
      order:   [['created_at', 'DESC']],
    });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

module.exports = { createReport, getMyReports };
