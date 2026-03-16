const { Driver, Ride, User } = require('../models');

const applyDriver = async (req, res) => {
  const { id_card_number, id_card_front_url, id_card_back_url,
          driver_license_number, driver_license_url,
          vehicle_registration_url, vehicle_insurance_url } = req.body;
  try {
    const { sequelize } = require('../models');
    const [pending] = await sequelize.query(
      'SELECT id FROM driver_applications WHERE user_id = ? AND status = "PENDING"',
      { replacements: [req.user.id] }
    );
    if (pending.length) return res.status(409).json({ message: 'Đơn đăng ký đang chờ duyệt' });

    await sequelize.query(
      `INSERT INTO driver_applications
        (user_id, id_card_number, id_card_front_url, id_card_back_url,
         driver_license_number, driver_license_url, vehicle_registration_url, vehicle_insurance_url)
       VALUES (?,?,?,?,?,?,?,?)`,
      { replacements: [req.user.id, id_card_number, id_card_front_url, id_card_back_url,
          driver_license_number, driver_license_url, vehicle_registration_url, vehicle_insurance_url] }
    );
    res.status(201).json({ message: 'Nộp đơn thành công, chờ admin duyệt' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const getMyProfile = async (req, res) => {
  try {
    const driver = await Driver.findOne({ where: { user_id: req.user.id } });
    if (!driver) return res.status(404).json({ message: 'Chưa có hồ sơ tài xế' });
    res.json(driver);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const toggleOnline = async (req, res) => {
  try {
    const driver = await Driver.findOne({ where: { user_id: req.user.id } });
    if (!driver) return res.status(404).json({ message: 'Chưa có hồ sơ tài xế' });
    if (driver.is_locked) return res.status(403).json({ message: 'Tài khoản đang bị khóa' });

    driver.is_online = !driver.is_online;
    await driver.save();
    res.json({ message: driver.is_online ? 'Đã bật nhận chuyến' : 'Đã tắt nhận chuyến', is_online: driver.is_online });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const updateLocation = async (req, res) => {
  const { lat, lng } = req.body;
  try {
    await Driver.update({ lat, lng }, { where: { user_id: req.user.id } });
    res.json({ message: 'Cập nhật vị trí thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const getAvailableRides = async (req, res) => {
  try {
    const driver = await Driver.findOne({ where: { user_id: req.user.id } });
    if (!driver) return res.status(404).json({ message: 'Không tìm thấy tài xế' });
    if (driver.is_locked) return res.status(403).json({ message: 'Tài khoản đang bị khóa' });

    const rides = await Ride.findAll({
      where:   { status: 'SEARCHING', vehicle_type: driver.vehicle_type },
      include: [{ model: User, as: 'user', attributes: ['full_name', 'phone'] }],
      order:   [['created_at', 'ASC']],
    });
    res.json(rides);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

module.exports = { applyDriver, getMyProfile, toggleOnline, updateLocation, getAvailableRides };
